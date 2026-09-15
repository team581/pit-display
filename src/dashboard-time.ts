import type { Dashboard } from './dashboard';
import { formatRelativeTime } from './format-time';

type TimingMilestone = NonNullable<Dashboard['nextMatch']>['milestones'][number];

export function activeTimingMilestoneIndex(milestones: NonNullable<Dashboard['nextMatch']>['milestones']): number {
	return milestones.findLastIndex(({ isActual }) => isActual);
}

export function formatTimingMilestoneTime(milestone: TimingMilestone, now: number): string {
	if (!milestone.isActual && milestone.time !== null && milestone.time <= now) return 'Soon';
	return formatRelativeTime(milestone.time, now, 'in ', 'seconds');
}
