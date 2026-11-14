import { FittedText } from './FittedText';

export function MatchLabel({
	align,
	className,
	displayLabel,
	fitHeight,
	maxFontSize,
}: {
	align?: 'center' | 'start';
	className?: string;
	displayLabel?: string;
	fitHeight?: boolean;
	maxFontSize?: string;
}) {
	return (
		<FittedText align={align} className={className} fitHeight={fitHeight} maxFontSize={maxFontSize} morph="label">
			{displayLabel ?? '—'}
		</FittedText>
	);
}
