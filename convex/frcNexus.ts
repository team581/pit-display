import { createRoute, z } from '@hono/zod-openapi';
import { v } from 'convex/values';
import { extractEventStatus } from '../src/frc-nexus/extract-event-status';
import { FrcNexus } from '../src/frc-nexus/generated/sdk.gen';
import { zEventStatus } from '../src/frc-nexus/generated/zod.gen';
import { TEAM_NUMBER_STRING } from '../src/team';
import { internal } from './_generated/api';
import { internalAction, internalMutation } from './_generated/server';
import { env } from './env';
import { app } from './lib/hono';
import { NexusMatch } from './schema';

const frcNexus = new FrcNexus();

function includesTeam(matches: { redTeams?: (string | null)[] | null; blueTeams?: (string | null)[] | null }[]) {
	return matches.some(
		(match) => match.redTeams?.includes(TEAM_NUMBER_STRING) || match.blueTeams?.includes(TEAM_NUMBER_STRING),
	);
}

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

	const data = c.req.valid('json');
	if (!data.matches || !includesTeam(data.matches)) return c.text('OK', 200);

	const eventStatus = extractEventStatus(data);
	if (eventStatus) await c.env.runMutation(internal.frcNexus.processEventStatus, eventStatus);
	return c.text('OK', 200);
});

export const pullEventStatus = internalAction({
	args: { eventKey: v.string() },
	returns: v.object({ eventKey: v.string(), dataAsOfTime: v.number(), matchCount: v.number() }),
	handler: async (ctx, args) => {
		const data = await frcNexus.pullLiveEventStatus({
			auth: env.NEXUS_API_KEY,
			path: { eventKey: args.eventKey },
		});
		const eventStatus = extractEventStatus(data);
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
		teamIsPresent: v.boolean(),
		matches: v.array(NexusMatch),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		if (!args.teamIsPresent) return null;

		const activeEvent = await ctx.db.query('eventStatuses').withIndex('by_dataAsOfTime').order('desc').first();
		if (activeEvent && activeEvent.dataAsOfTime >= args.dataAsOfTime) return null;

		const snapshot = {
			dataAsOfTime: args.dataAsOfTime,
			receivedAt: Date.now(),
			nowQueuing: undefined,
			matches: args.matches,
		};
		if (activeEvent?.eventKey === args.eventKey) {
			await ctx.db.patch(activeEvent._id, snapshot);
		} else {
			if (activeEvent) await ctx.db.delete(activeEvent._id);
			await ctx.db.insert('eventStatuses', { eventKey: args.eventKey, ...snapshot });
		}
		return null;
	},
});
