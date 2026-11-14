import type { CSSProperties } from 'react';
import { beforeEach, expect, test } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { render } from 'vitest-browser-react';
import { DashboardView } from '../App';
import { MatchLabel } from '../components/MatchLabel';
import { MatchSummary } from '../components/MatchSummary';
import type { Dashboard } from '../dashboard';
import { dashboardScenario, SCENARIO_NOW } from './dashboard-scenarios';
import { expectTextFits, fittedTexts, fontSize, nextFrame, waitForAssets } from './visual-test-utils';

function requireDashboard(id: Parameters<typeof dashboardScenario>[0]): Dashboard {
	const dashboard = dashboardScenario(id).dashboard;
	if (!dashboard) throw new Error(`Scenario ${id} does not contain dashboard data`);
	return dashboard;
}

function byTestId(testId: string) {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

beforeEach(async () => {
	await page.viewport(1376, 1032);
});

test('match summary status text fills its pills as values and sizes change', async () => {
	const dashboard = requireDashboard('qualification-normal');
	const currentActivity = { type: 'match' as const, displayLabel: 'Q18', endsAt: SCENARIO_NOW + 2 * 60_000 };
	const nextMatch = { ...dashboard.nextMatch!, displayLabel: 'Q24', startTime: Date.UTC(2026, 2, 15, 2, 21) };
	const summary = (now: number) => (
		<MatchSummary competitionPhase="qualification" currentActivity={currentActivity} nextMatch={nextMatch} now={now} />
	);
	const view = await render(summary(SCENARIO_NOW));
	await waitForAssets();

	const expectPillsFilled = () => {
		expectTextFits(byTestId('current-activity-status'), { minFill: 0.75 });
		expectTextFits(byTestId('our-match-start-time'), { minFill: 0.75 });
	};

	expectPillsFilled();
	await view.rerender(summary(SCENARIO_NOW + 1_000));
	await nextFrame();
	expectPillsFilled();
	await page.viewport(1000, 884);
	await nextFrame();
	expectPillsFilled();
});

test('match countdown stays large in qualification and elimination summaries', async () => {
	const ids = ['qualification-estimated-timing', 'elimination-estimated-timing', 'elimination-on-deck'] as const;
	const view = await render(<DashboardView connected dashboard={requireDashboard(ids[0])} now={SCENARIO_NOW} />);
	await waitForAssets();

	for (const id of ids) {
		await view.rerender(<DashboardView connected dashboard={requireDashboard(id)} now={SCENARIO_NOW} />);
		await nextFrame();
		const countdown = byTestId('our-match-countdown');
		expect(countdown.parentElement!.textContent.includes('On deck')).toBe(id === 'elimination-on-deck');
		expectTextFits(countdown);
		expect(fontSize(fittedTexts(countdown)[0])).toBeGreaterThan(100);
	}
});

test('replay match labels morph from the original label and stay readable', async () => {
	const view = await render(<MatchLabel displayLabel="Q99" maxFontSize="10rem" />);
	await waitForAssets();
	await view.rerender(<MatchLabel displayLabel="Q99R" maxFontSize="10rem" />);
	await nextFrame();
	expect(fittedTexts()[0].textContent).toBe('Q99R');

	await view.rerender(
		<DashboardView connected dashboard={requireDashboard('qualification-replay')} now={SCENARIO_NOW} />,
	);
	await page.viewport(1000, 884);
	await nextFrame();
	const labels = fittedTexts().filter((text) => text.textContent === 'Q99R');
	expect(labels).toHaveLength(3);
	for (const label of labels) expect(fontSize(label)).toBeGreaterThan(24);
});

test('elimination dashboard fits an installed 13-inch iPad PWA safe area', async () => {
	await page.viewport(1366, 1024);
	const pwaSafeArea = { '--safe-area-inset-top': '32px', '--safe-area-inset-bottom': '20px' } as CSSProperties;
	await render(
		<div style={pwaSafeArea}>
			<DashboardView connected dashboard={requireDashboard('awards-break')} now={SCENARIO_NOW} />
		</div>,
	);
	await waitForAssets();

	const main = document.querySelector<HTMLElement>('main')!;
	const schedule = document.querySelector<HTMLElement>('section[aria-label="Next matches"]')!;
	const timeline = document.querySelector<HTMLElement>('[aria-label^="Awards break after"]')!;
	const lastTimelineRow = timeline.lastElementChild!;

	expect(main.querySelector('header')!.getBoundingClientRect().height).toBe(132);
	expect(main.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
	expect(schedule.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
	for (const tile of schedule.querySelectorAll('article'))
		expect(tile.scrollHeight).toBeLessThanOrEqual(tile.clientHeight);
	expect(lastTimelineRow.getBoundingClientRect().bottom).toBeLessThanOrEqual(
		timeline.parentElement!.getBoundingClientRect().bottom - 20,
	);
	expect(document.documentElement.scrollHeight).toBe(window.innerHeight);
	await expect(page.getByRole('main')).toMatchScreenshot('elimination-pwa-safe-areas');
});
