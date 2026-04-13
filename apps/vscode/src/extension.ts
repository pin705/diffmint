import * as vscode from 'vscode';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  buildWebUrl,
  type DiffmintHistoryEntry,
  getDiffmintPaths,
  normalizeWebBaseUrl,
  readDiffmintConfig,
  readDiffmintHistory,
  renderResultHtml,
  tryParseJson
} from './diffmint';
import {
  renderDoctorChecksHtml,
  renderHistoryHtml,
  renderPlainTextHtml,
  renderReviewSessionHtml,
  renderWorkspaceSummaryHtml
} from './render';
import type { DoctorCheckView, ReviewSessionView } from './types';

const execFileAsync = promisify(execFile);

interface LatestResult {
  title: string;
  body: string;
  updatedAt: string;
  html?: string;
}

interface RenderedResult {
  body: string;
  html?: string;
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

function showResultsPanel(result: LatestResult): void {
  const panel = vscode.window.createWebviewPanel(
    'diffmint-results',
    result.title,
    vscode.ViewColumn.Beside,
    {
      enableFindWidget: true
    }
  );

  panel.webview.html = result.html ?? renderResultHtml(result.title, result.body);
}

function truncateText(value: string, maxLength = 84): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
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

function renderReviewResult(raw: string): RenderedResult {
  const session = tryParseJson<ReviewSessionView>(raw);

  if (!session) {
    return {
      body: raw || 'No output returned from Diffmint.',
      html: renderPlainTextHtml(
        'Diffmint Review',
        raw || 'No output returned from Diffmint.',
        'The review result could not be parsed as structured JSON, so the raw CLI output is shown.'
      )
    };
  }

  return {
    body: session.summary,
    html: renderReviewSessionHtml(session)
  };
}

function renderHistoryResult(raw: string): RenderedResult {
  const history = tryParseJson<DiffmintHistoryEntry[]>(raw);

  if (!history) {
    return {
      body: raw || 'No output returned from Diffmint.',
      html: renderPlainTextHtml(
        'Diffmint History',
        raw || 'No output returned from Diffmint.',
        'The history payload could not be parsed, so the raw CLI output is shown.'
      )
    };
  }

  return {
    body: `${history.length} review session(s)`,
    html: renderHistoryHtml(history)
  };
}

function renderDoctorResult(raw: string): RenderedResult {
  const checks = tryParseJson<DoctorCheckView[]>(raw);

  if (!checks) {
    return {
      body: raw || 'No output returned from Diffmint.',
      html: renderPlainTextHtml(
        'Diffmint Doctor',
        raw || 'No output returned from Diffmint.',
        'The doctor payload could not be parsed, so the raw CLI output is shown.'
      )
    };
  }

  return {
    body: `${checks.length} runtime check(s)`,
    html: renderDoctorChecksHtml(checks)
  };
}

function renderSignInResult(raw: string): RenderedResult {
  const config = readDiffmintConfig(getDiffmintPaths().configPath);

  return {
    body: config?.workspace ? `Signed in to ${config.workspace.name}` : raw,
    html: renderWorkspaceSummaryHtml(config, raw || 'No output returned from Diffmint.')
  };
}

async function runAndShow(
  title: string,
  args: string[],
  latestResultRef: { current: LatestResult | null },
  providers: DiffmintTreeProvider[],
  statusBar: vscode.StatusBarItem,
  options: {
    requireWorkspace?: boolean;
    render?: (raw: string) => RenderedResult;
  } = {}
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

    const rendered = options.render
      ? options.render(result)
      : {
          body: result || 'No output returned from Diffmint.'
        };

    latestResultRef.current = {
      title,
      body: rendered.body || 'No output returned from Diffmint.',
      html: rendered.html,
      updatedAt: new Date().toISOString()
    };
    providers.forEach((provider) => provider.refresh());
    updateStatusBar(statusBar);
    showResultsPanel(latestResultRef.current);
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
        description: truncateText(latestResultRef.current.body),
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
        description: entry.severityCounts
          ? `H${entry.severityCounts.high ?? 0} M${entry.severityCounts.medium ?? 0} · ${truncateText(
              entry.summary ?? `${entry.commandSource ?? 'cli'} · ${entry.status ?? 'unknown'}`
            )}`
          : (entry.summary ?? `${entry.commandSource ?? 'cli'} · ${entry.status ?? 'unknown'}`),
        tooltip: entry.summary ?? entry.traceId,
        command: {
          command: 'diffmint.openHistory',
          title: 'Open Review History'
        },
        iconPath: new vscode.ThemeIcon('history')
      })
    );
  });

  const actionsProvider = new DiffmintTreeProvider(() => [
    createItem('Sign In / Switch Workspace', {
      description: 'Connect the local CLI to the configured control plane',
      command: {
        command: 'diffmint.signIn',
        title: 'Sign In / Switch Workspace'
      },
      iconPath: new vscode.ThemeIcon('plug')
    }),
    createItem('Review Current Changes', {
      description: 'Run the default Diffmint review for the current working tree',
      command: {
        command: 'diffmint.reviewCurrentChanges',
        title: 'Review Current Changes'
      },
      iconPath: new vscode.ThemeIcon('sparkle')
    }),
    createItem('Review Staged Changes', {
      description: 'Limit the review to staged files',
      command: {
        command: 'diffmint.reviewStagedChanges',
        title: 'Review Staged Changes'
      },
      iconPath: new vscode.ThemeIcon('git-commit')
    }),
    createItem('Open Review History', {
      description: 'Inspect the grouped local and synced session list',
      command: {
        command: 'diffmint.openHistory',
        title: 'Open Review History'
      },
      iconPath: new vscode.ThemeIcon('history')
    }),
    createItem('Run Doctor', {
      description: 'Check runtime, auth, and control-plane readiness',
      command: {
        command: 'diffmint.runDoctor',
        title: 'Run Doctor'
      },
      iconPath: new vscode.ThemeIcon('beaker')
    }),
    createItem('Open Team Rules', {
      description: 'Jump to policy configuration in the control plane',
      command: {
        command: 'diffmint.openTeamRules',
        title: 'Open Team Rules'
      },
      iconPath: new vscode.ThemeIcon('shield')
    })
  ]);

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

  const providers = [resultsProvider, historyProvider, workspaceProvider, actionsProvider];
  updateStatusBar(statusBar);

  context.subscriptions.push(
    statusBar,
    vscode.window.registerTreeDataProvider('diffmint.results', resultsProvider),
    vscode.window.registerTreeDataProvider('diffmint.history', historyProvider),
    vscode.window.registerTreeDataProvider('diffmint.workspace', workspaceProvider),
    vscode.window.registerTreeDataProvider('diffmint.actions', actionsProvider),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('diffmint')) {
        providers.forEach((provider) => provider.refresh());
        updateStatusBar(statusBar);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('diffmint.reviewCurrentChanges', async () => {
      await runAndShow(
        'Diffmint Review',
        ['review', '--json'],
        latestResultRef,
        providers,
        statusBar,
        {
          requireWorkspace: true,
          render: renderReviewResult
        }
      );
    }),
    vscode.commands.registerCommand('diffmint.reviewStagedChanges', async () => {
      await runAndShow(
        'Diffmint Review (Staged)',
        ['review', '--staged', '--json'],
        latestResultRef,
        providers,
        statusBar,
        {
          requireWorkspace: true,
          render: renderReviewResult
        }
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
        ['review', '--files', ...targets, '--json'],
        latestResultRef,
        providers,
        statusBar,
        {
          requireWorkspace: true,
          render: renderReviewResult
        }
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
          requireWorkspace: true,
          render: (raw) => ({
            body: raw || 'No output returned from Diffmint.',
            html: renderPlainTextHtml(
              'Diffmint Explain',
              raw || 'No output returned from Diffmint.',
              'The local CLI analyzed the current file and grouped the explanation into terminal-friendly sections.'
            )
          })
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
          requireWorkspace: true,
          render: (raw) => ({
            body: raw || 'No output returned from Diffmint.',
            html: renderPlainTextHtml(
              'Diffmint Tests',
              raw || 'No output returned from Diffmint.',
              'The local CLI produced a grouped test plan for the current file.'
            )
          })
        }
      );
    }),
    vscode.commands.registerCommand('diffmint.runDoctor', async () => {
      await runAndShow(
        'Diffmint Doctor',
        ['doctor', '--json'],
        latestResultRef,
        providers,
        statusBar,
        {
          render: renderDoctorResult
        }
      );
    }),
    vscode.commands.registerCommand('diffmint.openHistory', async () => {
      await runAndShow(
        'Diffmint History',
        ['history', '--json'],
        latestResultRef,
        providers,
        statusBar,
        {
          render: renderHistoryResult
        }
      );
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
        statusBar,
        {
          render: renderSignInResult
        }
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

      showResultsPanel(latestResultRef.current);
    })
  );
}

export function deactivate() {
  // No-op for scaffold release.
}
