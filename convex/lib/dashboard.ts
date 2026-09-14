import { v, type Infer } from 'convex/values';
import { TEAM_NUMBER_STRING } from '../../src/team';
import type { Doc } from '../_generated/dataModel';

const matchType = v.union(
	v.literal('elimination'),
	v.literal('final'),
	v.literal('practice'),
	v.literal('qualification'),
);

export const dashboardData = v.object({
	updatedAt: v.number(),
	currentMatch: v.nullable(
		v.object({ displayLabel: v.string(), state: v.string(), startedAt: v.nullable(v.number()) }),
	),
	nextMatch: v.object({
		displayLabel: v.string(),
		scheduledTime: v.nullable(v.number()),
		milestones: v.array(
			v.object({
				label: v.string(),
				time: v.nullable(v.number()),
				isActual: v.boolean(),
			}),
		),
	}),
	upcomingMatches: v.array(
		v.object({
			key: v.string(),
			displayLabel: v.string(),
			startTime: v.nullable(v.number()),
			scheduledTime: v.nullable(v.number()),
			warning: v.nullable(v.string()),
			alliance: v.union(v.literal('blue'), v.literal('red')),
			teams: v.array(v.number()),
		}),
	),
});

export type DashboardData = Infer<typeof dashboardData>;
type NexusMatch = Doc<'eventStatuses'>['matches'][number];
type EventStatusSnapshot = Pick<Doc<'eventStatuses'>, 'matches' | 'receivedAt'>;
type MatchType = Infer<typeof matchType>;
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
): DashboardData['nextMatch']['milestones'][number] {
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
		const matchesApart = parsedMatch.number - previousParsedMatch.number;
		if (matchesApart > 0 && matchesApart <= 4) return `${matchesApart} match turnaround`;
	}

	return null;
}

export function createDashboardData(status: EventStatusSnapshot): DashboardData | null {
	let currentMatchIndex = -1;
	for (let index = status.matches.length - 1; index >= 0; index--) {
		if (status.matches[index]?.status === 'On field') {
			currentMatchIndex = index;
			break;
		}
	}

	const currentMatch = status.matches[currentMatchIndex];
	const parsedCurrentMatch = currentMatch ? parseMatchLabel(currentMatch.label) : null;
	if (currentMatch && !parsedCurrentMatch) return null;

	const teamMatches = status.matches.slice(currentMatchIndex + 1).filter(includesTeam);
	const nextMatch = teamMatches[0];
	if (!nextMatch) return null;
	const parsedNextMatch = parseMatchLabel(nextMatch.label);
	if (!parsedNextMatch) return null;

	const upcomingMatches = teamMatches.flatMap((match, index): DashboardData['upcomingMatches'] => {
		const parsedMatch = parseMatchLabel(match.label);
		if (!parsedMatch) return [];

		const alliance = match.redTeams.includes(TEAM_NUMBER_STRING) ? 'red' : 'blue';
		const teams = (alliance === 'red' ? match.redTeams : match.blueTeams).slice(0, 3).map(Number);
		if (teams.length !== 3 || teams.some((team) => !Number.isInteger(team))) return [];

		const previousMatch =
			teamMatches[index - 1] ?? (currentMatch && includesTeam(currentMatch) ? currentMatch : undefined);
		const previousParsedMatch = previousMatch ? parseMatchLabel(previousMatch.label) : null;
		return [
			{
				key: match.label,
				displayLabel: parsedMatch.displayLabel,
				startTime: matchStart(match) ?? null,
				scheduledTime: match.times.scheduledStartTime ?? matchStart(match) ?? null,
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
		updatedAt: status.receivedAt,
		currentMatch:
			currentMatch && parsedCurrentMatch
				? {
						displayLabel: parsedCurrentMatch.displayLabel,
						state: currentMatch.status,
						startedAt: currentMatch.times.actualOnFieldTime ?? currentMatch.times.estimatedStartTime ?? null,
					}
				: null,
		nextMatch: {
			displayLabel: parsedNextMatch.displayLabel,
			scheduledTime: nextMatch.times.scheduledStartTime ?? matchStart(nextMatch) ?? null,
			milestones: [
				milestone('Queued', nextMatch.times.estimatedQueueTime, nextMatch.times.actualQueueTime),
				milestone('On deck', nextMatch.times.estimatedOnDeckTime, nextMatch.times.actualOnDeckTime),
				milestone('Match start', nextMatch.times.estimatedStartTime, undefined),
			],
		},
		upcomingMatches,
	};
}
