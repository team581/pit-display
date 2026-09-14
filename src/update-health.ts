import { formatRelativeTime } from './format-time';

const nexusStaleAfter = 5 * 60_000;

export function updateHealthState(
	connected: boolean,
	receivedAt: number | undefined,
	now: number,
): { label: string; hasProblem: boolean } {
	const updateAge = receivedAt === undefined ? null : formatRelativeTime(receivedAt, now, 'in ', 'seconds');
	const nexusIsStale = receivedAt === undefined || now - receivedAt >= nexusStaleAfter;

	if (connected && !nexusIsStale) return { label: `Nexus updated ${updateAge}`, hasProblem: false };

	const messages: string[] = [];
	if (!connected) messages.push('Server disconnected');
	if (receivedAt === undefined) messages.push('Nexus has not updated');
	else if (nexusIsStale) messages.push(`Nexus outdated · updated ${updateAge}`);
	else messages.push(`Nexus updated ${updateAge}`);
	return { label: messages.join(' · '), hasProblem: true };
}
