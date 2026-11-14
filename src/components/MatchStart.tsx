import { ClientOnly } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { matchStartText, type MatchStartVariant } from '../match-start';

/**
 * Renders match start text, holding back clock times until hydration because the server's time zone can differ.
 */
export function MatchStart({
	children: render,
	now,
	time,
	variant,
}: {
	children: (text: string) => ReactNode;
	now: number;
	time: number | null;
	variant: MatchStartVariant;
}) {
	const text = matchStartText(time, now, variant);
	if (time === null || variant === 'relative' || variant === 'countdown') return render(text);
	return <ClientOnly fallback={render('Starts —')}>{render(text)}</ClientOnly>;
}
