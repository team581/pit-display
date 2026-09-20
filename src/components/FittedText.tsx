import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { DurationMorph } from './DurationMorph';

const styles = stylex.create({
	root: {
		display: 'flex',
		position: 'relative',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	startAligned: {
		justifyContent: 'flex-start',
	},
	measurement: {
		position: 'absolute',
		visibility: 'hidden',
		pointerEvents: 'none',
		whiteSpace: 'nowrap',
	},
});

function pixels(value: string) {
	return Number.parseFloat(value) || 0;
}

function availableHeight(root: HTMLElement) {
	const parent = root.parentElement;
	if (!parent) return root.clientHeight;

	const parentStyle = getComputedStyle(parent);
	let height = parent.clientHeight - pixels(parentStyle.paddingTop) - pixels(parentStyle.paddingBottom);
	const isColumnFlex =
		(parentStyle.display === 'flex' || parentStyle.display === 'inline-flex') &&
		parentStyle.flexDirection.startsWith('column');
	if (isColumnFlex) {
		const siblings = [...parent.children].filter((child) => child !== root);
		for (const sibling of siblings) {
			const siblingStyle = getComputedStyle(sibling);
			height -=
				sibling.getBoundingClientRect().height + pixels(siblingStyle.marginTop) + pixels(siblingStyle.marginBottom);
		}
		height -= pixels(parentStyle.rowGap) * siblings.length;
	}

	return Math.max(0, height);
}

export function FittedText({
	align = 'center',
	children,
	className,
	fitHeight = false,
	maxFontSize,
	morphDuration = false,
}: {
	align?: 'center' | 'start';
	children: string;
	className?: string;
	fitHeight?: boolean;
	maxFontSize?: string;
	morphDuration?: boolean;
}) {
	const rootRef = useRef<HTMLSpanElement>(null);
	const measurementRef = useRef<HTMLElement>(null);
	const [fontSize, setFontSize] = useState(maxFontSize);

	useLayoutEffect(() => {
		const root = rootRef.current;
		const measurement = measurementRef.current;
		if (!root || !measurement) return;

		const fit = () => {
			const measurementBounds = measurement.getBoundingClientRect();
			const measuredWidth = measurementBounds.width;
			const maximum = Number.parseFloat(getComputedStyle(measurement).fontSize);
			if (measuredWidth <= 0 || maximum <= 0) return;

			const availableWidth = Math.max(0, root.clientWidth - 1);
			const width = maximum * (availableWidth / measuredWidth);
			const availableTextHeight = availableHeight(root);
			const height =
				fitHeight && measurementBounds.height > availableTextHeight + 1
					? maximum * (availableTextHeight / measurementBounds.height)
					: maximum;
			const fontSize = Math.min(maximum, width, height);
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
	}, [children, fitHeight, maxFontSize]);

	const measurementClassName = `${stylex.props(styles.measurement).className} ${className ?? ''}`;

	return (
		<span {...stylex.props(styles.root, align === 'start' && styles.startAligned)} ref={rootRef}>
			{morphDuration ? (
				<DurationMorph as="strong" className={className} style={fontSize ? { fontSize } : undefined}>
					{children}
				</DurationMorph>
			) : (
				<TextMorph as="strong" className={className} style={fontSize ? { fontSize } : undefined}>
					{children}
				</TextMorph>
			)}
			<strong
				aria-hidden="true"
				className={measurementClassName}
				ref={measurementRef}
				style={maxFontSize ? { fontSize: maxFontSize } : undefined}
			>
				{children}
			</strong>
		</span>
	);
}
