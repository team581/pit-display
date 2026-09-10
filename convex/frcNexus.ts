import { createRoute, z } from '@hono/zod-openapi';
import { v } from 'convex/values';
import { env } from '../src/env';
import { extractEventStatus, zEventStatus } from '../src/frc-nexus/schema';
import { internal } from './_generated/api';
import { internalAction, internalMutation } from './_generated/server';
import { app } from './lib/hono';
import { NexusMatch } from './schema';

const webhookRoute = createRoute({
	method: 'post',
	path: '/frc-nexus/webhook',
	tags: ['FRC Nexus'],
	summary: 'Receive live event status updates from FRC Nexus',
	request: {
		headers: z.object({ 'nexus-token': z.string() }),
		body: { content: { 'application/json': { schema: zEventStatus } } },
	},
	responses: {
		200: { description: 'Update accepted.' },
		401: { description: 'Missing or invalid Nexus-Token header.' },
	},
});

app.openapi(webhookRoute, async (c) => {
	if (c.req.header('Nexus-Token') !== env.NEXUS_WEBHOOK_TOKEN) return c.text('Unauthorized', 401);

	const eventStatus = extractEventStatus(c.req.valid('json'));
	if (eventStatus) await c.env.runMutation(internal.frcNexus.processEventStatus, eventStatus);
	return c.text('OK', 200);
});

export const pullEventStatus = internalAction({
	args: { eventKey: v.string() },
	returns: v.object({ eventKey: v.string(), dataAsOfTime: v.number(), matchCount: v.number() }),
	handler: async (ctx, args) => {
		const response = await fetch(`https://frc.nexus/api/v1/event/${encodeURIComponent(args.eventKey)}`, {
			headers: { 'Nexus-Api-Key': env.NEXUS_API_KEY },
		});
		if (!response.ok) throw new Error(`FRC Nexus returned ${response.status} ${response.statusText}`);

		const eventStatus = extractEventStatus(zEventStatus.parse(await response.json()));
		if (!eventStatus) throw new Error('FRC Nexus returned an incomplete event status');

		await ctx.runMutation(internal.frcNexus.processEventStatus, eventStatus);
		return {
			eventKey: eventStatus.eventKey,
			dataAsOfTime: eventStatus.dataAsOfTime,
			matchCount: eventStatus.matches.length,
		};
	},
});

export const processEventStatus = internalMutation({
	args: {
		eventKey: v.string(),
		dataAsOfTime: v.number(),
		nowQueuing: v.optional(v.string()),
		matches: v.array(NexusMatch),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('eventStatuses')
			.withIndex('by_eventKey', (q) => q.eq('eventKey', args.eventKey))
			.unique();
		if (existing && existing.dataAsOfTime >= args.dataAsOfTime) return null;

		const snapshot = {
			dataAsOfTime: args.dataAsOfTime,
			receivedAt: Date.now(),
			nowQueuing: args.nowQueuing,
			matches: args.matches,
		};
		if (existing) {
			await ctx.db.patch(existing._id, snapshot);
		} else {
			await ctx.db.insert('eventStatuses', { eventKey: args.eventKey, ...snapshot });
		}
		return null;
	},
});
