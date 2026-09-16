import type { Dashboard } from './dashboard';
import { formatRelativeTime } from './format-time';

type TimingMilestone = NonNullable<Dashboard['nextMatch']>['milestones'][number];

export function timingStatusMilestones(
	milestones: NonNullable<Dashboard['nextMatch']>['milestones'],
): TimingMilestone[] {
	const queued = milestones.find(({ label }) => label === 'Queued');
	const onDeck = milestones.find(({ label }) => label === 'On deck');

	if (onDeck?.isActual) return [onDeck, ...(queued?.isActual ? [queued] : [])];
	if (queued?.isActual) return onDeck ? [onDeck] : [];
	return queued ? [queued] : [];
}

export function formatTimingMilestoneTime(
	milestone: TimingMilestone,
	now: number,
	futurePrefix: '' | 'in ' = 'in ',
): string {
	if (!milestone.isActual && milestone.time !== null && milestone.time <= now) return 'Soon';
	return formatRelativeTime(milestone.time, now, futurePrefix, 'seconds');
}
