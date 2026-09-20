import type { Dashboard } from './dashboard';
import { formatRelativeTime } from './format-time';

type NextMatch = NonNullable<Dashboard['nextMatch']>;
type MatchTiming = NextMatch['timing']['queued'];
type TimingStatus = MatchTiming & { label: 'On deck' | 'Queued' };

export function timingStatusMilestones(timing: NextMatch['timing']): TimingStatus[] {
	const queued = { label: 'Queued', ...timing.queued } as const;
	const onDeck = { label: 'On deck', ...timing.onDeck } as const;

	if (onDeck.isActual) return [onDeck, ...(queued.isActual ? [queued] : [])];
	if (queued.isActual) return [onDeck, queued];
	return [queued];
}

export function formatMatchTiming(timing: MatchTiming, now: number, futurePrefix: '' | 'in ' = 'in '): string {
	if (!timing.isActual && timing.time !== null && timing.time <= now) return 'Soon';
	return formatRelativeTime(timing.time, now, futurePrefix, 'seconds');
}

export function isBetweenQueueAndMatch(queuedAt: number | null, startsAt: number | null, now: number): boolean {
	return queuedAt !== null && startsAt !== null && queuedAt <= now && now < startsAt;
}
