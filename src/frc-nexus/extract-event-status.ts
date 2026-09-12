import { TEAM_NUMBER_STRING } from '../team';
import type { EventStatus, Match } from './generated/types.gen';

function withoutNullTeams(teams: (string | null)[] | null | undefined): string[] {
	return teams?.filter((team) => team !== null) ?? [];
}

function withoutNullTimes(times: Match['times']) {
	return {
		...(times?.scheduledStartTime != null ? { scheduledStartTime: times.scheduledStartTime } : {}),
		...(times?.estimatedQueueTime != null ? { estimatedQueueTime: times.estimatedQueueTime } : {}),
		...(times?.estimatedOnDeckTime != null ? { estimatedOnDeckTime: times.estimatedOnDeckTime } : {}),
		...(times?.estimatedStartTime != null ? { estimatedStartTime: times.estimatedStartTime } : {}),
		...(times?.actualQueueTime != null ? { actualQueueTime: times.actualQueueTime } : {}),
		...(times?.actualOnDeckTime != null ? { actualOnDeckTime: times.actualOnDeckTime } : {}),
	};
}

export function extractEventStatus(data: EventStatus) {
	if (!data.eventKey || !data.dataAsOfTime || !data.matches) return;
	const currentMatchIndex = data.matches.findLastIndex((match) => match.status === 'On field');
	const teamIsPresent = data.matches.some(
		(match) => match.redTeams?.includes(TEAM_NUMBER_STRING) || match.blueTeams?.includes(TEAM_NUMBER_STRING),
	);

	return {
		eventKey: data.eventKey,
		dataAsOfTime: data.dataAsOfTime,
		teamIsPresent,
		matches: data.matches.flatMap((match, index) => {
			const isTeamMatch =
				match.redTeams?.includes(TEAM_NUMBER_STRING) || match.blueTeams?.includes(TEAM_NUMBER_STRING) || false;
			const isRelevantMatch = index === currentMatchIndex || (index > currentMatchIndex && isTeamMatch);
			return isRelevantMatch && match.label && match.status
				? [
						{
							label: match.label,
							status: match.status,
							redTeams: withoutNullTeams(match.redTeams),
							blueTeams: withoutNullTeams(match.blueTeams),
							times: withoutNullTimes(match.times),
						},
					]
				: [];
		}),
	};
}
