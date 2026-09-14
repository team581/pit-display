import { describe, expect, it } from 'vite-plus/test';
import { activeTimingMilestoneIndex, statusPill } from './dashboard-time';

const minute = 60_000;

describe('dashboard time state', () => {
	it('selects exactly one current timing milestone', () => {
		const milestones = [
			{ label: 'Queued', time: 5 * minute, isActual: false },
			{ label: 'On deck', time: 10 * minute, isActual: false },
			{ label: 'Match start', time: 15 * minute, isActual: false },
		];
		expect(activeTimingMilestoneIndex(milestones)).toBe(-1);
		milestones[0]!.isActual = true;
		expect(activeTimingMilestoneIndex(milestones)).toBe(0);
		milestones[1]!.isActual = true;
		expect(activeTimingMilestoneIndex(milestones)).toBe(1);
	});

	it('shows confirmed statuses and turnaround warnings', () => {
		expect(statusPill({ status: 'scheduled', turnaroundWarning: '3 match turnaround' })).toEqual({
			label: '3 match turnaround',
			tone: 'warning',
		});
		expect(statusPill({ status: 'queueing', turnaroundWarning: null })).toBeNull();
	});
});
