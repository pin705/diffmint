import * as vscode from 'vscode';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  buildWebUrl,
  getDiffmintPaths,
  normalizeWebBaseUrl,
  readDiffmintConfig,
  readDiffmintHistory,
  renderResultHtml
} from './diffmint';

const execFileAsync = promisify(execFile);

interface LatestResult {
  title: string;
  body: string;
  updatedAt: string;
}

class DiffmintTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  constructor(private readonly loadItems: () => vscode.TreeItem[] | Promise<vscode.TreeItem[]>) {}

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(item: vscode.TreeItem): vscode.TreeItem {
    return item;
  }

  getChildren(): Promise<vscode.TreeItem[]> {
    return Promise.resolve(this.loadItems());
  }
}

function getWorkspaceFolder(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function getCliPath(): string {
  return vscode.workspace.getConfiguration('diffmint').get<string>('cliPath')?.trim() || 'dm';
}

function getWebBaseUrl(): string {
  return normalizeWebBaseUrl(
    vscode.workspace.getConfiguration('diffmint').get<string>('webBaseUrl')
  );
}

async function runCli(args: string[]): Promise<string> {
  const cwd = getWorkspaceFolder();
  const { stdout, stderr } = await execFileAsync(getCliPath(), args, {
    cwd,
    env: {
      ...process.env,
      DIFFMINT_API_BASE_URL: getWebBaseUrl()
    }
  });
  return [stdout, stderr].filter(Boolean).join('\n').trim();
}

function createItem(
  label: string,
  options: {
    description?: string;
    tooltip?: string;
    command?: vscode.Command;
    iconPath?: vscode.ThemeIcon;
  } = {}
): vscode.TreeItem {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
  item.description = options.description;
  item.tooltip = options.tooltip;
  item.command = options.command;
  item.iconPath = options.iconPath;
  return item;
}

function showResultsPanel(title: string, body: string): void {
  const panel = vscode.window.createWebviewPanel(
    'diffmint-results',
    title,
    vscode.ViewColumn.Beside,
    {
      enableFindWidget: true
    }
  );

  panel.webview.html = renderResultHtml(title, body);
}

function updateStatusBar(item: vscode.StatusBarItem): void {
  const config = readDiffmintConfig(getDiffmintPaths().configPath);

  if (!config?.workspace) {
    item.text = '$(plug) Diffmint: Sign In';
    item.tooltip = 'Sign in to Diffmint';
    item.command = 'diffmint.signIn';
    return;
  }

  item.text = `$(plug) Diffmint: ${config.workspace.name}`;
  item.tooltip = `Workspace ${config.workspace.name}`;
  item.command = 'diffmint.openDashboard';
}

async function runAndShow(
  title: string,
  args: string[],
  latestResultRef: { current: LatestResult | null },
  providers: DiffmintTreeProvider[],
  statusBar: vscode.StatusBarItem,
  options: { requireWorkspace?: boolean } = {}
) {
  if (options.requireWorkspace && !getWorkspaceFolder()) {
    void vscode.window.showWarningMessage('Open a workspace folder before running this command.');
    return;
  }

  try {
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: false
      },
      async () => runCli(args)
    );

    latestResultRef.current = {
      title,
      body: result || 'No output returned from Diffmint.',
      updatedAt: new Date().toISOString()
    };
    providers.forEach((provider) => provider.refresh());
    updateStatusBar(statusBar);
    showResultsPanel(title, result || 'No output returned from Diffmint.');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    const message = error instanceof Error ? error.message : String(error);

    if (nodeError?.code === 'ENOENT') {
      const action = await vscode.window.showErrorMessage(
        `Diffmint CLI was not found at "${getCliPath()}".`,
        'Open Install Guide'
      );

      if (action === 'Open Install Guide') {
        await vscode.env.openExternal(vscode.Uri.parse(buildWebUrl(getWebBaseUrl(), '/install')));
      }

      return;
    }

    void vscode.window.showErrorMessage(`Diffmint command failed: ${message}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const latestResultRef: { current: LatestResult | null } = {
    current: null
  };
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.show();

  const resultsProvider = new DiffmintTreeProvider(() => {
    if (!latestResultRef.current) {
      return [
        createItem('No results yet', {
          description: 'Run a review or history command',
          iconPath: new vscode.ThemeIcon('history')
        })
      ];
    }

    return [
      createItem(latestResultRef.current.title, {
        description: new Date(latestResultRef.current.updatedAt).toLocaleString(),
        command: {
          command: 'diffmint.showLatestResult',
          title: 'Show Latest Result'
        },
        iconPath: new vscode.ThemeIcon('sparkle')
      })
    ];
  });

  const historyProvider = new DiffmintTreeProvider(() => {
    const history = readDiffmintHistory(getDiffmintPaths().historyPath, 5);

    if (history.length === 0) {
      return [
        createItem('No local history yet', {
          description: 'Run Diffmint Review or History',
          iconPath: new vscode.ThemeIcon('history')
        })
      ];
    }

    return history.map((entry) =>
      createItem(entry.traceId ?? 'Review session', {
        description:
          entry.summary ?? `${entry.commandSource ?? 'cli'} · ${entry.status ?? 'unknown'}`,
        tooltip: entry.summary ?? entry.traceId,
        command: {
          command: 'diffmint.openHistory',
          title: 'Open Review History'
        },
        iconPath: new vscode.ThemeIcon('history')
      })
    );
  });

  const workspaceProvider = new DiffmintTreeProvider(() => {
    const config = readDiffmintConfig(getDiffmintPaths().configPath);

    if (!config?.workspace) {
      return [
        createItem('Not signed in', {
          description: 'Run Sign In / Switch Workspace',
          command: {
            command: 'diffmint.signIn',
            title: 'Sign In / Switch Workspace'
          },
          iconPath: new vscode.ThemeIcon('account')
        })
      ];
    }

    const syncLabel = config.syncDefaults?.cloudSyncEnabled === false ? 'Local-only' : 'Cloud sync';

    return [
      createItem(config.workspace.name, {
        description: config.workspace.slug,
        command: {
          command: 'diffmint.openDashboard',
          title: 'Open Dashboard'
        },
        iconPath: new vscode.ThemeIcon('organization')
      }),
      createItem(`Provider: ${config.provider ?? 'unknown'}`, {
        iconPath: new vscode.ThemeIcon('server')
      }),
      createItem(`Policy: ${config.policyVersionId ?? 'not synced'}`, {
        iconPath: new vscode.ThemeIcon('shield')
      }),
      createItem(syncLabel, {
        description: config.signedInAt
          ? `Signed in ${new Date(config.signedInAt).toLocaleString()}`
          : undefined,
        iconPath: new vscode.ThemeIcon('sync')
      })
    ];
  });

  const providers = [resultsProvider, historyProvider, workspaceProvider];
  updateStatusBar(statusBar);

  context.subscriptions.push(
    statusBar,
    vscode.window.registerTreeDataProvider('diffmint.results', resultsProvider),
    vscode.window.registerTreeDataProvider('diffmint.history', historyProvider),
    vscode.window.registerTreeDataProvider('diffmint.workspace', workspaceProvider),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('diffmint')) {
        providers.forEach((provider) => provider.refresh());
        updateStatusBar(statusBar);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('diffmint.reviewCurrentChanges', async () => {
      await runAndShow('Diffmint Review', ['review'], latestResultRef, providers, statusBar, {
        requireWorkspace: true
      });
    }),
    vscode.commands.registerCommand('diffmint.reviewStagedChanges', async () => {
      await runAndShow(
        'Diffmint Review (Staged)',
        ['review', '--staged'],
        latestResultRef,
        providers,
        statusBar,
        { requireWorkspace: true }
      );
    }),
    vscode.commands.registerCommand('diffmint.reviewSelectedFiles', async (uri?: vscode.Uri) => {
      const targets = uri?.fsPath
        ? [uri.fsPath]
        : vscode.window.activeTextEditor
          ? [vscode.window.activeTextEditor.document.fileName]
          : [];
      if (targets.length === 0) {
        void vscode.window.showWarningMessage('Select or open a file to review it.');
        return;
      }
      await runAndShow(
        'Diffmint Review (Selected Files)',
        ['review', '--files', ...targets],
        latestResultRef,
        providers,
        statusBar,
        { requireWorkspace: true }
      );
    }),
    vscode.commands.registerCommand('diffmint.explainCurrentFile', async () => {
      const fileName = vscode.window.activeTextEditor?.document.fileName;
      if (!fileName) {
        void vscode.window.showWarningMessage('Open a file to explain it.');
        return;
      }
      await runAndShow(
        'Diffmint Explain',
        ['explain', fileName],
        latestResultRef,
        providers,
        statusBar,
        {
          requireWorkspace: true
        }
      );
    }),
    vscode.commands.registerCommand('diffmint.generateTests', async () => {
      const fileName = vscode.window.activeTextEditor?.document.fileName;
      if (!fileName) {
        void vscode.window.showWarningMessage('Open a file to generate tests.');
        return;
      }
      await runAndShow(
        'Diffmint Tests',
        ['tests', fileName],
        latestResultRef,
        providers,
        statusBar,
        {
          requireWorkspace: true
        }
      );
    }),
    vscode.commands.registerCommand('diffmint.openHistory', async () => {
      await runAndShow('Diffmint History', ['history'], latestResultRef, providers, statusBar);
    }),
    vscode.commands.registerCommand('diffmint.openTeamRules', async () => {
      await vscode.env.openExternal(
        vscode.Uri.parse(buildWebUrl(getWebBaseUrl(), '/dashboard/policies'))
      );
    }),
    vscode.commands.registerCommand('diffmint.signIn', async () => {
      await runAndShow(
        'Diffmint Sign In',
        ['auth', 'login'],
        latestResultRef,
        providers,
        statusBar
      );
    }),
    vscode.commands.registerCommand('diffmint.openDashboard', async () => {
      await vscode.env.openExternal(
        vscode.Uri.parse(buildWebUrl(getWebBaseUrl(), '/dashboard/overview'))
      );
    }),
    vscode.commands.registerCommand('diffmint.refreshViews', async () => {
      providers.forEach((provider) => provider.refresh());
      updateStatusBar(statusBar);
    }),
    vscode.commands.registerCommand('diffmint.showLatestResult', async () => {
      if (!latestResultRef.current) {
        void vscode.window.showInformationMessage('No Diffmint result is available yet.');
        return;
      }

      showResultsPanel(latestResultRef.current.title, latestResultRef.current.body);
    })
  );
}

export function deactivate() {
  // No-op for scaffold release.
}
