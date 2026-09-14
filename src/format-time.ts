export function formatClock(time: number | null): string {
	return time === null
		? 'Not available'
		: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(time);
}

function formatDuration(milliseconds: number, precision: 'minutes' | 'seconds'): string {
	if (precision === 'seconds') {
		const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		if (hours > 0) return `${hours} hr ${minutes} min ${seconds} sec`;
		return minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
	}

	const minutes = Math.max(0, Math.round(milliseconds / 60_000));
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return remainingMinutes === 0 ? `${hours} hr` : `${hours} hr ${remainingMinutes} min`;
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
	return difference < 0
		? `${formatDuration(-difference, precision)} ago`
		: `${futurePrefix}${formatDuration(difference, precision)}`;
}
