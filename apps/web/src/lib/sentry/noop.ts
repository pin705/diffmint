export interface NodeOptions {
  [key: string]: unknown;
}

export interface EdgeOptions {
  [key: string]: unknown;
}

export function init(_options?: NodeOptions | EdgeOptions): void {}

export function captureException(_error: unknown): void {}

export function captureRequestError(..._args: unknown[]): void {}

export function captureRouterTransitionStart(..._args: unknown[]): void {}
