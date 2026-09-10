import type { Dashboard, UpcomingMatch } from './dashboard';

export function milestoneState(
	milestone: Pick<Dashboard['nextMatch']['milestones'][number], 'isActual' | 'time'>,
	now: number,
): 'future' | 'past' | 'soon' {
	if (milestone.isActual || (milestone.time !== null && milestone.time <= now)) return 'past';
	return milestone.time !== null && milestone.time - now <= 10 * 60_000 ? 'soon' : 'future';
}

export function statusPill(
	match: Pick<UpcomingMatch, 'queueingAt' | 'status' | 'turnaroundWarning'>,
	now: number,
): { label: string; tone: 'neutral' | 'queueing' | 'warning' } | null {
	if (match.status === 'on-deck') return { label: 'On deck', tone: 'neutral' };
	if (match.status === 'queueing' || (match.queueingAt !== null && match.queueingAt <= now)) {
		return { label: 'Queueing soon', tone: 'queueing' };
	}
	return match.turnaroundWarning ? { label: match.turnaroundWarning, tone: 'warning' } : null;
}
