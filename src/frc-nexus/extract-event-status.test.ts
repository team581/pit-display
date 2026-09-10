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
					times: {},
				},
				{
					label: 'Qualification 4',
					status: 'Queuing soon',
					redTeams: ['1', '2', '3'],
					blueTeams: ['581', '5', '6'],
					times: { scheduledStartTime: 200 },
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
});
