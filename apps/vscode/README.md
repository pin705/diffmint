# Diffmint VS Code Extension

The Diffmint extension is a thin companion to the local `dm` CLI.

## What it does

- runs review, explain, tests, and history commands through the local CLI
- shows lightweight Diffmint views in the activity bar
- opens the web control plane for policies, docs, and workspace context

## Settings

- `diffmint.cliPath`: path to the `dm` binary
- `diffmint.webBaseUrl`: base URL for the Diffmint control plane

## Local build

```bash
pnpm --dir apps/vscode build
```

## Package a VSIX

```bash
pnpm --dir apps/vscode package
```
