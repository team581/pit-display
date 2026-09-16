import { describe, expect, it } from 'vite-plus/test';
import { breakStatusText, isBreakActive } from './elimination-break';

const minute = 60_000;

describe('breakStatusText', () => {
	it('shows the scheduled duration before the break starts', () => {
		expect(
			breakStatusText({ durationMinutes: 10, endTime: 20 * minute, hasStarted: false, hasEnded: false }, 5 * minute),
		).toBe('10 min');
	});

	it('counts down only after the preceding match reaches the field', () => {
		const breakStatus = { durationMinutes: 10, endTime: 20 * minute, hasStarted: false, hasEnded: false };
		expect(isBreakActive(breakStatus, 15 * minute)).toBe(false);
		expect(breakStatusText(breakStatus, 15 * minute)).toBe('10 min');

		breakStatus.hasStarted = true;
		expect(isBreakActive(breakStatus, 15 * minute)).toBe(true);
		expect(breakStatusText(breakStatus, 15 * minute)).toBe('Ends in 5 min');

		breakStatus.hasEnded = true;
		expect(isBreakActive(breakStatus, 15 * minute)).toBe(false);
		expect(breakStatusText(breakStatus, 15 * minute)).toBe('10 min');
	});
});
