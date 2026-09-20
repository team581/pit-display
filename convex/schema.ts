import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const MatchStatus = v.union(
	v.literal('Queuing soon'),
	v.literal('Now queuing'),
	v.literal('On deck'),
	v.literal('On field'),
);

export const MatchTimes = v.object({
	scheduledStartTime: v.optional(v.number()),
	estimatedQueueTime: v.optional(v.number()),
	estimatedOnDeckTime: v.optional(v.number()),
	estimatedOnFieldTime: v.optional(v.number()),
	estimatedStartTime: v.optional(v.number()),
	actualQueueTime: v.optional(v.number()),
	actualOnDeckTime: v.optional(v.number()),
	actualOnFieldTime: v.optional(v.number()),
	actualStartTime: v.optional(v.number()),
	actualCommitTime: v.optional(v.number()),
});

export const NexusMatch = v.object({
	label: v.string(),
	status: MatchStatus,
	redTeams: v.array(v.string()),
	blueTeams: v.array(v.string()),
	times: MatchTimes,
	afterBreak: v.optional(
		v.object({ breakLabel: v.string(), durationMinutes: v.optional(v.number()), position: v.number() }),
	),
});

export const CompetitionPhase = v.union(
	v.literal('qualification'),
	v.literal('allianceSelection'),
	v.literal('elimination'),
);

export default defineSchema({
	eventStatuses: defineTable({
		eventKey: v.string(),
		dataAsOfTime: v.number(),
		receivedAt: v.number(),
		matches: v.array(NexusMatch),
		competitionPhase: CompetitionPhase,
		alliancePartners: v.array(v.string()),
		reconcilingMatch: v.optional(v.string()),
	}).index('by_dataAsOfTime', ['dataAsOfTime']),
});
