import { describe, expect, it } from 'vite-plus/test';
import { storedNexusMatch as match } from '../../src/testing/nexus-match';
import { createDashboardData as createDashboard } from './dashboard';

const minute = 60_000;
const now = Date.UTC(2026, 0, 1, 12);
type Snapshot = Parameters<typeof createDashboard>[0];
type SnapshotFixture = Omit<Snapshot, 'alliancePartners' | 'competitionPhase'> &
	Partial<Pick<Snapshot, 'alliancePartners' | 'competitionPhase'>>;

function createDashboardData(status: SnapshotFixture) {
	return createDashboard({ competitionPhase: 'qualification', alliancePartners: [], ...status });
}

describe('createDashboardData', () => {
	it('builds the display model from a trimmed Nexus snapshot', () => {
		const dashboard = createDashboardData({
			eventKey: 'demo9705',
			receivedAt: now - 5_000,
			matches: [
				match('Qualification 10', {
					status: 'On field',
					times: { scheduledStartTime: now, estimatedStartTime: now, actualOnFieldTime: now - minute },
				}),
				match('Qualification 12', {
					redTeams: ['581', '254', '1678'],
					times: {
						scheduledStartTime: now + 30 * minute,
						estimatedQueueTime: now + 5 * minute,
						estimatedOnDeckTime: now + 10 * minute,
						estimatedStartTime: now + 15 * minute,
					},
				}),
				match('Qualification 18', {
					blueTeams: ['581', '604', '9408'],
					times: { scheduledStartTime: now + 75 * minute, estimatedStartTime: now + 75 * minute },
				}),
			],
		});

		expect(dashboard).toMatchObject({
			eventKey: 'demo9705',
			updatedAt: now - 5_000,
			currentActivity: { type: 'match', displayLabel: 'Q10' },
			nextMatch: {
				displayLabel: 'Q12',
				startTime: now + 15 * minute,
				alliance: 'red',
				requiresBumperChange: false,
				timing: {
					queued: { time: now + 5 * minute, isActual: false },
					onDeck: { time: now + 10 * minute, isActual: false },
				},
			},
			upcomingMatches: [
				{
					key: 'Qualification 12',
					displayLabel: 'Q12',
					startTime: now + 15 * minute,
					warning: null,
					alliance: 'red',
					teams: [581, 254, 1678],
				},
				{
					key: 'Qualification 18',
					displayLabel: 'Q18',
					startTime: now + 75 * minute,
					warning: null,
					alliance: 'blue',
					teams: [581, 604, 9408],
				},
			],
		});
	});

	it('marks qualification replays with an R suffix', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			matches: [
				match('Qualification 98', { status: 'On field' }),
				match('Qualification 99 Replay', { redTeams: ['581', '2', '3'] }),
			],
		});

		expect(dashboard).toMatchObject({
			nextMatch: { displayLabel: 'Q99R' },
			upcomingMatches: [{ displayLabel: 'Q99R' }],
		});
	});

	it('requires a bumper change when the next team match has a different alliance color', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			matches: [
				match('Qualification 8', { status: 'On field', redTeams: ['581', '2', '3'] }),
				match('Qualification 9', { status: 'On field' }),
				match('Qualification 12', { blueTeams: ['581', '5', '6'] }),
			],
		});

		expect(dashboard?.nextMatch).toMatchObject({
			alliance: 'blue',
			requiresBumperChange: true,
		});
	});

	it('does not require a bumper change when the alliance color stays the same', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			matches: [
				match('Qualification 8', { status: 'On field', blueTeams: ['581', '2', '3'] }),
				match('Qualification 12', { blueTeams: ['581', '5', '6'] }),
			],
		});

		expect(dashboard?.nextMatch?.requiresBumperChange).toBe(false);
	});

	it('warns about a short turnaround after another Team 581 match', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			matches: [
				match('Qualification 10', {
					status: 'On field',
					redTeams: ['581', '2', '3'],
					times: { estimatedStartTime: now },
				}),
				match('Qualification 12', {
					blueTeams: ['581', '5', '6'],
					times: { estimatedStartTime: now + 15 * minute },
				}),
			],
		});

		expect(dashboard?.upcomingMatches[0]?.warning).toBe('15m turnaround');
	});

	it('calculates the current match end from its actual start time', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			matches: [
				match('Qualification 17', {
					status: 'On field',
					times: { estimatedStartTime: now + minute, actualStartTime: now },
				}),
				match('Qualification 23', {
					redTeams: ['581', '2', '3'],
					times: { estimatedQueueTime: now + 37 * minute },
				}),
			],
		});

		expect(dashboard?.currentActivity).toEqual({
			type: 'match',
			displayLabel: 'Q17',
			endsAt: now + 163_000,
		});
	});

	it('does not estimate a match end when the actual start time is unavailable', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			matches: [
				match('Qualification 17', {
					status: 'On field',
					times: { estimatedStartTime: now - minute },
				}),
			],
		});

		expect(dashboard?.currentActivity).toEqual({
			type: 'match',
			displayLabel: 'Q17',
			endsAt: null,
		});
	});

	it('does not treat the current field match as ours when calculating turnaround', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			matches: [
				match('Qualification 35', { status: 'On field' }),
				match('Qualification 36', { blueTeams: ['581', '5', '6'] }),
				match('Qualification 39', { redTeams: ['581', '2', '3'] }),
			],
		});

		expect(dashboard?.upcomingMatches.map(({ warning }) => warning)).toEqual([null, '2 match turnaround']);
	});

	it('reports zero matches of turnaround for back-to-back matches', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			matches: [
				match('Qualification 50', {
					status: 'On field',
					redTeams: ['581', '2', '3'],
				}),
				match('Qualification 51', { blueTeams: ['581', '5', '6'] }),
			],
		});

		expect(dashboard?.upcomingMatches[0]?.warning).toBe('Back to back');
	});

	it('builds the display model before the event starts', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now - 5_000,
			matches: [
				match('Qualification 3', {
					redTeams: ['581', '254', '1678'],
					afterBreak: { breakLabel: 'the start of the day', position: 3 },
					times: {
						estimatedQueueTime: now + 5 * minute,
						estimatedOnDeckTime: now + 10 * minute,
						estimatedStartTime: now + 15 * minute,
					},
				}),
				match('Qualification 8', {
					blueTeams: ['581', '604', '9408'],
					times: { estimatedStartTime: now + 60 * minute },
				}),
			],
		});

		expect(dashboard).toMatchObject({
			currentActivity: null,
			nextMatch: { displayLabel: 'Q3', startTime: now + 15 * minute },
			upcomingMatches: [
				{ displayLabel: 'Q3', warning: '3rd match after the start of the day' },
				{ displayLabel: 'Q8', warning: null },
			],
		});
	});

	it('keeps displaying event state when no Team 581 matches remain', () => {
		expect(createDashboardData({ eventKey: '2026test', receivedAt: now, matches: [] })).toMatchObject({
			currentActivity: null,
			nextMatch: null,
			upcomingMatches: [],
		});
		expect(
			createDashboardData({
				eventKey: '2026test',
				receivedAt: now,
				matches: [match('Qualification 10', { status: 'On field', redTeams: ['581', '2', '3'] })],
			}),
		).toMatchObject({
			currentActivity: { type: 'match', displayLabel: 'Q10' },
			nextMatch: null,
			upcomingMatches: [],
		});
	});

	it('includes competition phase and numeric alliance partners', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			competitionPhase: 'allianceSelection',
			alliancePartners: ['254', '1678'],
			matches: [],
		});

		expect(dashboard).toMatchObject({
			competitionPhase: 'allianceSelection',
			alliancePartners: [254, 1678],
		});
	});

	it('keeps all four teams in a playoff alliance', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			competitionPhase: 'elimination',
			alliancePartners: ['254', '1678', '9408'],
			matches: [match('Playoff 1', { redTeams: ['581', '254', '1678', '9408'] })],
		});

		expect(dashboard?.upcomingMatches[0]?.teams).toEqual([581, 254, 1678, 9408]);
	});

	it('shows an on-deck elimination match instead of the last qualification match', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			competitionPhase: 'elimination',
			alliancePartners: ['254', '1678'],
			matches: [
				match('Qualification 56', { status: 'On field' }),
				match('Playoff 1', {
					status: 'On deck',
					redTeams: ['581', '254', '1678'],
					times: { actualOnDeckTime: now - minute, estimatedStartTime: now + 5 * minute },
				}),
			],
		});

		expect(dashboard).toMatchObject({
			currentActivity: { type: 'match', displayLabel: 'M1' },
			nextMatch: { displayLabel: 'M1' },
		});
	});

	it('keeps the on-field elimination match active while the next match is on deck', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			competitionPhase: 'elimination',
			matches: [
				match('Playoff 9', { status: 'On field', times: { actualStartTime: now - minute } }),
				match('Playoff 10', { status: 'On deck', times: { actualOnDeckTime: now - 2 * minute } }),
			],
		});

		expect(dashboard?.currentActivity).toMatchObject({
			type: 'match',
			displayLabel: 'M9',
		});
	});

	it('shows an active awards break as the current field activity', () => {
		const awardsEnd = now + 15 * minute;
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			competitionPhase: 'elimination',
			alliancePartners: ['254', '1678'],
			matches: [
				match('Playoff 13', { status: 'On field' }),
				match('Final 1', {
					status: 'On deck',
					redTeams: ['581', '254', '1678'],
					afterBreak: { breakLabel: 'an awards break', durationMinutes: 15, position: 1 },
					times: { estimatedOnFieldTime: awardsEnd, estimatedStartTime: awardsEnd + 3 * minute },
				}),
			],
		});

		expect(dashboard).toMatchObject({
			currentActivity: { type: 'awards', endsAt: awardsEnd },
			nextMatch: { displayLabel: 'F1' },
			eliminationPaths: [],
		});
	});

	it('shows both possible next playoff matches with bumper colors, timing, and breaks', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			competitionPhase: 'elimination',
			alliancePartners: ['254', '1678'],
			matches: [
				match('Playoff 1', { status: 'On deck', redTeams: ['581', '254', '1678'] }),
				match('Playoff 4', { status: 'On field', times: { estimatedStartTime: now + 5 * minute } }),
				match('Playoff 5', { times: { estimatedStartTime: now + 20 * minute } }),
				match('Playoff 7', {
					afterBreak: { breakLabel: 'a break', durationMinutes: 10, position: 2 },
					times: { estimatedStartTime: now + 35 * minute },
				}),
			],
		});

		expect(dashboard?.eliminationPaths).toEqual([
			{
				outcome: 'win',
				displayLabel: 'M7',
				startTime: now + 35 * minute,
				break: {
					label: 'Break',
					durationMinutes: 10,
					endTime: now + 20 * minute,
					hasStarted: true,
					hasEnded: false,
					previousMatch: { displayLabel: 'M4', startTime: now + 5 * minute },
				},
				alliance: 'red',
			},
			{
				outcome: 'lose',
				displayLabel: 'M5',
				startTime: now + 20 * minute,
				break: null,
				alliance: 'red',
			},
		]);
	});

	it('shows elimination as the losing path from the lower bracket', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			competitionPhase: 'elimination',
			matches: [
				match('Playoff 5', { redTeams: ['581', '254', '1678'] }),
				match('Playoff 10', { times: { estimatedStartTime: now + 30 * minute } }),
			],
		});

		expect(dashboard?.eliminationPaths).toEqual([
			{
				outcome: 'win',
				displayLabel: 'M10',
				startTime: now + 30 * minute,
				break: null,
				alliance: 'blue',
			},
			{ outcome: 'lose', displayLabel: null, startTime: null, break: null, alliance: null },
		]);
	});

	it('keeps unresolved paths after the field advances past our match', () => {
		const dashboard = createDashboardData({
			eventKey: '2026test',
			receivedAt: now,
			competitionPhase: 'elimination',
			matches: [
				match('Playoff 7', { status: 'On field', redTeams: ['581', '254', '1678'] }),
				match('Playoff 8', { status: 'On field' }),
				match('Playoff 9', { redTeams: [], blueTeams: [] }),
				match('Playoff 11', { redTeams: [], blueTeams: [] }),
			],
		});

		expect(dashboard).toMatchObject({
			currentActivity: { type: 'match', displayLabel: 'M8' },
			nextMatch: null,
			eliminationPaths: [
				{ outcome: 'win', displayLabel: 'M11', alliance: 'red' },
				{ outcome: 'lose', displayLabel: 'M9', alliance: 'red' },
			],
		});
	});
});
