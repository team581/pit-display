import { formatRelativeTime } from '../format-time';

type BreakStatus = {
	durationMinutes: number | null;
	endTime: number | null;
	hasEnded: boolean;
	hasStarted: boolean;
};

export function isBreakActive(breakStatus: BreakStatus, now: number): boolean {
	return (
		breakStatus.hasStarted &&
		!breakStatus.hasEnded &&
		breakStatus.durationMinutes !== null &&
		breakStatus.endTime !== null &&
		now >= breakStatus.endTime - breakStatus.durationMinutes * 60_000
	);
}

export function breakStatusText(breakStatus: BreakStatus, now: number): string {
	if (breakStatus.durationMinutes === null) return 'Time unavailable';
	if (isBreakActive(breakStatus, now) && breakStatus.endTime !== null) {
		if (now >= breakStatus.endTime) return 'Ends soon';
		const remaining = formatRelativeTime(breakStatus.endTime, now, '');
		return `Ends in ${remaining === 'now' ? '<1m' : remaining}`;
	}
	return `${breakStatus.durationMinutes}m`;
}
