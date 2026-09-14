import { describe, expect, it } from 'vite-plus/test';
import { extractEventStatus } from './extract-event-status';
import type { Match } from './generated/types.gen';

function match(label: string, overrides: Partial<Match> = {}): Match {
	return {
		label,
		status: 'Queuing soon',
		redTeams: ['1', '2', '3'],
		blueTeams: ['4', '5', '6'],
		times: {},
		...overrides,
	};
}

describe('extractEventStatus', () => {
	it('stores only the current field match and Team 581 matches that follow it', () => {
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 123,
			nowQueuing: 'Qualification 3',
			announcements: [{ announcement: 'Not needed by the dashboard' }],
			matches: [
				match('Qualification 1', { redTeams: ['581', '2', '3'] }),
				match('Qualification 2', { status: 'On field', times: { actualOnFieldTime: 100 } }),
				match('Qualification 3'),
				match('Qualification 4', {
					blueTeams: ['581', '5', '6'],
					times: { scheduledStartTime: 200, estimatedOnFieldTime: 190, actualOnFieldTime: 195 },
				}),
			],
		});

		expect(extracted).toEqual({
			eventKey: '2026test',
			dataAsOfTime: 123,
			teamIsPresent: true,
			matches: [
				{
					label: 'Qualification 2',
					status: 'On field',
					redTeams: ['1', '2', '3'],
					blueTeams: ['4', '5', '6'],
					times: { actualOnFieldTime: 100 },
				},
				{
					label: 'Qualification 4',
					status: 'Queuing soon',
					redTeams: ['1', '2', '3'],
					blueTeams: ['581', '5', '6'],
					times: { scheduledStartTime: 200, actualOnFieldTime: 195 },
				},
			],
		});
	});

	it('preserves team presence when Team 581 has no remaining matches', () => {
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 124,
			matches: [
				match('Qualification 1', { redTeams: ['581', '2', '3'] }),
				match('Qualification 2', { status: 'On field' }),
			],
		});

		expect(extracted).toMatchObject({
			teamIsPresent: true,
			matches: [{ label: 'Qualification 2' }],
		});
	});

	it('marks early and post-break matches using the full Nexus schedule', () => {
		const startOfDay = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 125,
			matches: [match('Qualification 3', { redTeams: ['581', '2', '3'] })],
		});
		expect(startOfDay?.matches[0]?.afterBreak).toEqual({
			breakLabel: 'the start of the day',
			position: 3,
		});

		const afterLunch = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 126,
			matches: [
				match('Qualification 10', { breakAfter: 'Lunch' }),
				match('Qualification 11'),
				match('Qualification 12', { blueTeams: ['581', '5', '6'] }),
			],
		});
		expect(afterLunch?.matches[0]?.afterBreak).toEqual({ breakLabel: 'lunch', position: 2 });
	});

	it('keeps warning for matches within 30 minutes of a break restart', () => {
		const baseTime = 10_000_000;
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 127,
			matches: [
				match('Qualification 10', { breakAfter: 'Break' }),
				match('Qualification 11', { times: { estimatedStartTime: baseTime } }),
				match('Qualification 12', { times: { estimatedStartTime: baseTime + 12 * 60_000 } }),
				match('Qualification 13', { times: { estimatedStartTime: baseTime + 24 * 60_000 } }),
				match('Qualification 14', {
					redTeams: ['581', '2', '3'],
					times: { estimatedStartTime: baseTime + 24 * 60_000 },
				}),
				match('Qualification 15', {
					blueTeams: ['581', '5', '6'],
					times: { estimatedStartTime: baseTime + 36 * 60_000 },
				}),
			],
		});

		expect(extracted?.matches[0]?.afterBreak).toEqual({ breakLabel: 'a break', position: 4 });
		expect(extracted?.matches[1]?.afterBreak).toBeUndefined();
	});
});
