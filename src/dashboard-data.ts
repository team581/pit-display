import type { FunctionReturnType } from 'convex/server';
import type { api } from '../convex/_generated/api';

export type AllianceColor = 'blue' | 'red';
type MatchStatus = 'on-deck' | 'queueing' | 'upcoming';
export type MatchType = 'elimination' | 'final' | 'practice' | 'qualification';

export type UpcomingMatch = {
	number: number;
	type: MatchType;
	relativeTime: string;
	scheduledTime: string;
	status: MatchStatus;
	alliance: AllianceColor;
	teams: readonly [number, number, number];
	previousMatchNumber: number;
	turnaroundMinutes: number;
};

export type DashboardData = {
	currentMatch: { number: number; type: MatchType; state: string };
	nextMatch: {
		number: number;
		type: MatchType;
		scheduledTime: string;
		milestones: readonly {
			label: string;
			value: string;
			state: 'future' | 'past' | 'soon';
		}[];
	};
	upcomingMatches: readonly UpcomingMatch[];
};

type DashboardQueryResult = NonNullable<FunctionReturnType<typeof api.dashboard.get>>;
type NexusDashboardMatch = NonNullable<DashboardQueryResult['currentMatch']>;

function parseMatchLabel(label: string): { number: number; type: MatchType } {
	const match = /^(Practice|Qualification|Playoff|Final) (\d+)/.exec(label);
	if (!match) return { number: 0, type: 'qualification' };
	const types: Record<string, MatchType> = {
		Practice: 'practice',
		Qualification: 'qualification',
		Playoff: 'elimination',
		Final: 'final',
	};
	return { number: Number(match[2]), type: types[match[1]] ?? 'qualification' };
}

function matchStart(match: NexusDashboardMatch): number | undefined {
	return match.times.estimatedStartTime ?? match.times.scheduledStartTime;
}

function formatClock(time: number | undefined): string {
	if (time === undefined) return 'Not available';
	return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(time);
}

function formatDuration(milliseconds: number): string {
	const minutes = Math.max(0, Math.round(milliseconds / 60_000));
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return remainingMinutes === 0 ? `${hours} hr` : `${hours} hr ${remainingMinutes} min`;
}

function formatRelativeTime(time: number | undefined, now: number): string {
	if (time === undefined) return 'Not available';
	const difference = time - now;
	if (Math.abs(difference) < 30_000) return 'now';
	return difference < 0 ? `${formatDuration(-difference)} ago` : `in ${formatDuration(difference)}`;
}

function milestone(label: string, estimated: number | undefined, actual: number | undefined, now: number) {
	const time = actual ?? estimated;
	const difference = time === undefined ? Number.POSITIVE_INFINITY : time - now;
	return {
		label,
		value: formatRelativeTime(time, now),
		state: (actual !== undefined || difference <= 0 ? 'past' : difference <= 10 * 60_000 ? 'soon' : 'future') as
			| 'future'
			| 'past'
			| 'soon',
	};
}

export function createDashboardData(data: DashboardQueryResult, now: number): DashboardData | null {
	const nextMatch = data.teamMatches[0];
	const currentMatch = data.currentMatch;
	if (!currentMatch || !nextMatch) return null;

	const parsedCurrent = parseMatchLabel(currentMatch.label);
	const parsedNext = parseMatchLabel(nextMatch.label);
	const upcomingMatches = data.teamMatches.flatMap((match, index): UpcomingMatch[] => {
		const parsed = parseMatchLabel(match.label);
		if (parsed.number === 0) return [];
		const start = matchStart(match);
		const previous = data.teamMatches[index - 1];
		const previousParsed = previous ? parseMatchLabel(previous.label) : parsedCurrent;
		const previousStart = previous ? matchStart(previous) : matchStart(currentMatch);
		const alliance = match.redTeams.includes(String(data.teamNumber)) ? 'red' : 'blue';
		const teams = (alliance === 'red' ? match.redTeams : match.blueTeams).map(Number);
		if (teams.length < 3) return [];
		const queueTime = match.times.actualQueueTime ?? match.times.estimatedQueueTime;
		const status: MatchStatus =
			match.status === 'On deck'
				? 'on-deck'
				: match.status === 'Now queuing' || (queueTime !== undefined && queueTime - now <= 20 * 60_000)
					? 'queueing'
					: 'upcoming';

		return [
			{
				...parsed,
				relativeTime: formatDuration((start ?? now) - now),
				scheduledTime: formatClock(match.times.scheduledStartTime ?? start),
				status,
				alliance,
				teams: teams.slice(0, 3) as [number, number, number],
				previousMatchNumber: previousParsed.number,
				turnaroundMinutes:
					start !== undefined && previousStart !== undefined ? Math.round((start - previousStart) / 60_000) : 999,
			},
		];
	});

	return {
		currentMatch: { ...parsedCurrent, state: currentMatch.status },
		nextMatch: {
			...parsedNext,
			scheduledTime: formatClock(nextMatch.times.scheduledStartTime ?? matchStart(nextMatch)),
			milestones: [
				milestone('Queued', nextMatch.times.estimatedQueueTime, nextMatch.times.actualQueueTime, now),
				milestone('On deck', nextMatch.times.estimatedOnDeckTime, nextMatch.times.actualOnDeckTime, now),
				milestone('Match start', nextMatch.times.estimatedStartTime, undefined, now),
			],
		},
		upcomingMatches,
	};
}
