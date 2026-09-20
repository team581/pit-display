import { useLayoutEffect, useRef, type CSSProperties } from 'react';

function pixels(value: string) {
	return Number.parseFloat(value) || 0;
}

function availableTextWidth(element: HTMLElement) {
	const parent = element.parentElement;
	if (!parent) return element.clientWidth;

	const parentStyle = getComputedStyle(parent);
	if (parentStyle.display === 'grid' || parentStyle.display === 'inline-grid') {
		return element.getBoundingClientRect().width;
	}

	let width = parent.clientWidth - pixels(parentStyle.paddingLeft) - pixels(parentStyle.paddingRight);
	if (parentStyle.display === 'flex' || parentStyle.display === 'inline-flex') {
		const siblings = [...parent.children].filter((child) => child !== element);
		for (const sibling of siblings) {
			const siblingStyle = getComputedStyle(sibling);
			width -=
				sibling.getBoundingClientRect().width + pixels(siblingStyle.marginLeft) + pixels(siblingStyle.marginRight);
		}
		width -= pixels(parentStyle.columnGap) * siblings.length;
	}

	return width;
}

export function useFittedText(text: string, enabled: boolean, maxFontSize?: CSSProperties['fontSize']) {
	const textRef = useRef<HTMLElement>(null);

	useLayoutEffect(() => {
		const element = textRef.current;
		if (!element || !enabled) return;

		const resetFontSize = () => {
			if (maxFontSize === undefined) element.style.removeProperty('font-size');
			else element.style.fontSize = typeof maxFontSize === 'number' ? `${maxFontSize}px` : maxFontSize;
		};

		const measurement = document.createElement('span');
		measurement.style.position = 'fixed';
		measurement.style.visibility = 'hidden';
		measurement.style.pointerEvents = 'none';
		measurement.style.whiteSpace = 'nowrap';
		measurement.textContent = text;
		document.body.append(measurement);

		const fit = () => {
			resetFontSize();

			const computed = getComputedStyle(element);
			measurement.style.fontFamily = computed.fontFamily;
			measurement.style.fontFeatureSettings = computed.fontFeatureSettings;
			measurement.style.fontKerning = computed.fontKerning;
			measurement.style.fontSize = computed.fontSize;
			measurement.style.fontStretch = computed.fontStretch;
			measurement.style.fontStyle = computed.fontStyle;
			measurement.style.fontVariant = computed.fontVariant;
			measurement.style.fontVariantNumeric = computed.fontVariantNumeric;
			measurement.style.fontWeight = computed.fontWeight;
			measurement.style.letterSpacing = computed.letterSpacing;

			const measuredWidth = measurement.getBoundingClientRect().width;
			const maximum = Number.parseFloat(computed.fontSize);
			if (measuredWidth <= 0 || maximum <= 0) return;

			const availableWidth = Math.max(0, availableTextWidth(element) - 1);
			if (measuredWidth <= availableWidth) return;
			const fontSize = maximum * (availableWidth / measuredWidth);
			element.style.fontSize = `${Math.floor(fontSize * 100) / 100}px`;
		};

		fit();
		let fitFrame: number | undefined;
		const scheduleFit = () => {
			if (fitFrame !== undefined) cancelAnimationFrame(fitFrame);
			fitFrame = requestAnimationFrame(fit);
		};
		const observer = new ResizeObserver(scheduleFit);
		observer.observe(element);
		if (element.parentElement) {
			observer.observe(element.parentElement);
			for (const sibling of element.parentElement.children) observer.observe(sibling);
		}
		let disposed = false;
		void document.fonts.ready.then(() => {
			if (!disposed) scheduleFit();
		});

		return () => {
			disposed = true;
			if (fitFrame !== undefined) cancelAnimationFrame(fitFrame);
			observer.disconnect();
			measurement.remove();
			resetFontSize();
		};
	}, [enabled, maxFontSize, text]);

	return textRef;
}
