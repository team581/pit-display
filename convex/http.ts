import { HttpRouterWithHono } from 'convex-helpers/server/hono';
import type { ActionCtx } from './_generated/server';
import './frcNexus';
import { app } from './lib/hono';

export default new HttpRouterWithHono<ActionCtx>(app);
