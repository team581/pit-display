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
	currentMatch: v.object({ displayLabel: v.string(), state: v.string() }),
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
			status: v.union(v.literal('on-deck'), v.literal('queueing'), v.literal('scheduled')),
			queueingAt: v.nullable(v.number()),
			turnaroundWarning: v.nullable(v.string()),
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
			return `Tight · ${turnaroundMinutes} min`;
		}
	}

	if (parsedMatch.type === previousParsedMatch.type) {
		const matchesApart = parsedMatch.number - previousParsedMatch.number;
		if (matchesApart > 0 && matchesApart <= 4) return `Tight · ${matchesApart} matches`;
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
	if (!currentMatch) return null;
	const parsedCurrentMatch = parseMatchLabel(currentMatch.label);
	if (!parsedCurrentMatch) return null;

	const teamMatches = status.matches
		.slice(currentMatchIndex + 1)
		.filter((match) => match.redTeams.includes(TEAM_NUMBER_STRING) || match.blueTeams.includes(TEAM_NUMBER_STRING));
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

		const previousMatch = teamMatches[index - 1] ?? currentMatch;
		const previousParsedMatch = parseMatchLabel(previousMatch.label);
		if (!previousParsedMatch) return [];
		const queueTime = match.times.actualQueueTime ?? match.times.estimatedQueueTime;

		return [
			{
				key: match.label,
				displayLabel: parsedMatch.displayLabel,
				startTime: matchStart(match) ?? null,
				scheduledTime: match.times.scheduledStartTime ?? matchStart(match) ?? null,
				status: match.status === 'On deck' ? 'on-deck' : match.status === 'Now queuing' ? 'queueing' : 'scheduled',
				queueingAt: queueTime === undefined ? null : queueTime - 20 * 60_000,
				turnaroundWarning: turnaroundWarningForMatch(match, parsedMatch, previousMatch, previousParsedMatch),
				alliance,
				teams,
			},
		];
	});

	return {
		updatedAt: status.receivedAt,
		currentMatch: { displayLabel: parsedCurrentMatch.displayLabel, state: currentMatch.status },
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
