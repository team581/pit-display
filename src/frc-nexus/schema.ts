import { z } from '@hono/zod-openapi';

const zTeams = z.array(z.string().nullable()).nullable();

const zMatch = z.object({
	label: z.string().optional(),
	status: z.enum(['Queuing soon', 'Now queuing', 'On deck', 'On field']).optional(),
	redTeams: zTeams.optional(),
	blueTeams: zTeams.optional(),
	times: z
		.object({
			scheduledStartTime: z.number().nullish(),
			estimatedQueueTime: z.number().nullish(),
			estimatedOnDeckTime: z.number().nullish(),
			estimatedOnFieldTime: z.number().nullish(),
			estimatedStartTime: z.number().nullish(),
			actualQueueTime: z.number().nullish(),
			actualOnDeckTime: z.number().nullish(),
			actualOnFieldTime: z.number().nullish(),
		})
		.optional(),
});

export const zEventStatus = z.object({
	eventKey: z.string().optional(),
	dataAsOfTime: z.number().optional(),
	nowQueuing: z.string().nullish(),
	matches: z.array(zMatch).optional(),
});

export type EventStatus = z.infer<typeof zEventStatus>;
type Match = z.infer<typeof zMatch>;

type MatchTimes = {
	scheduledStartTime?: number;
	estimatedQueueTime?: number;
	estimatedOnDeckTime?: number;
	estimatedOnFieldTime?: number;
	estimatedStartTime?: number;
	actualQueueTime?: number;
	actualOnDeckTime?: number;
	actualOnFieldTime?: number;
};

type ProcessedEventStatus = {
	eventKey: string;
	dataAsOfTime: number;
	nowQueuing?: string;
	matches: {
		label: string;
		status: 'Now queuing' | 'On deck' | 'On field' | 'Queuing soon';
		redTeams: string[];
		blueTeams: string[];
		times: MatchTimes;
	}[];
};

const TIME_KEYS = [
	'scheduledStartTime',
	'estimatedQueueTime',
	'estimatedOnDeckTime',
	'estimatedOnFieldTime',
	'estimatedStartTime',
	'actualQueueTime',
	'actualOnDeckTime',
	'actualOnFieldTime',
] as const;

function withoutNullTeams(teams: (string | null)[] | null | undefined): string[] {
	return teams?.filter((team): team is string => team !== null) ?? [];
}

function withoutNullTimes(times: Match['times']): MatchTimes {
	const result: MatchTimes = {};
	for (const key of TIME_KEYS) {
		const time = times?.[key];
		if (time != null) result[key] = time;
	}
	return result;
}

export function extractEventStatus(data: EventStatus): ProcessedEventStatus | undefined {
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
