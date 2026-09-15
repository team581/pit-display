import type { CSSProperties } from 'react';
import { TextMorph } from 'torph/react';

export function MatchLabel({
	className,
	displayLabel,
	style,
}: {
	className?: string;
	displayLabel?: string;
	style?: CSSProperties;
}) {
	return (
		<strong className={className} style={style}>
			<TextMorph>{displayLabel?.[0] ?? '—'}</TextMorph>
			<TextMorph>{displayLabel?.slice(1) ?? ''}</TextMorph>
		</strong>
	);
}
