import { describe, expect, it } from 'vite-plus/test';
import { nexusApiMatch as match } from '../testing/nexus-match';
import { extractEventStatus } from './extract-event-status';

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
			competitionPhase: 'qualification',
			alliancePartners: [],
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
					times: { scheduledStartTime: 200, estimatedOnFieldTime: 190, actualOnFieldTime: 195 },
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

	it('reports alliance selection and extracts our assigned partners', () => {
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 128,
			matches: [
				match('Qualification 1', { status: 'On field', redTeams: ['581', '2', '3'] }),
				match('Playoff 1', { redTeams: ['581', '254', '1678', '9408'], blueTeams: null }),
				match('Playoff 2', { redTeams: null, blueTeams: null }),
				match('Playoff 3', { redTeams: null, blueTeams: null }),
				match('Playoff 4', { redTeams: null, blueTeams: null }),
			],
		});

		expect(extracted).toMatchObject({
			competitionPhase: 'allianceSelection',
			alliancePartners: ['254', '1678', '9408'],
		});
	});

	it('keeps four-team alliance selection active until playoffs begin queuing', () => {
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 129,
			matches: [
				match('Qualification 1', { status: 'On field', redTeams: ['581', '2', '3'] }),
				match('Playoff 1', { redTeams: ['581', '254', '1678', '9408'] }),
				match('Playoff 2'),
				match('Playoff 3'),
				match('Playoff 4'),
			],
		});

		expect(extracted?.competitionPhase).toBe('allianceSelection');
	});

	it('reports eliminations once a playoff match begins queuing', () => {
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 130,
			matches: [
				match('Qualification 1', { status: 'On field', redTeams: ['581', '2', '3'] }),
				match('Playoff 1', { status: 'Now queuing', redTeams: ['581', '254', '1678', '9408'] }),
				match('Playoff 2', { redTeams: null, blueTeams: null }),
			],
		});

		expect(extracted?.competitionPhase).toBe('elimination');
		expect(extracted?.matches.map(({ label }) => label)).toEqual(['Playoff 1', 'Playoff 2']);
	});

	it('preserves configured playoff break duration', () => {
		const extracted = extractEventStatus(
			{
				eventKey: '2026test',
				dataAsOfTime: 133,
				matches: [
					match('Qualification 1', { status: 'On field' }),
					match('Playoff 1', {
						status: 'Now queuing',
						redTeams: ['581', '254', '1678'],
						breakAfter: 'Break',
					}),
					match('Playoff 2'),
				],
			},
			{ 'Playoff 1': 5 },
		);

		expect(extracted?.matches[1]?.afterBreak).toEqual({
			breakLabel: 'a break',
			durationMinutes: 5,
			position: 1,
		});
	});

	it('uses an on-deck elimination match instead of the last qualification match', () => {
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 131,
			matches: [
				match('Qualification 56', { status: 'On field', redTeams: ['581', '2', '3'] }),
				match('Playoff 1', { status: 'On deck' }),
				match('Playoff 2', { redTeams: ['581', '254', '1678'] }),
			],
		});

		expect(extracted?.matches.map(({ label }) => label)).toEqual(['Playoff 1', 'Playoff 2']);
	});

	it('uses a newer on-deck playoff match after the previous match leaves the field', () => {
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 132,
			matches: [
				match('Qualification 56', { status: 'On field', redTeams: ['581', '2', '3'] }),
				match('Playoff 1', { status: 'On field' }),
				match('Playoff 2', { status: 'On deck' }),
				match('Playoff 5', { redTeams: ['581', '254', '1678'] }),
			],
		});

		expect(extracted?.matches.map(({ label }) => label)).toEqual(['Playoff 1', 'Playoff 2', 'Playoff 5']);
	});

	it('retains our last playoff match while its result is unresolved', () => {
		const extracted = extractEventStatus({
			eventKey: '2026test',
			dataAsOfTime: 134,
			matches: [
				match('Qualification 56', { status: 'On field' }),
				match('Playoff 7', { status: 'On field', redTeams: ['581', '254', '1678'] }),
				match('Playoff 8', { status: 'On field' }),
				match('Playoff 9', { redTeams: null, blueTeams: null }),
			],
		});

		expect(extracted?.matches.map(({ label }) => label)).toEqual(['Playoff 7', 'Playoff 8', 'Playoff 9']);
	});
});
