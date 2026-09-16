import { describe, expect, it } from 'vite-plus/test';
import { formatTimingMilestoneTime, timingStatusMilestones } from './dashboard-time';

const minute = 60_000;

describe('dashboard time state', () => {
	it('shows the next operational milestone until the team is on deck', () => {
		const milestones = [
			{ label: 'Queued', time: 5 * minute, isActual: false },
			{ label: 'On deck', time: 10 * minute, isActual: false },
			{ label: 'Match start', time: 15 * minute, isActual: false },
		];
		expect(timingStatusMilestones(milestones)).toEqual([milestones[0]]);
		milestones[0]!.isActual = true;
		expect(timingStatusMilestones(milestones)).toEqual([milestones[1]]);
		milestones[1]!.isActual = true;
		expect(timingStatusMilestones(milestones)).toEqual([milestones[1], milestones[0]]);
	});

	it('shows overdue estimates as soon until the milestone actually happens', () => {
		const milestone = { label: 'Queued', time: 5 * minute, isActual: false };
		expect(formatTimingMilestoneTime(milestone, 4 * minute)).toBe('in 1 min 0 sec');
		expect(formatTimingMilestoneTime(milestone, 4 * minute, '')).toBe('1 min 0 sec');
		expect(formatTimingMilestoneTime(milestone, 5 * minute)).toBe('Soon');
		expect(formatTimingMilestoneTime(milestone, 6 * minute)).toBe('Soon');

		milestone.isActual = true;
		expect(formatTimingMilestoneTime(milestone, 6 * minute)).toBe('1 min 0 sec ago');
	});
});
