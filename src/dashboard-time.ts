import type { Dashboard, UpcomingMatch } from './dashboard';

export function activeTimingMilestoneIndex(milestones: Dashboard['nextMatch']['milestones']): number {
	return milestones.findLastIndex(({ isActual }) => isActual);
}

export function statusPill(
	match: Pick<UpcomingMatch, 'status' | 'turnaroundWarning'>,
): { label: string; tone: 'neutral' | 'warning' } | null {
	if (match.status === 'on-deck') return { label: 'On deck', tone: 'neutral' };
	return match.turnaroundWarning ? { label: match.turnaroundWarning, tone: 'warning' } : null;
}
