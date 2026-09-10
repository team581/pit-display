import { v } from 'convex/values';
import { query } from './_generated/server';
import { MatchStatus, MatchTimes } from './schema';

const dashboardMatch = v.object({
	label: v.string(),
	status: MatchStatus,
	redTeams: v.array(v.string()),
	blueTeams: v.array(v.string()),
	times: MatchTimes,
});

export const get = query({
	args: { teamNumber: v.number() },
	returns: v.nullable(
		v.object({
			teamNumber: v.number(),
			eventKey: v.string(),
			updatedAt: v.number(),
			currentMatch: v.nullable(dashboardMatch),
			teamMatches: v.array(dashboardMatch),
		}),
	),
	handler: async (ctx, args) => {
		if (!Number.isInteger(args.teamNumber) || args.teamNumber < 1 || args.teamNumber > 99_999) return null;
		const teamNumber = String(args.teamNumber);
		const recentStatuses = await ctx.db.query('eventStatuses').withIndex('by_dataAsOfTime').order('desc').take(10);
		const status = recentStatuses.find((eventStatus) =>
			eventStatus.matches.some((match) => match.redTeams.includes(teamNumber) || match.blueTeams.includes(teamNumber)),
		);
		if (!status) return null;
		let currentMatchIndex = -1;
		for (let index = status.matches.length - 1; index >= 0; index--) {
			if (status.matches[index]?.status === 'On field') {
				currentMatchIndex = index;
				break;
			}
		}

		return {
			teamNumber: args.teamNumber,
			eventKey: status.eventKey,
			updatedAt: status.receivedAt,
			currentMatch: status.matches[currentMatchIndex] ?? null,
			teamMatches: status.matches
				.slice(currentMatchIndex + 1)
				.filter((match) => match.redTeams.includes(teamNumber) || match.blueTeams.includes(teamNumber)),
		};
	},
});
