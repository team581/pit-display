import type { CSSProperties } from 'react';
import { TextMorph } from 'torph/react';
import { useFittedText } from './use-fitted-text';

export function MatchLabel({
	className,
	displayLabel,
	style,
}: {
	className?: string;
	displayLabel?: string;
	style?: CSSProperties;
}) {
	const label = displayLabel ?? '—';
	const ref = useFittedText(label, label.length > 3, style?.fontSize);

	return (
		<strong className={className} ref={ref} style={style}>
			<TextMorph>{label[0]}</TextMorph>
			<TextMorph>{label.slice(1)}</TextMorph>
		</strong>
	);
}
