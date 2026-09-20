import { createRoute, z } from '@hono/zod-openapi';
import { v } from 'convex/values';
import { pipeline, withHttpError, withJsonResponse } from 'fetch-extras';
import { extractEventStatus } from '../src/frc-nexus/extract-event-status';
import { FrcNexus } from '../src/frc-nexus/generated/sdk.gen';
import { zEventStatus } from '../src/frc-nexus/generated/zod.gen';
import { TEAM_NUMBER_STRING } from '../src/team';
import { internal } from './_generated/api';
import { env, internalAction, internalMutation } from './_generated/server';
import { app } from './lib/hono';
import { CompetitionPhase, NexusMatch } from './schema';

const frcNexus = new FrcNexus();
const reconciliationGraceMs = 5_000;
const reconciliationRetryMs = 15_000;
const reconciliationMaxAttempts = 40;

const matchSchedule = z.record(
	z.string(),
	z.looseObject({ breakDurationMinutes: z.number().int().nonnegative().optional() }),
);
const fetchMatchSchedule = pipeline(fetch, withHttpError(), withJsonResponse({ schema: matchSchedule }));

function scheduleKeyToMatchLabel(key: string): string | undefined {
	const playoff = /^de(\d+)$/.exec(key);
	if (playoff) return `Playoff ${playoff[1]}`;

	const final = /^f1m(\d+)$/.exec(key);
	if (final) return `Final ${final[1]}`;
	return undefined;
}

async function fetchBreakDurations(eventKey: string): Promise<Record<string, number>> {
	// The documented event API only includes the break label. Nexus's live schedule
	// store supplies the configured duration displayed by its own event UI.
	const schedule = await fetchMatchSchedule(
		`https://frc-virtual-queue-default-rtdb.firebaseio.com/events/${encodeURIComponent(eventKey)}/matches.json`,
	);

	return Object.fromEntries(
		Object.entries(schedule).flatMap(([key, match]) => {
			const label = scheduleKeyToMatchLabel(key);
			return label && match.breakDurationMinutes !== undefined ? [[label, match.breakDurationMinutes]] : [];
		}),
	);
}

async function fetchEventStatus(eventKey: string) {
	const data = await frcNexus.pullLiveEventStatus({
		auth: env.NEXUS_API_KEY,
		path: { eventKey },
	});
	const breakDurations = data.eventKey ? await fetchBreakDurations(data.eventKey) : {};
	const eventStatus = extractEventStatus(data, breakDurations);
	if (!eventStatus) throw new Error('FRC Nexus returned an incomplete event status');
	return eventStatus;
}

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

	const breakDurations = data.eventKey ? await fetchBreakDurations(data.eventKey) : {};
	const eventStatus = extractEventStatus(data, breakDurations);
	if (eventStatus) await c.env.runMutation(internal.frcNexus.processEventStatus, eventStatus);
	return c.text('OK', 200);
});

export const pullEventStatus = internalAction({
	args: { eventKey: v.string() },
	returns: v.object({ eventKey: v.string(), dataAsOfTime: v.number(), matchCount: v.number() }),
	handler: async (ctx, args) => {
		const eventStatus = await fetchEventStatus(args.eventKey);

		await ctx.runMutation(internal.frcNexus.processEventStatus, eventStatus);
		return {
			eventKey: eventStatus.eventKey,
			dataAsOfTime: eventStatus.dataAsOfTime,
			matchCount: eventStatus.matches.length,
		};
	},
});

export const reconcileCurrentMatch = internalAction({
	args: { eventKey: v.string(), matchLabel: v.string(), attempt: v.number() },
	returns: v.null(),
	handler: async (ctx, args) => {
		let eventStatus;
		try {
			eventStatus = await fetchEventStatus(args.eventKey);
		} catch (error) {
			console.warn(`Could not reconcile ${args.matchLabel}`, error);
			if (args.attempt < reconciliationMaxAttempts) {
				await ctx.scheduler.runAfter(reconciliationRetryMs, internal.frcNexus.reconcileCurrentMatch, {
					eventKey: args.eventKey,
					matchLabel: args.matchLabel,
					attempt: args.attempt + 1,
				});
			}
			return null;
		}
		await ctx.runMutation(internal.frcNexus.processEventStatus, eventStatus);

		const currentMatch = eventStatus.matches.findLast((match) => match.status === 'On field');
		if (
			currentMatch?.label === args.matchLabel &&
			currentMatch.times.actualStartTime === undefined &&
			args.attempt < reconciliationMaxAttempts
		) {
			await ctx.scheduler.runAfter(reconciliationRetryMs, internal.frcNexus.reconcileCurrentMatch, {
				eventKey: args.eventKey,
				matchLabel: args.matchLabel,
				attempt: args.attempt + 1,
			});
		}
		return null;
	},
});

export const processEventStatus = internalMutation({
	args: {
		eventKey: v.string(),
		dataAsOfTime: v.number(),
		teamIsPresent: v.boolean(),
		matches: v.array(NexusMatch),
		competitionPhase: CompetitionPhase,
		alliancePartners: v.array(v.string()),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		if (!args.teamIsPresent) return null;

		const activeEvent = await ctx.db.query('eventStatuses').withIndex('by_dataAsOfTime').order('desc').first();
		if (activeEvent && activeEvent.dataAsOfTime >= args.dataAsOfTime) return null;
		const currentMatch = args.matches.findLast((match) => match.status === 'On field');
		const matchToReconcile = currentMatch?.times.actualStartTime === undefined ? currentMatch : undefined;
		const shouldScheduleReconciliation =
			matchToReconcile !== undefined &&
			(activeEvent?.eventKey !== args.eventKey || activeEvent.reconcilingMatch !== matchToReconcile.label);

		const snapshot = {
			dataAsOfTime: args.dataAsOfTime,
			receivedAt: Date.now(),
			matches: args.matches,
			competitionPhase: args.competitionPhase,
			alliancePartners: args.alliancePartners,
			...(shouldScheduleReconciliation ? { reconcilingMatch: matchToReconcile.label } : {}),
		};
		if (activeEvent?.eventKey === args.eventKey) {
			await ctx.db.patch(activeEvent._id, snapshot);
		} else {
			if (activeEvent) await ctx.db.delete(activeEvent._id);
			await ctx.db.insert('eventStatuses', { eventKey: args.eventKey, ...snapshot });
		}
		if (shouldScheduleReconciliation) {
			await ctx.scheduler.runAt(
				Math.max(Date.now(), (matchToReconcile.times.estimatedStartTime ?? Date.now()) + reconciliationGraceMs),
				internal.frcNexus.reconcileCurrentMatch,
				{ eventKey: args.eventKey, matchLabel: matchToReconcile.label, attempt: 0 },
			);
		}
		return null;
	},
});
