import { Temporal } from 'temporal-polyfill';

export function formatClock(time: number | null): string {
	return time === null
		? 'Not available'
		: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(time);
}

const durationFormatter = new Intl.DurationFormat(undefined, { style: 'short' });
const secondDurationFormatter = new Intl.DurationFormat(undefined, {
	style: 'short',
	seconds: 'short',
	secondsDisplay: 'always',
});
function formatDuration(duration: Temporal.Duration, precision: 'minutes' | 'seconds'): string {
	const formatter = precision === 'minutes' ? durationFormatter : secondDurationFormatter;
	return formatter.format(duration).replaceAll(',', '');
}

export function formatRelativeTime(
	time: number | null,
	now: number,
	futurePrefix: '' | 'in ' | '~',
	precision: 'minutes' | 'seconds' = 'minutes',
): string {
	if (time === null) return 'Not available';
	const difference = time - now;
	if (Math.abs(difference) < (precision === 'seconds' ? 1000 : 30_000)) return 'now';
	const displayedPrecision = precision === 'seconds' && Math.abs(difference) < 10 * 60_000 ? 'seconds' : 'minutes';
	const duration = Temporal.Duration.from({ milliseconds: Math.abs(difference) }).round({
		largestUnit: 'hours',
		smallestUnit: displayedPrecision,
		roundingMode: displayedPrecision === 'seconds' ? 'floor' : 'halfExpand',
	});
	const formattedDuration = formatDuration(duration, displayedPrecision);
	return difference < 0 ? `${formattedDuration} ago` : `${futurePrefix}${formattedDuration}`;
}
