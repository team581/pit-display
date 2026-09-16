import { TEAM_NUMBER_STRING } from '../team';
import type { EventStatus, Match } from './generated/types.gen';
import { isEliminationMatch, matchIndexes, type CompetitionPhase } from './match-selection';

const breakLabels = {
	Break: 'a break',
	Lunch: 'lunch',
	'End of day': 'the start of the day',
	'Alliance selection': 'alliance selection',
	'Awards break': 'an awards break',
} as const;

type AfterBreak = { breakLabel: string; durationMinutes?: number; position: number };

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
		...(times?.estimatedOnFieldTime != null ? { estimatedOnFieldTime: times.estimatedOnFieldTime } : {}),
		...(times?.estimatedStartTime != null ? { estimatedStartTime: times.estimatedStartTime } : {}),
		...(times?.actualQueueTime != null ? { actualQueueTime: times.actualQueueTime } : {}),
		...(times?.actualOnDeckTime != null ? { actualOnDeckTime: times.actualOnDeckTime } : {}),
		...(times?.actualOnFieldTime != null ? { actualOnFieldTime: times.actualOnFieldTime } : {}),
	};
}

function competitionPhase(matches: Match[]): CompetitionPhase {
	const qualificationMatches = matches.filter((match) => match.label?.startsWith('Qualification '));
	const playoffMatches = matches.filter((match) => match.label?.startsWith('Playoff '));
	const qualificationsComplete =
		qualificationMatches.length > 0 && qualificationMatches.every((match) => match.status === 'On field');
	if (!qualificationsComplete) return 'qualification';

	const playoffsStarted = playoffMatches.some((match) => match.status !== 'Queuing soon');
	return playoffsStarted ? 'elimination' : 'allianceSelection';
}

function alliancePartners(matches: Match[]): string[] {
	const match = matches.find(
		(match) =>
			match.label?.startsWith('Playoff ') &&
			(match.redTeams?.includes(TEAM_NUMBER_STRING) || match.blueTeams?.includes(TEAM_NUMBER_STRING)),
	);
	if (!match) return [];

	const alliance = match.redTeams?.includes(TEAM_NUMBER_STRING) ? match.redTeams : match.blueTeams;
	return withoutNullTeams(alliance).filter((team) => team !== TEAM_NUMBER_STRING);
}

function breakPositions(
	matches: Match[],
	breakDurations: Readonly<Record<string, number>>,
): (AfterBreak | undefined)[] {
	const positions: (AfterBreak | undefined)[] = [];
	let matchesSinceBreak = Number.POSITIVE_INFINITY;
	let lastBreakLabel = '';
	let lastBreakDuration: number | undefined;
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
			withinCountWindow || withinTimeWindow
				? {
						breakLabel: lastBreakLabel,
						...(lastBreakDuration === undefined ? {} : { durationMinutes: lastBreakDuration }),
						position: matchesSinceBreak,
					}
				: undefined,
		);
		matchesSinceBreak++;

		if (match.breakAfter) {
			matchesSinceBreak = 1;
			lastBreakLabel = breakLabels[match.breakAfter];
			lastBreakDuration = match.label ? breakDurations[match.label] : undefined;
		}
	}

	return positions;
}

export function extractEventStatus(data: EventStatus, breakDurations: Readonly<Record<string, number>> = {}) {
	if (!data.eventKey || !data.dataAsOfTime || !data.matches) return;
	const phase = competitionPhase(data.matches);
	const { currentMatchIndex } = matchIndexes(data.matches, phase);
	const afterBreakByMatch = breakPositions(data.matches, breakDurations);
	const teamIsPresent = data.matches.some(
		(match) => match.redTeams?.includes(TEAM_NUMBER_STRING) || match.blueTeams?.includes(TEAM_NUMBER_STRING),
	);

	return {
		eventKey: data.eventKey,
		dataAsOfTime: data.dataAsOfTime,
		teamIsPresent,
		competitionPhase: phase,
		alliancePartners: alliancePartners(data.matches),
		matches: data.matches.flatMap((match, index) => {
			const isTeamMatch =
				match.redTeams?.includes(TEAM_NUMBER_STRING) || match.blueTeams?.includes(TEAM_NUMBER_STRING) || false;
			const eliminationMatch = isEliminationMatch(match.label);
			const isRelevantMatch =
				phase === 'elimination'
					? eliminationMatch
					: index === currentMatchIndex || (index > currentMatchIndex && isTeamMatch);
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
