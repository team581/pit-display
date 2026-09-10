import { describe, expect, it } from 'vite-plus/test';
import { milestoneState, statusPill } from './dashboard-time';

const minute = 60_000;

describe('dashboard time state', () => {
	it('derives milestone state from the local clock', () => {
		expect(milestoneState({ time: 5 * minute, isActual: false }, 0)).toBe('soon');
		expect(milestoneState({ time: 15 * minute, isActual: false }, 0)).toBe('future');
		expect(milestoneState({ time: 0, isActual: false }, minute)).toBe('past');
		expect(milestoneState({ time: 15 * minute, isActual: true }, 0)).toBe('past');
	});

	it('activates queueing pills without rerunning the Convex query', () => {
		const match = {
			status: 'scheduled' as const,
			queueingAt: 5 * minute,
			turnaroundWarning: 'Tight · 3 matches',
		};
		expect(statusPill(match, 0)).toEqual({ label: 'Tight · 3 matches', tone: 'warning' });
		expect(statusPill(match, 5 * minute)).toEqual({ label: 'Queueing soon', tone: 'queueing' });
	});
});
