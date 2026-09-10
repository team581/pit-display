import { v } from 'convex/values';
import { TEAM_NUMBER, TEAM_NUMBER_STRING } from '../src/team';
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
	args: {},
	returns: v.nullable(
		v.object({
			teamNumber: v.number(),
			eventKey: v.string(),
			updatedAt: v.number(),
			currentMatch: v.nullable(dashboardMatch),
			teamMatches: v.array(dashboardMatch),
		}),
	),
	handler: async (ctx) => {
		const status = await ctx.db.query('eventStatuses').withIndex('by_dataAsOfTime').order('desc').first();
		if (!status) return null;
		let currentMatchIndex = -1;
		for (let index = status.matches.length - 1; index >= 0; index--) {
			if (status.matches[index]?.status === 'On field') {
				currentMatchIndex = index;
				break;
			}
		}

		return {
			teamNumber: TEAM_NUMBER,
			eventKey: status.eventKey,
			updatedAt: status.receivedAt,
			currentMatch: status.matches[currentMatchIndex] ?? null,
			teamMatches: status.matches
				.slice(currentMatchIndex + 1)
				.filter((match) => match.redTeams.includes(TEAM_NUMBER_STRING) || match.blueTeams.includes(TEAM_NUMBER_STRING)),
		};
	},
});
