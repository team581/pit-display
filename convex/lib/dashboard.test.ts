import { describe, expect, it } from 'vite-plus/test';
import type { Doc } from '../_generated/dataModel';
import { createDashboardData } from './dashboard';

type NexusMatch = Doc<'eventStatuses'>['matches'][number];

const minute = 60_000;
const now = Date.UTC(2026, 0, 1, 12);

function match(label: string, overrides: Partial<NexusMatch> = {}): NexusMatch {
	return {
		label,
		status: 'Queuing soon',
		redTeams: ['1', '2', '3'],
		blueTeams: ['4', '5', '6'],
		times: {},
		...overrides,
	};
}

describe('createDashboardData', () => {
	it('builds the display model from a trimmed Nexus snapshot', () => {
		const dashboard = createDashboardData({
			receivedAt: now - 5_000,
			matches: [
				match('Qualification 10', {
					status: 'On field',
					times: { scheduledStartTime: now, estimatedStartTime: now },
				}),
				match('Qualification 12', {
					redTeams: ['581', '254', '1678'],
					times: {
						scheduledStartTime: now + 15 * minute,
						estimatedQueueTime: now + 25 * minute,
						estimatedOnDeckTime: now + 10 * minute,
						estimatedStartTime: now + 15 * minute,
					},
				}),
				match('Qualification 18', {
					blueTeams: ['581', '1323', '971'],
					times: { scheduledStartTime: now + 75 * minute, estimatedStartTime: now + 75 * minute },
				}),
			],
		});

		expect(dashboard).toMatchObject({
			updatedAt: now - 5_000,
			currentMatch: { displayLabel: 'Q10', state: 'On field' },
			nextMatch: {
				displayLabel: 'Q12',
				scheduledTime: now + 15 * minute,
				milestones: [
					{ label: 'Queued', time: now + 25 * minute, isActual: false },
					{ label: 'On deck', time: now + 10 * minute, isActual: false },
					{ label: 'Match start', time: now + 15 * minute, isActual: false },
				],
			},
			upcomingMatches: [
				{
					key: 'Qualification 12',
					displayLabel: 'Q12',
					startTime: now + 15 * minute,
					scheduledTime: now + 15 * minute,
					status: 'scheduled',
					queueingAt: now + 5 * minute,
					turnaroundWarning: 'Tight · 15 min',
					alliance: 'red',
					teams: [581, 254, 1678],
				},
				{
					key: 'Qualification 18',
					displayLabel: 'Q18',
					startTime: now + 75 * minute,
					status: 'scheduled',
					queueingAt: null,
					turnaroundWarning: null,
					alliance: 'blue',
					teams: [581, 1323, 971],
				},
			],
		});
	});

	it('builds the display model before the event starts', () => {
		const dashboard = createDashboardData({
			receivedAt: now - 5_000,
			matches: [
				match('Qualification 3', {
					redTeams: ['581', '254', '1678'],
					times: {
						estimatedQueueTime: now + 5 * minute,
						estimatedOnDeckTime: now + 10 * minute,
						estimatedStartTime: now + 15 * minute,
					},
				}),
				match('Qualification 8', {
					blueTeams: ['581', '1323', '971'],
					times: { estimatedStartTime: now + 60 * minute },
				}),
			],
		});

		expect(dashboard).toMatchObject({
			currentMatch: null,
			nextMatch: { displayLabel: 'Q3', scheduledTime: now + 15 * minute },
			upcomingMatches: [
				{ displayLabel: 'Q3', turnaroundWarning: null },
				{ displayLabel: 'Q8', turnaroundWarning: null },
			],
		});
	});

	it('returns null until a team match exists', () => {
		expect(createDashboardData({ receivedAt: now, matches: [] })).toBeNull();
		expect(
			createDashboardData({ receivedAt: now, matches: [match('Qualification 10', { status: 'On field' })] }),
		).toBeNull();
	});
});
