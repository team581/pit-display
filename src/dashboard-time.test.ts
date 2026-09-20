import { describe, expect, it } from 'vite-plus/test';
import { formatMatchTiming, isBetweenQueueAndMatch, timingStatusMilestones } from './dashboard-time';

const minute = 60_000;

describe('dashboard time state', () => {
	it('shows the next operational milestone until the team is on deck', () => {
		const timing = {
			queued: { time: 5 * minute, isActual: false },
			onDeck: { time: 10 * minute, isActual: false },
		};
		expect(timingStatusMilestones(timing)).toEqual([{ label: 'Queued', ...timing.queued }]);
		timing.queued.isActual = true;
		expect(timingStatusMilestones(timing)).toEqual([
			{ label: 'On deck', ...timing.onDeck },
			{ label: 'Queued', ...timing.queued },
		]);
		timing.onDeck.isActual = true;
		expect(timingStatusMilestones(timing)).toEqual([
			{ label: 'On deck', ...timing.onDeck },
			{ label: 'Queued', ...timing.queued },
		]);
	});

	it('shows overdue estimates as soon until the milestone actually happens', () => {
		const timing = { time: 5 * minute, isActual: false };
		expect(formatMatchTiming(timing, 4 * minute)).toBe('in 1m 0s');
		expect(formatMatchTiming(timing, 4 * minute, '')).toBe('1m 0s');
		expect(formatMatchTiming(timing, 5 * minute)).toBe('Soon');
		expect(formatMatchTiming(timing, 6 * minute)).toBe('Soon');

		timing.isActual = true;
		expect(formatMatchTiming(timing, 6 * minute)).toBe('1m 0s ago');
	});

	it('identifies the time between queue and match countdowns reaching zero', () => {
		expect(isBetweenQueueAndMatch(5 * minute, 10 * minute, 4 * minute)).toBe(false);
		expect(isBetweenQueueAndMatch(5 * minute, 10 * minute, 5 * minute)).toBe(true);
		expect(isBetweenQueueAndMatch(5 * minute, 10 * minute, 9 * minute)).toBe(true);
		expect(isBetweenQueueAndMatch(5 * minute, 10 * minute, 10 * minute)).toBe(false);
		expect(isBetweenQueueAndMatch(null, 10 * minute, 6 * minute)).toBe(false);
		expect(isBetweenQueueAndMatch(5 * minute, null, 6 * minute)).toBe(false);
	});
});
