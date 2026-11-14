import { expect } from 'vite-plus/test';

export async function waitForAssets() {
	await document.fonts.ready;
	await Promise.all(
		[...document.images].map(
			(image) =>
				new Promise<void>((resolve) => {
					if (image.complete) resolve();
					else {
						image.addEventListener('load', () => resolve(), { once: true });
						image.addEventListener('error', () => resolve(), { once: true });
					}
				}),
		),
	);
}

/** Waits for ResizeObserver-driven text fitting to settle after a render or resize. */
export function nextFrame() {
	return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/** The visible text of each FittedText inside `container`. */
export function fittedTexts(container: ParentNode = document): HTMLElement[] {
	return [...container.querySelectorAll<HTMLElement>('[data-fitted-text]')].map(
		(root) => root.firstElementChild as HTMLElement,
	);
}

/**
 * Asserts that every FittedText inside `container` stays inside its box. With `minFill`, also asserts that the text
 * isn't fitted so small that it leaves its box mostly empty.
 */
export function expectTextFits(container: ParentNode = document, { minFill }: { minFill?: number } = {}) {
	const texts = fittedTexts(container);
	if (container !== document) expect(texts.length).toBeGreaterThan(0);
	for (const text of texts) {
		const box = text.parentElement!.getBoundingClientRect();
		const bounds = text.getBoundingClientRect();
		const label = `"${text.textContent}"`;
		expect(bounds.left, label).toBeGreaterThanOrEqual(box.left - 0.5);
		expect(bounds.right, label).toBeLessThanOrEqual(box.right + 0.5);
		expect(bounds.top, label).toBeGreaterThanOrEqual(box.top - 0.5);
		expect(bounds.bottom, label).toBeLessThanOrEqual(box.bottom + 0.5);
		if (minFill !== undefined) expect(bounds.width / box.width, label).toBeGreaterThan(minFill);
	}
}

export function fontSize(element: Element) {
	return Number.parseFloat(getComputedStyle(element).fontSize);
}
