import { TEAM_NUMBER_STRING } from '../team';
import type { EventStatus, Match } from './generated/types.gen';

const breakLabels = {
	Break: 'a break',
	Lunch: 'lunch',
	'End of day': 'the start of the day',
	'Alliance selection': 'alliance selection',
	'Awards break': 'an awards break',
} as const;

type AfterBreak = { breakLabel: string; position: number };

const breakWarningWindow = 30 * 60_000;
const minimumMatchesAfterBreak = 3;

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
		...(times?.actualOnFieldTime != null ? { actualOnFieldTime: times.actualOnFieldTime } : {}),
	};
}

function breakPositions(matches: Match[]): (AfterBreak | undefined)[] {
	const positions: (AfterBreak | undefined)[] = [];
	let matchesSinceBreak = Number.POSITIVE_INFINITY;
	let lastBreakLabel = '';
	let firstMatchAfterBreakStartTime: number | undefined;

	for (const match of matches) {
		const startTime = match.times?.estimatedStartTime ?? undefined;
		if (matchesSinceBreak === 1) firstMatchAfterBreakStartTime = startTime;

		const withinCountWindow = matchesSinceBreak <= minimumMatchesAfterBreak;
		const withinTimeWindow =
			Number.isFinite(matchesSinceBreak) &&
			firstMatchAfterBreakStartTime !== undefined &&
			startTime !== undefined &&
			startTime - firstMatchAfterBreakStartTime <= breakWarningWindow;

		positions.push(
			withinCountWindow || withinTimeWindow ? { breakLabel: lastBreakLabel, position: matchesSinceBreak } : undefined,
		);
		matchesSinceBreak++;

		if (match.breakAfter) {
			matchesSinceBreak = 1;
			lastBreakLabel = breakLabels[match.breakAfter];
		}
	}

	return positions;
}

export function extractEventStatus(data: EventStatus) {
	if (!data.eventKey || !data.dataAsOfTime || !data.matches) return;
	const currentMatchIndex = data.matches.findLastIndex((match) => match.status === 'On field');
	const afterBreakByMatch = breakPositions(data.matches);
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
			let afterBreak = afterBreakByMatch[index];
			const qualificationNumber = isTeamMatch ? match.label?.match(/^Qualification (\d+)$/)?.[1] : undefined;
			if (qualificationNumber && Number(qualificationNumber) <= 3) {
				afterBreak = { breakLabel: breakLabels['End of day'], position: Number(qualificationNumber) };
			}
			return isRelevantMatch && match.label && match.status
				? [
						{
							label: match.label,
							status: match.status,
							redTeams: withoutNullTeams(match.redTeams),
							blueTeams: withoutNullTeams(match.blueTeams),
							times: withoutNullTimes(match.times),
							...(afterBreak ? { afterBreak } : {}),
						},
					]
				: [];
		}),
	};
}
