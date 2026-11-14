import { composeStories } from '@storybook/react-vite';
import { beforeEach, describe, expect, test } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { render } from 'vitest-browser-react';
import { DashboardView } from '../App';
import * as chipStories from '../components/Chips.stories';
import { dashboardScenarios, SCENARIO_NOW } from './dashboard-scenarios';
import { expectTextFits, nextFrame, waitForAssets } from './visual-test-utils';

// The iPad in landscape is the primary display; phones are the second priority.
const viewports = [
	{ name: 'ipad', width: 1376, height: 1032, scrolls: false },
	{ name: 'phone', width: 390, height: 844, scrolls: true },
] as const;

for (const viewport of viewports) {
	describe(viewport.name, () => {
		beforeEach(async () => {
			await page.viewport(viewport.width, viewport.height);
		});

		for (const scenario of dashboardScenarios) {
			test(scenario.name, async () => {
				await render(
					<DashboardView connected={scenario.connected} dashboard={scenario.dashboard} now={SCENARIO_NOW} />,
				);
				await waitForAssets();
				await nextFrame();

				expect(document.documentElement.scrollWidth).toBe(viewport.width);
				if (!viewport.scrolls) expect(document.documentElement.scrollHeight).toBe(viewport.height);
				if (scenario.dashboard) expectTextFits();

				if (viewport.scrolls) {
					// Grow the viewport to the page so the screenshot shows everything below the fold.
					await page.viewport(viewport.width, Math.max(viewport.height, document.documentElement.scrollHeight));
					await nextFrame();
				}

				const name = `${scenario.id}-${viewport.name}`;
				if (scenario.dashboard) {
					await expect(page.getByRole('main')).toMatchScreenshot(name);
				} else {
					// The empty state's text morphs in, so allow for antialiasing differences.
					await expect(page.getByRole('main')).toMatchScreenshot(name, {
						comparatorName: 'pixelmatch',
						comparatorOptions: { threshold: 0.01 },
					});
				}
			});
		}
	});
}

describe('chips', () => {
	beforeEach(async () => {
		await page.viewport(1376, 1032);
	});

	for (const [name, Story] of Object.entries(composeStories(chipStories))) {
		test(name, async () => {
			await render(<Story />);
			await waitForAssets();
			await expect(page.getByTestId('visual-target')).toMatchScreenshot(`chips-${name}`);
		});
	}
});
