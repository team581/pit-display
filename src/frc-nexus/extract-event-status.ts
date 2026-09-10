import type { EventStatus, Match } from './generated/types.gen';

function withoutNullTeams(teams: (string | null)[] | null | undefined): string[] {
	return teams?.filter((team) => team !== null) ?? [];
}

function withoutNullTimes(times: Match['times']) {
	return {
		...(times?.scheduledStartTime != null ? { scheduledStartTime: times.scheduledStartTime } : {}),
		...(times?.estimatedQueueTime != null ? { estimatedQueueTime: times.estimatedQueueTime } : {}),
		...(times?.estimatedOnDeckTime != null ? { estimatedOnDeckTime: times.estimatedOnDeckTime } : {}),
		...(times?.estimatedOnFieldTime != null ? { estimatedOnFieldTime: times.estimatedOnFieldTime } : {}),
		...(times?.estimatedStartTime != null ? { estimatedStartTime: times.estimatedStartTime } : {}),
		...(times?.actualQueueTime != null ? { actualQueueTime: times.actualQueueTime } : {}),
		...(times?.actualOnDeckTime != null ? { actualOnDeckTime: times.actualOnDeckTime } : {}),
		...(times?.actualOnFieldTime != null ? { actualOnFieldTime: times.actualOnFieldTime } : {}),
	};
}

export function extractEventStatus(data: EventStatus) {
	if (!data.eventKey || !data.dataAsOfTime || !data.matches) return;

	return {
		eventKey: data.eventKey,
		dataAsOfTime: data.dataAsOfTime,
		...(data.nowQueuing ? { nowQueuing: data.nowQueuing } : {}),
		matches: data.matches.flatMap((match) =>
			match.label && match.status
				? [
						{
							label: match.label,
							status: match.status,
							redTeams: withoutNullTeams(match.redTeams),
							blueTeams: withoutNullTeams(match.blueTeams),
							times: withoutNullTimes(match.times),
						},
					]
				: [],
		),
	};
}
