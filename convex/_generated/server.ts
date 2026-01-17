/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Generated stub types - this file will be overwritten when running `npx convex dev`
 * Run `npx convex dev` to connect to your Convex backend and generate proper types.
 */

export type QueryCtx = {
  db: any;
  storage: any;
  auth: any;
};

export type MutationCtx = {
  db: any;
  storage: any;
  auth: any;
  scheduler: any;
};

export type ActionCtx = {
  runQuery: any;
  runMutation: any;
  runAction: any;
  storage: any;
  auth: any;
  scheduler: any;
};

export function query<Args, Output>(config: {
  args: Args;
  handler: (ctx: QueryCtx, args: any) => Promise<Output> | Output;
}): any {
  return config;
}

export function mutation<Args, Output>(config: {
  args: Args;
  handler: (ctx: MutationCtx, args: any) => Promise<Output> | Output;
}): any {
  return config;
}

export function action<Args, Output>(config: {
  args: Args;
  handler: (ctx: ActionCtx, args: any) => Promise<Output> | Output;
}): any {
  return config;
}

export function internalQuery<Args, Output>(config: {
  args: Args;
  handler: (ctx: QueryCtx, args: any) => Promise<Output> | Output;
}): any {
  return config;
}

export function internalMutation<Args, Output>(config: {
  args: Args;
  handler: (ctx: MutationCtx, args: any) => Promise<Output> | Output;
}): any {
  return config;
}

export function internalAction<Args, Output>(config: {
  args: Args;
  handler: (ctx: ActionCtx, args: any) => Promise<Output> | Output;
}): any {
  return config;
}

export type HttpActionCtx = {
  runQuery: any;
  runMutation: any;
  runAction: any;
  storage: any;
  auth: any;
};

export function httpAction(
  handler: (ctx: HttpActionCtx, request: Request) => Promise<Response>
): any {
  return handler;
}
