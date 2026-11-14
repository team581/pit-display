import { describe, expect, it } from 'vite-plus/test';
import { matchStartText } from './match-start';

const minute = 60_000;

describe('matchStartText', () => {
	it('uses one phrase for a missing start time in every variant', () => {
		for (const variant of ['clock', 'countdown', 'relative', 'row'] as const) {
			expect(matchStartText(null, 0, variant)).toBe('Time TBD');
		}
	});

	it('words relative times the same way in rows and on their own', () => {
		expect(matchStartText(14 * minute, 0, 'relative')).toBe('in 14m');
		expect(matchStartText(14 * minute, 0, 'row')).toMatch(/^Starts .+ \(in 14m\)$/);
		expect(matchStartText(0, minute, 'row')).toMatch(/\(1m ago\)$/);
	});

	it('shows a countdown without a prefix, and "Soon" once an estimated start passes', () => {
		expect(matchStartText(14 * minute, 0, 'countdown')).toBe('14m');
		expect(matchStartText(0, minute, 'countdown')).toBe('Soon');
	});
});
