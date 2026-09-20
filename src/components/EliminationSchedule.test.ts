import { describe, expect, it } from 'vite-plus/test';
import { breakStatusText, isBreakActive } from './elimination-break';

const minute = 60_000;

describe('breakStatusText', () => {
	it('shows the scheduled duration before the break starts', () => {
		expect(
			breakStatusText({ durationMinutes: 10, endTime: 20 * minute, hasStarted: false, hasEnded: false }, 5 * minute),
		).toBe('10m');
	});

	it('counts down only after the preceding match reaches the field', () => {
		const breakStatus = { durationMinutes: 10, endTime: 20 * minute, hasStarted: false, hasEnded: false };
		expect(isBreakActive(breakStatus, 15 * minute)).toBe(false);
		expect(breakStatusText(breakStatus, 15 * minute)).toBe('10m');

		breakStatus.hasStarted = true;
		expect(isBreakActive(breakStatus, 15 * minute)).toBe(true);
		expect(breakStatusText(breakStatus, 15 * minute)).toBe('Ends in 5m');

		breakStatus.hasEnded = true;
		expect(isBreakActive(breakStatus, 15 * minute)).toBe(false);
		expect(breakStatusText(breakStatus, 15 * minute)).toBe('10m');
	});

	it('uses compact units when less than a minute remains', () => {
		expect(
			breakStatusText(
				{ durationMinutes: 10, endTime: 15 * minute + 29_000, hasStarted: true, hasEnded: false },
				15 * minute,
			),
		).toBe('Ends in <1m');
	});

	it('stays active after the estimated end until the next match reaches the field', () => {
		const breakStatus = { durationMinutes: 10, endTime: 20 * minute, hasStarted: true, hasEnded: false };

		expect(isBreakActive(breakStatus, 25 * minute)).toBe(true);
		expect(breakStatusText(breakStatus, 25 * minute)).toBe('Ends soon');

		breakStatus.hasEnded = true;
		expect(isBreakActive(breakStatus, 25 * minute)).toBe(false);
		expect(breakStatusText(breakStatus, 25 * minute)).toBe('10m');
	});
});
