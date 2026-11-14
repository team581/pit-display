import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { DurationMorph } from './DurationMorph';

const styles = stylex.create({
	root: {
		display: 'flex',
		position: 'relative',
		width: '100%',
		minWidth: 0,
		alignItems: 'center',
		justifyContent: 'center',
		// Keep the text out of the box's min-content width, or fitting feeds back into grid and flex track sizes.
		contain: 'inline-size',
	},
	startAligned: {
		justifyContent: 'flex-start',
	},
	// The parent must be a column flex container: the root takes the leftover height, so it can be measured without
	// depending on the text inside it.
	fillHeight: {
		minHeight: 0,
		flex: '1 1 0',
		contain: 'size',
	},
	measurement: {
		position: 'absolute',
		visibility: 'hidden',
		pointerEvents: 'none',
		whiteSpace: 'nowrap',
	},
});

function Morph({ morph, text }: { morph: 'duration' | 'label' | 'text'; text: string }) {
	if (morph === 'duration') return <DurationMorph>{text}</DurationMorph>;
	if (morph === 'label') {
		// Morph the prefix separately so Q99 → Q99R keeps the Q in place.
		return (
			<>
				<TextMorph>{text[0]}</TextMorph>
				<TextMorph>{text.slice(1)}</TextMorph>
			</>
		);
	}
	return <TextMorph>{text}</TextMorph>;
}

/**
 * Text that shrinks from its maximum size until it fits its own box. The box is sized by layout, never by the text.
 * Without `maxFontSize`, the maximum is the font size from `className`.
 */
export function FittedText({
	align = 'center',
	children,
	className,
	fitHeight = false,
	maxFontSize,
	morph = 'text',
}: {
	align?: 'center' | 'start';
	children: string;
	className?: string;
	fitHeight?: boolean;
	maxFontSize?: string;
	morph?: 'duration' | 'label' | 'text';
}) {
	const rootRef = useRef<HTMLSpanElement>(null);
	const measurementRef = useRef<HTMLElement>(null);
	const [fontSize, setFontSize] = useState(maxFontSize);

	useLayoutEffect(() => {
		const root = rootRef.current;
		const measurement = measurementRef.current;
		if (!root || !measurement) return;

		const fit = () => {
			const measured = measurement.getBoundingClientRect();
			const maximum = Number.parseFloat(getComputedStyle(measurement).fontSize);
			if (measured.width <= 0 || maximum <= 0) return;

			const width = maximum * (Math.max(0, root.clientWidth - 1) / measured.width);
			const height = fitHeight ? maximum * (root.clientHeight / measured.height) : maximum;
			setFontSize(`${Math.floor(Math.min(maximum, width, height) * 100) / 100}px`);
		};

		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(root);
		observer.observe(measurement);
		let disposed = false;
		void document.fonts.ready.then(() => {
			if (!disposed) fit();
		});

		return () => {
			disposed = true;
			observer.disconnect();
		};
	}, [children, fitHeight, maxFontSize]);

	return (
		<span
			{...stylex.props(styles.root, align === 'start' && styles.startAligned, fitHeight && styles.fillHeight)}
			data-fitted-text=""
			ref={rootRef}
		>
			<strong className={className} style={{ display: 'inline-block', whiteSpace: 'pre', fontSize }}>
				<Morph morph={morph} text={children} />
			</strong>
			<strong
				aria-hidden="true"
				className={`${stylex.props(styles.measurement).className} ${className ?? ''}`}
				ref={measurementRef}
				style={maxFontSize ? { fontSize: maxFontSize } : undefined}
			>
				{children}
			</strong>
		</span>
	);
}
