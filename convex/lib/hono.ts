import { OpenAPIHono } from '@hono/zod-openapi';
import type { ActionCtx } from '../_generated/server';

export type AppEnv = {
	Bindings: { [K in keyof ActionCtx]: ActionCtx[K] };
	Variables: Record<never, never>;
};

export const app = new OpenAPIHono<AppEnv>();
