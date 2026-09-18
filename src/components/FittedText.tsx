import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';

const styles = stylex.create({
	root: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	measurement: {
		position: 'absolute',
		visibility: 'hidden',
		pointerEvents: 'none',
		whiteSpace: 'nowrap',
	},
});

export function FittedText({
	children,
	className,
	maxFontSize,
}: {
	children: string;
	className?: string;
	maxFontSize: string;
}) {
	const rootRef = useRef<HTMLSpanElement>(null);
	const measurementRef = useRef<HTMLElement>(null);
	const [fontSize, setFontSize] = useState(maxFontSize);

	useLayoutEffect(() => {
		const root = rootRef.current;
		const measurement = measurementRef.current;
		if (!root || !measurement) return;

		const fit = () => {
			const measuredWidth = measurement.getBoundingClientRect().width;
			const maximum = Number.parseFloat(getComputedStyle(measurement).fontSize);
			if (measuredWidth <= 0 || maximum <= 0) return;

			const availableWidth = Math.max(0, root.clientWidth - 1);
			const fontSize = Math.min(maximum, maximum * (availableWidth / measuredWidth));
			setFontSize(`${Math.floor(fontSize * 100) / 100}px`);
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
	}, [children, maxFontSize]);

	const measurementClassName = `${stylex.props(styles.measurement).className} ${className ?? ''}`;

	return (
		<span {...stylex.props(styles.root)} ref={rootRef}>
			<TextMorph as="strong" className={className} style={{ fontSize }}>
				{children}
			</TextMorph>
			<strong
				aria-hidden="true"
				className={measurementClassName}
				ref={measurementRef}
				style={{ fontSize: maxFontSize }}
			>
				{children}
			</strong>
		</span>
	);
}
