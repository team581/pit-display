export function formatClock(time: number | null): string {
	return time === null
		? 'Not available'
		: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(time);
}

function formatDuration(milliseconds: number): string {
	const minutes = Math.max(0, Math.round(milliseconds / 60_000));
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return remainingMinutes === 0 ? `${hours} hr` : `${hours} hr ${remainingMinutes} min`;
}

export function formatRelativeTime(time: number | null, now: number, futurePrefix: 'in ' | '~'): string {
	if (time === null) return 'Not available';
	const difference = time - now;
	if (Math.abs(difference) < 30_000) return 'now';
	return difference < 0 ? `${formatDuration(-difference)} ago` : `${futurePrefix}${formatDuration(difference)}`;
}
