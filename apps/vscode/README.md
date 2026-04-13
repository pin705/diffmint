# Diffmint VS Code Extension

The Diffmint extension is a thin companion to the local `dm` CLI.

## What it does

- runs review, explain, tests, and history commands through the local CLI
- shows grouped Diffmint views in the activity bar for quick actions, findings, history, results, and workspace state
- opens the latest review as editor diagnostics and a dedicated Findings list so you can jump straight to file and line
- supports history search and compare flows without leaving VS Code
- opens the web control plane for policies, docs, and workspace context

## Settings

- `diffmint.cliPath`: path to the `dm` binary
- `diffmint.webBaseUrl`: base URL for the Diffmint control plane

## Expected local setup

The extension delegates all execution to the local CLI. Build and verify the CLI first, then point
VS Code at it with `diffmint.cliPath` if `dm` is not already on your PATH.

Recent UX additions:

- `Quick Actions` for sign-in, review, history, compare, and doctor flows
- `Findings` tree items that open the reported file and line
- grouped review webviews with scope, severity, findings, and code excerpts
- history search and side-by-side compare panels for local session triage

## Local build

```bash
pnpm --dir apps/vscode build
```

## Package a VSIX

```bash
pnpm --dir apps/vscode package
```
