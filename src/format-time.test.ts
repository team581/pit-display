import { describe, expect, it } from 'vite-plus/test';
import { formatRelativeTime } from './format-time';

const minute = 60_000;

describe('formatRelativeTime', () => {
	it('formats future and past timestamps for their display context', () => {
		expect(formatRelativeTime(15 * minute, 0, '~')).toBe('~15 min');
		expect(formatRelativeTime(75 * minute, 0, 'in ')).toBe('in 1 hr 15 min');
		expect(formatRelativeTime(0, 15 * minute, '~')).toBe('15 min ago');
		expect(formatRelativeTime(null, 0, '~')).toBe('Not available');
	});
});
