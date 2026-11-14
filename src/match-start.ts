import { formatMatchTiming } from './dashboard-time';
import { formatClock, formatRelativeTime } from './format-time';

const MISSING_START_TEXT = 'Time TBD';

/**
 * The only phrasings for when a match starts.
 * - `clock`: Starts 11:14 AM
 * - `relative`: in 14m
 * - `row`: Starts 11:14 AM (in 14m)
 * - `countdown`: 14m, shown under a "Starts in" label
 */
export type MatchStartVariant = 'clock' | 'countdown' | 'relative' | 'row';

export function matchStartText(time: number | null, now: number, variant: MatchStartVariant): string {
	if (time === null) return MISSING_START_TEXT;
	switch (variant) {
		case 'clock':
			return `Starts ${formatClock(time)}`;
		case 'relative':
			return formatRelativeTime(time, now, 'in ');
		case 'row':
			return `Starts ${formatClock(time)} (${formatRelativeTime(time, now, 'in ')})`;
		case 'countdown':
			return formatMatchTiming({ time, isActual: false }, now, '');
	}
}
