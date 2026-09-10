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
});

export const NexusMatch = v.object({
	label: v.string(),
	status: MatchStatus,
	redTeams: v.array(v.string()),
	blueTeams: v.array(v.string()),
	times: MatchTimes,
});

export default defineSchema({
	eventStatuses: defineTable({
		eventKey: v.string(),
		dataAsOfTime: v.number(),
		receivedAt: v.number(),
		nowQueuing: v.optional(v.string()),
		matches: v.array(NexusMatch),
	})
		.index('by_eventKey', ['eventKey'])
		.index('by_dataAsOfTime', ['dataAsOfTime']),
});
