import { v, type Infer } from 'convex/values';
import { matchIndexes, type CompetitionPhase } from '../../src/frc-nexus/match-selection';
import { TEAM_NUMBER_STRING } from '../../src/team';
import type { Doc } from '../_generated/dataModel';

const eliminationBreak = v.object({
	label: v.string(),
	durationMinutes: v.nullable(v.number()),
	endTime: v.nullable(v.number()),
	hasStarted: v.boolean(),
	hasEnded: v.boolean(),
	previousMatch: v.object({
		displayLabel: v.string(),
		startTime: v.nullable(v.number()),
	}),
});

const matchTiming = v.object({
	time: v.nullable(v.number()),
	isActual: v.boolean(),
});

export const dashboardData = v.object({
	eventKey: v.string(),
	updatedAt: v.number(),
	competitionPhase: v.union(v.literal('qualification'), v.literal('allianceSelection'), v.literal('elimination')),
	alliancePartners: v.array(v.number()),
	currentActivity: v.nullable(
		v.union(
			v.object({ type: v.literal('match'), displayLabel: v.string(), endsAt: v.nullable(v.number()) }),
			v.object({ type: v.literal('awards'), endsAt: v.number() }),
		),
	),
	nextMatch: v.nullable(
		v.object({
			displayLabel: v.string(),
			startTime: v.nullable(v.number()),
			alliance: v.union(v.literal('blue'), v.literal('red')),
			timing: v.object({ queued: matchTiming, onDeck: matchTiming }),
		}),
	),
	upcomingMatches: v.array(
		v.object({
			key: v.string(),
			displayLabel: v.string(),
			startTime: v.nullable(v.number()),
			warning: v.nullable(v.string()),
			break: v.nullable(eliminationBreak),
			alliance: v.union(v.literal('blue'), v.literal('red')),
			teams: v.array(v.number()),
		}),
	),
	eliminationPaths: v.array(
		v.object({
			outcome: v.union(v.literal('win'), v.literal('lose')),
			displayLabel: v.nullable(v.string()),
			startTime: v.nullable(v.number()),
			break: v.nullable(eliminationBreak),
			alliance: v.nullable(v.union(v.literal('blue'), v.literal('red'))),
		}),
	),
});

export type DashboardData = Infer<typeof dashboardData>;
type NexusMatch = Doc<'eventStatuses'>['matches'][number];
type EventStatusSnapshot = Pick<
	Doc<'eventStatuses'>,
	'alliancePartners' | 'competitionPhase' | 'eventKey' | 'matches' | 'receivedAt'
>;
type MatchType = 'elimination' | 'final' | 'practice' | 'qualification';
type ParsedMatch = { number: number; type: MatchType; displayLabel: string };
type AllianceColor = 'blue' | 'red';
type EliminationDestination = { label: string; alliance: AllianceColor };
type CurrentActivity = DashboardData['currentActivity'];
type NextMatch = NonNullable<DashboardData['nextMatch']>;
type UpcomingMatch = DashboardData['upcomingMatches'][number];

const matchDuration = 2.5 * 60_000;

// Nexus's public API omits advancement routes, so keep the official eight-alliance
// double-elimination bracket destinations here and use Nexus for their live timing.
const playoffAdvancement: Record<number, { win: EliminationDestination; lose?: EliminationDestination }> = {
	1: { win: { label: 'Playoff 7', alliance: 'red' }, lose: { label: 'Playoff 5', alliance: 'red' } },
	2: { win: { label: 'Playoff 7', alliance: 'blue' }, lose: { label: 'Playoff 5', alliance: 'blue' } },
	3: { win: { label: 'Playoff 8', alliance: 'red' }, lose: { label: 'Playoff 6', alliance: 'red' } },
	4: { win: { label: 'Playoff 8', alliance: 'blue' }, lose: { label: 'Playoff 6', alliance: 'blue' } },
	5: { win: { label: 'Playoff 10', alliance: 'blue' } },
	6: { win: { label: 'Playoff 9', alliance: 'blue' } },
	7: { win: { label: 'Playoff 11', alliance: 'red' }, lose: { label: 'Playoff 9', alliance: 'red' } },
	8: { win: { label: 'Playoff 11', alliance: 'blue' }, lose: { label: 'Playoff 10', alliance: 'red' } },
	9: { win: { label: 'Playoff 12', alliance: 'blue' } },
	10: { win: { label: 'Playoff 12', alliance: 'red' } },
	11: { win: { label: 'Final 1', alliance: 'red' }, lose: { label: 'Playoff 13', alliance: 'red' } },
	12: { win: { label: 'Playoff 13', alliance: 'blue' } },
	13: { win: { label: 'Final 1', alliance: 'blue' } },
};

const ordinalPluralRules = new Intl.PluralRules('en', { type: 'ordinal' });
const ordinalSuffixes: Record<Intl.LDMLPluralRule, string> = {
	one: 'st',
	two: 'nd',
	few: 'rd',
	other: 'th',
	zero: 'th',
	many: 'th',
};

function parseMatchLabel(label: string): ParsedMatch | null {
	const match = /^(Practice|Qualification|Playoff|Final) (\d+)/.exec(label);
	if (!match) return null;

	const type =
		match[1] === 'Practice'
			? 'practice'
			: match[1] === 'Qualification'
				? 'qualification'
				: match[1] === 'Playoff'
					? 'elimination'
					: 'final';
	const prefix = type === 'qualification' ? 'Q' : type === 'elimination' ? 'M' : type === 'final' ? 'F' : 'P';
	const number = Number(match[2]);
	return { number, type, displayLabel: `${prefix}${number}` };
}

function matchStart(match: NexusMatch): number | undefined {
	return match.times.estimatedStartTime ?? match.times.scheduledStartTime;
}

function includesTeam(match: NexusMatch): boolean {
	return match.redTeams.includes(TEAM_NUMBER_STRING) || match.blueTeams.includes(TEAM_NUMBER_STRING);
}

function breakWarning(afterBreak: NonNullable<NexusMatch['afterBreak']>): string {
	const ordinal = `${afterBreak.position}${ordinalSuffixes[ordinalPluralRules.select(afterBreak.position)]}`;
	return `${ordinal} match after ${afterBreak.breakLabel}`;
}

function breakTitle(label: string): string {
	const withoutArticle = label.replace(/^(?:a|an|the) /, '');
	return withoutArticle.charAt(0).toUpperCase() + withoutArticle.slice(1);
}

function eliminationBreakForMatch(
	match: NexusMatch,
	matches: NexusMatch[],
): DashboardData['eliminationPaths'][number]['break'] {
	if (!match.afterBreak) return null;

	const matchIndex = matches.indexOf(match);
	const previousMatchIndex = matchIndex - match.afterBreak.position;
	const previousMatch = matches[previousMatchIndex];
	const firstMatchAfterBreak = matches[previousMatchIndex + 1];
	const parsedPreviousMatch = previousMatch ? parseMatchLabel(previousMatch.label) : null;
	if (!previousMatch || !parsedPreviousMatch) return null;

	return {
		label: breakTitle(match.afterBreak.breakLabel),
		durationMinutes: match.afterBreak.durationMinutes ?? null,
		hasStarted: previousMatch.status === 'On field',
		hasEnded: firstMatchAfterBreak?.status === 'On field',
		endTime:
			firstMatchAfterBreak?.times.estimatedOnFieldTime ??
			(firstMatchAfterBreak ? (matchStart(firstMatchAfterBreak) ?? null) : null),
		previousMatch: {
			displayLabel: parsedPreviousMatch.displayLabel,
			startTime: matchStart(previousMatch) ?? null,
		},
	};
}

function timing(estimated: number | undefined, actual: number | undefined): NextMatch['timing']['queued'] {
	const time = actual ?? estimated ?? null;
	return { time, isActual: actual !== undefined };
}

function turnaroundWarningForMatch(
	match: NexusMatch,
	parsedMatch: ParsedMatch,
	previousMatch: NexusMatch,
	previousParsedMatch: ParsedMatch,
): string | null {
	const start = matchStart(match);
	const previousStart = matchStart(previousMatch);
	if (start !== undefined && previousStart !== undefined) {
		const turnaroundMinutes = Math.round((start - previousStart) / 60_000);
		if (turnaroundMinutes >= 0 && turnaroundMinutes <= 20) {
			return `${turnaroundMinutes}m turnaround`;
		}
	}

	if (parsedMatch.type === previousParsedMatch.type) {
		const matchesBetween = parsedMatch.number - previousParsedMatch.number - 1;
		if (matchesBetween === 0) return 'Back to back';
		if (matchesBetween > 0 && matchesBetween < 4) return `${matchesBetween} match turnaround`;
	}

	return null;
}

function eliminationPaths(match: NexusMatch | undefined, matches: NexusMatch[]): DashboardData['eliminationPaths'] {
	const parsedMatch = match ? parseMatchLabel(match.label) : null;
	if (parsedMatch?.type !== 'elimination') return [];

	const advancement = playoffAdvancement[parsedMatch.number];
	if (!advancement) return [];

	return (['win', 'lose'] as const).map((outcome) => {
		const destination = advancement[outcome];
		if (!destination) {
			return { outcome, displayLabel: null, startTime: null, break: null, alliance: null };
		}

		const destinationMatch = matches.find((candidate) => candidate.label === destination.label);
		const parsedDestination = parseMatchLabel(destination.label);
		return {
			outcome,
			displayLabel: parsedDestination?.displayLabel ?? null,
			startTime: destinationMatch ? (matchStart(destinationMatch) ?? null) : null,
			break: destinationMatch ? eliminationBreakForMatch(destinationMatch, matches) : null,
			alliance: destination.alliance,
		};
	});
}

function matchIsInPhase(match: ParsedMatch, phase: CompetitionPhase): boolean {
	return phase === 'qualification'
		? match.type === 'practice' || match.type === 'qualification'
		: phase === 'elimination' && (match.type === 'elimination' || match.type === 'final');
}

function createUpcomingMatch(
	match: NexusMatch,
	index: number,
	teamMatches: NexusMatch[],
	lastOnFieldMatch: NexusMatch | undefined,
	allMatches: NexusMatch[],
): UpcomingMatch | null {
	const parsedMatch = parseMatchLabel(match.label);
	if (!parsedMatch) return null;

	const alliance = match.redTeams.includes(TEAM_NUMBER_STRING) ? 'red' : 'blue';
	const teams = (alliance === 'red' ? match.redTeams : match.blueTeams).map(Number);
	if (teams.length < 3 || teams.length > 4 || teams.some((team) => !Number.isInteger(team))) return null;

	const previousMatch =
		teamMatches[index - 1] ?? (lastOnFieldMatch && includesTeam(lastOnFieldMatch) ? lastOnFieldMatch : undefined);
	const previousParsedMatch = previousMatch ? parseMatchLabel(previousMatch.label) : null;
	return {
		key: match.label,
		displayLabel: parsedMatch.displayLabel,
		startTime: matchStart(match) ?? null,
		warning: match.afterBreak
			? breakWarning(match.afterBreak)
			: previousMatch && previousParsedMatch
				? turnaroundWarningForMatch(match, parsedMatch, previousMatch, previousParsedMatch)
				: null,
		break: eliminationBreakForMatch(match, allMatches),
		alliance,
		teams,
	};
}

function createUpcomingMatches(
	teamMatches: NexusMatch[],
	lastOnFieldMatch: NexusMatch | undefined,
	allMatches: NexusMatch[],
): DashboardData['upcomingMatches'] {
	return teamMatches.flatMap((match, index) => {
		const upcomingMatch = createUpcomingMatch(match, index, teamMatches, lastOnFieldMatch, allMatches);
		return upcomingMatch ? [upcomingMatch] : [];
	});
}

function findActiveEliminationMatch(
	matches: NexusMatch[],
	currentMatchIndex: number,
	currentMatch: NexusMatch | undefined,
	nextMatch: NexusMatch | undefined,
): NexusMatch | undefined {
	const mostRecentTeamMatch = matches.slice(0, currentMatchIndex + 1).findLast((match) => {
		const parsedMatch = parseMatchLabel(match.label);
		return includesTeam(match) && (parsedMatch?.type === 'elimination' || parsedMatch?.type === 'final');
	});
	return nextMatch ?? (currentMatch && includesTeam(currentMatch) ? currentMatch : mostRecentTeamMatch);
}

function activeAwardsEndTime(nextMatch: NexusMatch | undefined, matches: NexusMatch[]): number | null {
	if (!nextMatch) return null;
	const nextMatchBreak = eliminationBreakForMatch(nextMatch, matches);
	return nextMatchBreak?.label === 'Awards break' &&
		nextMatchBreak.hasStarted &&
		!nextMatchBreak.hasEnded &&
		nextMatchBreak.durationMinutes !== null &&
		nextMatchBreak.endTime !== null
		? nextMatchBreak.endTime
		: null;
}

function createCurrentActivity(
	currentMatch: NexusMatch | undefined,
	parsedCurrentMatch: ParsedMatch | null,
	phase: CompetitionPhase,
	awardsEndsAt: number | null,
): CurrentActivity {
	if (awardsEndsAt !== null) return { type: 'awards', endsAt: awardsEndsAt };
	if (!currentMatch || !parsedCurrentMatch || !matchIsInPhase(parsedCurrentMatch, phase)) return null;
	return {
		type: 'match',
		displayLabel: parsedCurrentMatch.displayLabel,
		endsAt:
			currentMatch.times.estimatedStartTime === undefined
				? null
				: currentMatch.times.estimatedStartTime + matchDuration,
	};
}

function createNextMatch(nextMatch: NexusMatch | undefined, parsedNextMatch: ParsedMatch | null): NextMatch | null {
	if (!nextMatch || !parsedNextMatch) return null;
	return {
		displayLabel: parsedNextMatch.displayLabel,
		startTime: matchStart(nextMatch) ?? null,
		alliance: nextMatch.redTeams.includes(TEAM_NUMBER_STRING) ? 'red' : 'blue',
		timing: {
			queued: timing(nextMatch.times.estimatedQueueTime, nextMatch.times.actualQueueTime),
			onDeck: timing(nextMatch.times.estimatedOnDeckTime, nextMatch.times.actualOnDeckTime),
		},
	};
}

export function createDashboardData(status: EventStatusSnapshot): DashboardData | null {
	const { competitionPhase } = status;
	const { currentMatchIndex, lastOnFieldIndex } = matchIndexes(status.matches, competitionPhase);

	const currentMatch = status.matches[currentMatchIndex];
	const parsedCurrentMatch = currentMatch ? parseMatchLabel(currentMatch.label) : null;
	if (currentMatch && !parsedCurrentMatch) return null;

	const lastOnFieldMatch = status.matches[lastOnFieldIndex];
	const teamMatches = status.matches.slice(lastOnFieldIndex + 1).filter(includesTeam);
	const nextMatch = teamMatches[0];
	const parsedNextMatch = nextMatch ? parseMatchLabel(nextMatch.label) : null;
	if (nextMatch && !parsedNextMatch) return null;

	const upcomingMatches = createUpcomingMatches(teamMatches, lastOnFieldMatch, status.matches);
	const activeEliminationMatch = findActiveEliminationMatch(status.matches, currentMatchIndex, currentMatch, nextMatch);
	const awardsEndsAt = competitionPhase === 'elimination' ? activeAwardsEndTime(nextMatch, status.matches) : null;

	return {
		eventKey: status.eventKey,
		updatedAt: status.receivedAt,
		competitionPhase,
		alliancePartners: status.alliancePartners.map(Number).filter(Number.isInteger),
		currentActivity: createCurrentActivity(currentMatch, parsedCurrentMatch, competitionPhase, awardsEndsAt),
		nextMatch: createNextMatch(nextMatch, parsedNextMatch),
		upcomingMatches,
		eliminationPaths:
			competitionPhase === 'elimination' ? eliminationPaths(activeEliminationMatch, status.matches) : [],
	};
}
