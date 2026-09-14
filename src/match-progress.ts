export function queueProgress(
	startedAt: number | null | undefined,
	queuesAt: number | null | undefined,
	now: number,
): number {
	if (startedAt == null || queuesAt == null) return 0;
	if (queuesAt <= startedAt) return now >= queuesAt ? 1 : 0;
	return Math.min(1, Math.max(0, (now - startedAt) / (queuesAt - startedAt)));
}
