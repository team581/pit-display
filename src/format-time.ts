import { Temporal } from 'temporal-polyfill';

const clockWithSecondsFormatter = new Intl.DateTimeFormat(undefined, {
	hour: 'numeric',
	minute: '2-digit',
	second: '2-digit',
});

export function formatClock(time: number | null): string {
	return time === null
		? 'Not available'
		: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(time);
}

export function formatClockWithSeconds(time: number): string {
	return clockWithSecondsFormatter.format(time);
}

const durationFormatter = new Intl.DurationFormat('en-US', {
	style: 'short',
	minutes: 'narrow',
	minutesDisplay: 'auto',
});
const secondDurationFormatter = new Intl.DurationFormat('en-US', {
	style: 'short',
	minutes: 'narrow',
	minutesDisplay: 'auto',
	seconds: 'narrow',
	secondsDisplay: 'always',
});
const wholeHoursThreshold = 6 * 60 * 60_000;

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
	const absoluteDifference = Math.abs(difference);
	const displayedPrecision =
		absoluteDifference >= wholeHoursThreshold
			? 'hours'
			: precision === 'seconds' && absoluteDifference < 10 * 60_000
				? 'seconds'
				: 'minutes';
	const duration = Temporal.Duration.from({ milliseconds: Math.abs(difference) }).round({
		largestUnit: 'hours',
		smallestUnit: displayedPrecision,
		roundingMode: displayedPrecision === 'seconds' ? 'floor' : 'halfExpand',
	});
	const formattedDuration = formatDuration(duration, displayedPrecision === 'seconds' ? 'seconds' : 'minutes');
	return difference < 0 ? `${formattedDuration} ago` : `${futurePrefix}${formattedDuration}`;
}

export function formatMatchStart(time: number | null, now: number): string {
	return time === null
		? 'Start time unavailable'
		: `Starts ${formatClock(time)} (${formatRelativeTime(time, now, '')})`;
}
