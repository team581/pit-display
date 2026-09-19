import { describe, expect, it } from 'vite-plus/test';
import { formatMatchStart, formatRelativeTime } from './format-time';

const minute = 60_000;
const second = 1000;

describe('formatRelativeTime', () => {
	it('formats future and past timestamps for their display context', () => {
		expect(formatRelativeTime(15 * minute, 0, '')).toBe('15m');
		expect(formatRelativeTime(15 * minute, 0, '~')).toBe('~15m');
		expect(formatRelativeTime(75 * minute, 0, 'in ')).toBe('in 1h 15m');
		expect(formatRelativeTime(0, 15 * minute, '~')).toBe('15m ago');
		expect(formatRelativeTime(null, 0, '~')).toBe('Not available');
	});

	it('includes seconds when requested', () => {
		expect(formatRelativeTime(2 * minute + 34 * second, 0, 'in ', 'seconds')).toBe('in 2m 34s');
		expect(formatRelativeTime(0, 5 * minute + 12 * second, '', 'seconds')).toBe('5m 12s ago');
		expect(formatRelativeTime(5 * second, 0, 'in ', 'seconds')).toBe('in 5s');
		expect(formatRelativeTime(500, 0, 'in ', 'seconds')).toBe('now');
	});

	it('omits seconds for durations of at least ten minutes', () => {
		expect(formatRelativeTime(9 * minute + 59 * second, 0, 'in ', 'seconds')).toBe('in 9m 59s');
		expect(formatRelativeTime(10 * minute, 0, 'in ', 'seconds')).toBe('in 10m');
		expect(formatRelativeTime(75 * minute + 20 * second, 0, '', 'seconds')).toBe('1h 15m');
	});

	it('rounds durations of at least six hours to whole hours', () => {
		expect(formatRelativeTime((12 * 60 + 53) * minute, 0, 'in ')).toBe('in 13h');
		expect(formatRelativeTime(0, (6 * 60 + 20) * minute, '')).toBe('6h ago');
	});
});

describe('formatMatchStart', () => {
	it('uses one concise fallback when the start time is unknown', () => {
		expect(formatMatchStart(null, 0)).toBe('Start time unavailable');
	});
});
