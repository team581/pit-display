import { v, type Infer } from 'convex/values';
import { TEAM_NUMBER_STRING } from '../../src/team';
import type { Doc } from '../_generated/dataModel';

export const dashboardData = v.object({
	eventKey: v.string(),
	updatedAt: v.number(),
	competitionPhase: v.union(v.literal('qualification'), v.literal('allianceSelection'), v.literal('elimination')),
	alliancePartners: v.array(v.number()),
	currentMatch: v.nullable(v.object({ displayLabel: v.string(), startedAt: v.nullable(v.number()) })),
	nextMatch: v.nullable(
		v.object({
			displayLabel: v.string(),
			startTime: v.nullable(v.number()),
			milestones: v.array(
				v.object({
					label: v.string(),
					time: v.nullable(v.number()),
					isActual: v.boolean(),
				}),
			),
		}),
	),
	upcomingMatches: v.array(
		v.object({
			key: v.string(),
			displayLabel: v.string(),
			startTime: v.nullable(v.number()),
			warning: v.nullable(v.string()),
			alliance: v.union(v.literal('blue'), v.literal('red')),
			teams: v.array(v.number()),
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

function milestone(
	label: string,
	estimated: number | undefined,
	actual: number | undefined,
): NonNullable<DashboardData['nextMatch']>['milestones'][number] {
	const time = actual ?? estimated ?? null;
	return { label, time, isActual: actual !== undefined };
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
			return `${turnaroundMinutes} min turnaround`;
		}
	}

	if (parsedMatch.type === previousParsedMatch.type) {
		const matchesBetween = parsedMatch.number - previousParsedMatch.number - 1;
		if (matchesBetween === 0) return 'Back to back';
		if (matchesBetween > 0 && matchesBetween < 4) return `${matchesBetween} match turnaround`;
	}

	return null;
}

export function createDashboardData(status: EventStatusSnapshot): DashboardData | null {
	const competitionPhase = status.competitionPhase ?? 'qualification';
	let lastOnFieldIndex = -1;
	for (let index = status.matches.length - 1; index >= 0; index--) {
		if (status.matches[index]?.status === 'On field') {
			lastOnFieldIndex = index;
			break;
		}
	}
	const eliminationOnFieldIndex = status.matches.findLastIndex((match) => {
		const parsedMatch = parseMatchLabel(match.label);
		return match.status === 'On field' && (parsedMatch?.type === 'elimination' || parsedMatch?.type === 'final');
	});
	const eliminationOnDeckIndex = status.matches.findIndex((match) => {
		const parsedMatch = parseMatchLabel(match.label);
		return match.status === 'On deck' && (parsedMatch?.type === 'elimination' || parsedMatch?.type === 'final');
	});
	const currentMatchIndex =
		competitionPhase === 'elimination'
			? eliminationOnFieldIndex === -1
				? eliminationOnDeckIndex
				: eliminationOnFieldIndex
			: lastOnFieldIndex;

	const currentMatch = status.matches[currentMatchIndex];
	const parsedCurrentMatch = currentMatch ? parseMatchLabel(currentMatch.label) : null;
	if (currentMatch && !parsedCurrentMatch) return null;
	const currentMatchIsInPhase =
		parsedCurrentMatch &&
		((competitionPhase === 'qualification' &&
			(parsedCurrentMatch.type === 'practice' || parsedCurrentMatch.type === 'qualification')) ||
			(competitionPhase === 'elimination' &&
				(parsedCurrentMatch.type === 'elimination' || parsedCurrentMatch.type === 'final')));

	const lastOnFieldMatch = status.matches[lastOnFieldIndex];
	const teamMatches = status.matches.slice(lastOnFieldIndex + 1).filter(includesTeam);
	const nextMatch = teamMatches[0];
	const parsedNextMatch = nextMatch ? parseMatchLabel(nextMatch.label) : null;
	if (nextMatch && !parsedNextMatch) return null;

	const upcomingMatches = teamMatches.flatMap((match, index): DashboardData['upcomingMatches'] => {
		const parsedMatch = parseMatchLabel(match.label);
		if (!parsedMatch) return [];

		const alliance = match.redTeams.includes(TEAM_NUMBER_STRING) ? 'red' : 'blue';
		const teams = (alliance === 'red' ? match.redTeams : match.blueTeams).map(Number);
		if (teams.length < 3 || teams.length > 4 || teams.some((team) => !Number.isInteger(team))) return [];

		const previousMatch =
			teamMatches[index - 1] ?? (lastOnFieldMatch && includesTeam(lastOnFieldMatch) ? lastOnFieldMatch : undefined);
		const previousParsedMatch = previousMatch ? parseMatchLabel(previousMatch.label) : null;
		return [
			{
				key: match.label,
				displayLabel: parsedMatch.displayLabel,
				startTime: matchStart(match) ?? null,
				warning: match.afterBreak
					? breakWarning(match.afterBreak)
					: previousMatch && previousParsedMatch
						? turnaroundWarningForMatch(match, parsedMatch, previousMatch, previousParsedMatch)
						: null,
				alliance,
				teams,
			},
		];
	});

	return {
		eventKey: status.eventKey,
		updatedAt: status.receivedAt,
		competitionPhase,
		alliancePartners: (status.alliancePartners ?? []).map(Number).filter(Number.isInteger),
		currentMatch:
			currentMatch && parsedCurrentMatch && currentMatchIsInPhase
				? {
						displayLabel: parsedCurrentMatch.displayLabel,
						startedAt: currentMatch.times.actualOnFieldTime ?? matchStart(currentMatch) ?? null,
					}
				: null,
		nextMatch:
			nextMatch && parsedNextMatch
				? {
						displayLabel: parsedNextMatch.displayLabel,
						startTime: matchStart(nextMatch) ?? null,
						milestones: [
							milestone('Queued', nextMatch.times.estimatedQueueTime, nextMatch.times.actualQueueTime),
							milestone('On deck', nextMatch.times.estimatedOnDeckTime, nextMatch.times.actualOnDeckTime),
							milestone('Match start', matchStart(nextMatch), undefined),
						],
					}
				: null,
		upcomingMatches,
	};
}
