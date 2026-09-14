import { describe, expect, it } from 'vite-plus/test';
import { queueProgress } from './match-progress';

describe('match progress', () => {
	it('tracks time from the current match start to the next queue time', () => {
		expect(queueProgress(1_000, 2_000, 0)).toBe(0);
		expect(queueProgress(0, 10_000, 5_000)).toBe(0.5);
		expect(queueProgress(0, 10_000, 11_000)).toBe(1);
		expect(queueProgress(null, 10_000, 5_000)).toBe(0);
		expect(queueProgress(0, null, 5_000)).toBe(0);
		expect(queueProgress(10_000, 10_000, 9_000)).toBe(0);
		expect(queueProgress(10_000, 5_000, 6_000)).toBe(1);
	});
});
