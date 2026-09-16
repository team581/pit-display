import { describe, expect, it } from 'vite-plus/test';
import { formatMatchTiming, timingStatusMilestones } from './dashboard-time';

const minute = 60_000;

describe('dashboard time state', () => {
	it('shows the next operational milestone until the team is on deck', () => {
		const timing = {
			queued: { time: 5 * minute, isActual: false },
			onDeck: { time: 10 * minute, isActual: false },
		};
		expect(timingStatusMilestones(timing)).toEqual([{ label: 'Queued', ...timing.queued }]);
		timing.queued.isActual = true;
		expect(timingStatusMilestones(timing)).toEqual([{ label: 'On deck', ...timing.onDeck }]);
		timing.onDeck.isActual = true;
		expect(timingStatusMilestones(timing)).toEqual([
			{ label: 'On deck', ...timing.onDeck },
			{ label: 'Queued', ...timing.queued },
		]);
	});

	it('shows overdue estimates as soon until the milestone actually happens', () => {
		const timing = { time: 5 * minute, isActual: false };
		expect(formatMatchTiming(timing, 4 * minute)).toBe('in 1 min 0 sec');
		expect(formatMatchTiming(timing, 4 * minute, '')).toBe('1 min 0 sec');
		expect(formatMatchTiming(timing, 5 * minute)).toBe('Soon');
		expect(formatMatchTiming(timing, 6 * minute)).toBe('Soon');

		timing.isActual = true;
		expect(formatMatchTiming(timing, 6 * minute)).toBe('1 min 0 sec ago');
	});
});
