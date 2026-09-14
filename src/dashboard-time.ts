import type { Dashboard } from './dashboard';

export function activeTimingMilestoneIndex(milestones: NonNullable<Dashboard['nextMatch']>['milestones']): number {
	return milestones.findLastIndex(({ isActual }) => isActual);
}
