import type { Dashboard } from '../dashboard';

const minute = 60_000;

export const SCENARIO_NOW = Date.UTC(2026, 2, 14, 18);

export function minutesFromNow(minutes: number): number {
	return SCENARIO_NOW + minutes * minute;
}

function timing(minutes: number | null, isActual = false) {
	return { time: minutes === null ? null : minutesFromNow(minutes), isActual };
}

function upcomingMatch(
	displayLabel: string,
	minutes: number | null,
	alliance: 'blue' | 'red',
	teams: number[],
	warning: string | null = null,
): Dashboard['upcomingMatches'][number] {
	return {
		key: displayLabel,
		displayLabel,
		startTime: minutes === null ? null : minutesFromNow(minutes),
		warning,
		break: null,
		alliance,
		teams,
	};
}

const qualificationNormal = {
	eventKey: '2026test',
	updatedAt: minutesFromNow(-1),
	competitionPhase: 'qualification',
	alliancePartners: [],
	currentActivity: { type: 'match', displayLabel: 'Q36' },
	nextMatch: {
		displayLabel: 'Q42',
		startTime: minutesFromNow(14),
		timing: { queued: timing(-1, true), onDeck: timing(5) },
	},
	upcomingMatches: [
		upcomingMatch('Q42', 14, 'red', [581, 254, 1678]),
		upcomingMatch('Q47', 52, 'blue', [604, 581, 9408, 973], '3 match turnaround'),
		upcomingMatch('Q55', null, 'red', [581, 841, 3045], '2nd match after lunch'),
	],
	eliminationPaths: [],
} satisfies Dashboard;

const qualificationBeforeStart = {
	...qualificationNormal,
	updatedAt: minutesFromNow(0),
	currentActivity: null,
	nextMatch: {
		displayLabel: 'Q3',
		startTime: minutesFromNow(18),
		timing: { queued: timing(6), onDeck: timing(12) },
	},
	upcomingMatches: [
		upcomingMatch('Q3', 18, 'red', [581, 254, 1678], '3rd match after the start of the day'),
		upcomingMatch('Q9', 64, 'blue', [581, 604, 9408]),
	],
} satisfies Dashboard;

const qualificationUrgent = {
	...qualificationNormal,
	updatedAt: minutesFromNow(-7),
	currentActivity: { type: 'match', displayLabel: 'Q50' },
	nextMatch: {
		displayLabel: 'Q51',
		startTime: minutesFromNow(-1),
		timing: { queued: timing(-8, true), onDeck: timing(-4, true) },
	},
	upcomingMatches: [upcomingMatch('Q51', -1, 'blue', [581, 604, 9408], 'Back to back')],
} satisfies Dashboard;

const qualificationComplete = {
	...qualificationNormal,
	currentActivity: { type: 'match', displayLabel: 'Q70' },
	nextMatch: null,
	upcomingMatches: [],
} satisfies Dashboard;

const allianceSelectionWaiting = {
	...qualificationComplete,
	competitionPhase: 'allianceSelection',
	currentActivity: null,
	alliancePartners: [],
} satisfies Dashboard;

const allianceSelectionAssigned = {
	...allianceSelectionWaiting,
	alliancePartners: [254, 1678, 9408],
} satisfies Dashboard;

const eliminationPending = {
	...qualificationComplete,
	competitionPhase: 'elimination',
	alliancePartners: [254, 1678, 9408],
	currentActivity: null,
	eliminationPaths: [],
} satisfies Dashboard;

const scheduledEliminationBreak = {
	label: 'Field reset',
	durationMinutes: 10,
	endTime: minutesFromNow(12),
	hasStarted: false,
	hasEnded: false,
	previousMatch: { displayLabel: 'M8', startTime: minutesFromNow(-2) },
} satisfies NonNullable<Dashboard['eliminationPaths'][number]['break']>;

const activeEliminationBreak = {
	...scheduledEliminationBreak,
	endTime: minutesFromNow(8),
	hasStarted: true,
} satisfies NonNullable<Dashboard['eliminationPaths'][number]['break']>;

const activeAwardsBreak = {
	label: 'Awards break',
	durationMinutes: 15,
	endTime: minutesFromNow(12),
	hasStarted: true,
	hasEnded: false,
	previousMatch: { displayLabel: 'M13', startTime: minutesFromNow(-4) },
} satisfies NonNullable<Dashboard['eliminationPaths'][number]['break']>;

const eliminationPaths = {
	...eliminationPending,
	currentActivity: { type: 'match', displayLabel: 'M7' },
	nextMatch: {
		displayLabel: 'M11',
		startTime: minutesFromNow(28),
		timing: { queued: timing(16), onDeck: timing(22) },
	},
	upcomingMatches: [upcomingMatch('M11', 28, 'red', [581, 254, 1678, 9408])],
	eliminationPaths: [
		{ outcome: 'win', displayLabel: 'M11', startTime: minutesFromNow(28), break: null, alliance: 'red' },
		{
			outcome: 'lose',
			displayLabel: 'M9',
			startTime: minutesFromNow(18),
			break: activeEliminationBreak,
			alliance: 'blue',
		},
	],
} satisfies Dashboard;

const eliminationScheduledBreak = {
	...eliminationPaths,
	eliminationPaths: [
		{ outcome: 'win', displayLabel: 'M11', startTime: minutesFromNow(28), break: null, alliance: 'red' },
		{
			outcome: 'lose',
			displayLabel: 'M9',
			startTime: minutesFromNow(18),
			break: scheduledEliminationBreak,
			alliance: 'blue',
		},
	],
} satisfies Dashboard;

const eliminationWithEliminatedPath = {
	...eliminationPaths,
	currentActivity: { type: 'match', displayLabel: 'M13' },
	nextMatch: {
		displayLabel: 'F1',
		startTime: minutesFromNow(34),
		timing: { queued: timing(22), onDeck: timing(28) },
	},
	upcomingMatches: [upcomingMatch('F1', 34, 'blue', [581, 254, 1678])],
	eliminationPaths: [
		{ outcome: 'win', displayLabel: 'F1', startTime: minutesFromNow(34), break: null, alliance: 'blue' },
		{ outcome: 'lose', displayLabel: null, startTime: null, break: null, alliance: null },
	],
} satisfies Dashboard;

const awardsBreak = {
	...eliminationWithEliminatedPath,
	currentActivity: { type: 'awards', endsAt: minutesFromNow(12) },
	nextMatch: {
		displayLabel: 'F1',
		startTime: minutesFromNow(18),
		timing: { queued: timing(8), onDeck: timing(13) },
	},
	upcomingMatches: [{ ...upcomingMatch('F1', 18, 'blue', [581, 254, 1678]), break: activeAwardsBreak }],
	eliminationPaths: [],
} satisfies Dashboard;

export type DashboardScenario = {
	connected: boolean;
	dashboard: Dashboard | null | undefined;
	description: string;
	id: string;
	name: string;
};

export const dashboardScenarios = [
	{
		id: 'loading',
		name: 'Loading',
		description: 'The initial connection before Convex returns a value.',
		connected: false,
		dashboard: undefined,
	},
	{
		id: 'no-event',
		name: 'No event',
		description: 'The backend is connected but no active Nexus event is stored.',
		connected: true,
		dashboard: null,
	},
	{
		id: 'qualification-before-start',
		name: 'Qualification before start',
		description: 'The first team match is scheduled and the field is not active yet.',
		connected: true,
		dashboard: qualificationBeforeStart,
	},
	{
		id: 'qualification-normal',
		name: 'Qualification normal',
		description: 'A typical qualification state with actual timing and three upcoming matches.',
		connected: true,
		dashboard: qualificationNormal,
	},
	{
		id: 'qualification-urgent',
		name: 'Qualification urgent',
		description: 'A back-to-back match with stale data and a disconnected server.',
		connected: false,
		dashboard: qualificationUrgent,
	},
	{
		id: 'qualification-complete',
		name: 'Qualification complete',
		description: 'The team has no scheduled matches remaining.',
		connected: true,
		dashboard: qualificationComplete,
	},
	{
		id: 'alliance-selection-waiting',
		name: 'Alliance selection waiting',
		description: 'Qualifications are complete and the alliance is not known.',
		connected: true,
		dashboard: allianceSelectionWaiting,
	},
	{
		id: 'alliance-selection-assigned',
		name: 'Alliance selection assigned',
		description: 'A four-team playoff alliance has been assigned.',
		connected: true,
		dashboard: allianceSelectionAssigned,
	},
	{
		id: 'elimination-pending',
		name: 'Elimination pending',
		description: 'The event is in eliminations but the bracket has not resolved a path.',
		connected: true,
		dashboard: eliminationPending,
	},
	{
		id: 'elimination-scheduled-break',
		name: 'Elimination scheduled break',
		description: 'Both bracket destinations are known and a field reset is scheduled.',
		connected: true,
		dashboard: eliminationScheduledBreak,
	},
	{
		id: 'elimination-paths',
		name: 'Elimination paths',
		description: 'Both win and lose destinations are known, including an active field reset.',
		connected: true,
		dashboard: eliminationPaths,
	},
	{
		id: 'elimination-eliminated-path',
		name: 'Elimination with eliminated path',
		description: 'The upper path reaches finals while the lower path eliminates the team.',
		connected: true,
		dashboard: eliminationWithEliminatedPath,
	},
	{
		id: 'awards-break',
		name: 'Awards break',
		description: 'Awards are active before the next finals match.',
		connected: true,
		dashboard: awardsBreak,
	},
] as const satisfies readonly DashboardScenario[];

export function dashboardScenario(id: (typeof dashboardScenarios)[number]['id']): DashboardScenario {
	const scenario = dashboardScenarios.find((candidate) => candidate.id === id);
	if (!scenario) throw new Error(`Unknown dashboard scenario: ${id}`);
	return scenario;
}
