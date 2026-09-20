import { Fragment, type CSSProperties, type ElementType } from 'react';
import { TextMorph } from 'torph/react';
import { splitDurationText } from './split-duration-text';

export function DurationMorph({
	as: Element = 'span',
	children,
	className,
	style,
}: {
	as?: ElementType;
	children: string;
	className?: string;
	style?: CSSProperties;
}) {
	const parts = splitDurationText(children);
	const rootStyle: CSSProperties = {
		display: 'inline-block',
		position: 'relative',
		verticalAlign: 'top',
		whiteSpace: 'pre',
		fontVariantNumeric: 'tabular-nums',
		textAlign: 'inherit',
		...style,
	};

	if (!parts.some((part) => part.type === 'number')) {
		return (
			<TextMorph as={Element} className={className} style={rootStyle}>
				{children}
			</TextMorph>
		);
	}

	return (
		<Element className={className} style={rootStyle}>
			{parts.map((part) =>
				part.type === 'number' ? (
					<Fragment key={part.key}>
						<TextMorph>{part.value}</TextMorph>
						{part.unit}
					</Fragment>
				) : (
					<Fragment key={part.key}>{part.value}</Fragment>
				),
			)}
		</Element>
	);
}
