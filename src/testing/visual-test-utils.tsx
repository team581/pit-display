import { beforeEach, expect, test } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { render } from 'vitest-browser-react';
import { DashboardView } from '../App';
import type { Dashboard } from '../dashboard';
import { dashboardScenario, SCENARIO_NOW } from './dashboard-scenarios';

export function setupVisualTests() {
	beforeEach(async () => {
		await page.viewport(1376, 1032);
		expect(window.innerWidth).toBe(1376);
		expect(window.innerHeight).toBe(1032);
	});
}

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

export function requireDashboard(id: Parameters<typeof dashboardScenario>[0]): Dashboard {
	const dashboard = dashboardScenario(id).dashboard;
	if (!dashboard) throw new Error(`Scenario ${id} does not contain dashboard data`);
	return dashboard;
}

export function testDashboardScenarios(ids: readonly Parameters<typeof dashboardScenario>[0][]) {
	for (const id of ids) {
		const scenario = dashboardScenario(id);
		test(`dashboard: ${scenario.name}`, async () => {
			await render(<DashboardView connected={scenario.connected} dashboard={scenario.dashboard} now={SCENARIO_NOW} />);
			await waitForAssets();
			expect(document.querySelector('main')?.getBoundingClientRect().width).toBe(1376);
			expect(document.documentElement.scrollWidth).toBe(window.innerWidth);
			expect(document.documentElement.scrollHeight).toBe(window.innerHeight);
			if (scenario.dashboard === null || scenario.dashboard === undefined) {
				expect(getComputedStyle(document.querySelector('main')!).backgroundColor).toBe('rgb(38, 30, 29)');
				await expect(page.getByRole('main')).toMatchScreenshot(scenario.id, {
					comparatorName: 'pixelmatch',
					comparatorOptions: { threshold: 0.01 },
				});
			} else {
				await expect(page.getByRole('main')).toMatchScreenshot(scenario.id);
			}
		});
	}
}
