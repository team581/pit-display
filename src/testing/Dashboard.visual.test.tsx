import { beforeEach, expect, test } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import type { ReactNode } from 'react';
import { render } from 'vitest-browser-react';
import { DashboardView } from '../App';
import { AllianceBadge } from '../components/AllianceBadge';
import { AlliancePartners } from '../components/AlliancePartners';
import { EliminationSchedule } from '../components/EliminationSchedule';
import { MatchSchedule } from '../components/MatchSchedule';
import { MatchSummary } from '../components/MatchSummary';
import { MatchWarning } from '../components/MatchWarning';
import { UpdateHealth } from '../components/UpdateHealth';
import type { Dashboard } from '../dashboard';
import { dashboardScenario, dashboardScenarios, SCENARIO_NOW } from './dashboard-scenarios';

beforeEach(async () => {
	await page.viewport(1376, 1032);
	expect(window.innerWidth).toBe(1376);
	expect(window.innerHeight).toBe(1032);
});

async function waitForAssets() {
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

function requireDashboard(id: Parameters<typeof dashboardScenario>[0]): Dashboard {
	const dashboard = dashboardScenario(id).dashboard;
	if (!dashboard) throw new Error(`Scenario ${id} does not contain dashboard data`);
	return dashboard;
}

function TilePreview({ children, height }: { children: ReactNode; height?: string }) {
	return (
		<div
			data-testid="visual-target"
			style={{ width: '100%', minHeight: height, padding: '2rem', background: '#171717' }}
		>
			{children}
		</div>
	);
}

for (const scenario of dashboardScenarios) {
	test(`dashboard: ${scenario.name}`, async () => {
		await render(<DashboardView connected={scenario.connected} dashboard={scenario.dashboard} now={SCENARIO_NOW} />);
		await waitForAssets();
		expect(document.querySelector('main')?.getBoundingClientRect().width).toBe(1376);
		if (scenario.dashboard === null || scenario.dashboard === undefined) {
			expect(getComputedStyle(document.querySelector('main')!).backgroundColor).toBe('rgb(39, 29, 29)');
			await expect(page.getByRole('main')).toMatchScreenshot(scenario.id, {
				comparatorName: 'pixelmatch',
				comparatorOptions: { threshold: 0.01 },
			});
		} else {
			await expect(page.getByRole('main')).toMatchScreenshot(scenario.id);
		}
	});
}

const qualification = requireDashboard('qualification-normal');
const elimination = requireDashboard('elimination-paths');
const allianceSelection = requireDashboard('alliance-selection-assigned');

const tileCases: { name: string; render: () => ReactNode }[] = [
	{
		name: 'match-summary',
		render: () => (
			<TilePreview>
				<MatchSummary
					competitionPhase={qualification.competitionPhase}
					currentActivity={qualification.currentActivity}
					nextMatch={qualification.nextMatch}
					now={SCENARIO_NOW}
				/>
			</TilePreview>
		),
	},
	{
		name: 'qualification-schedule',
		render: () => (
			<TilePreview height="34rem">
				<MatchSchedule eventKey={qualification.eventKey} matches={qualification.upcomingMatches} now={SCENARIO_NOW} />
			</TilePreview>
		),
	},
	{
		name: 'elimination-paths',
		render: () => (
			<TilePreview height="34rem">
				<EliminationSchedule
					matches={elimination.upcomingMatches}
					now={SCENARIO_NOW}
					paths={elimination.eliminationPaths}
				/>
			</TilePreview>
		),
	},
	{
		name: 'alliance-partners',
		render: () => (
			<TilePreview>
				<div style={{ display: 'grid', gap: '2rem' }}>
					<AlliancePartners eventKey={allianceSelection.eventKey} teams={[]} />
					<AlliancePartners eventKey={allianceSelection.eventKey} teams={allianceSelection.alliancePartners} />
				</div>
			</TilePreview>
		),
	},
	{
		name: 'badges-warnings-and-health',
		render: () => (
			<TilePreview>
				<div style={{ display: 'grid', justifyContent: 'start', gap: '1.5rem' }}>
					<div style={{ display: 'flex', gap: '2rem' }}>
						<AllianceBadge alliance="red" eventKey="2026test" teams={[581, 254, 1678]} />
						<AllianceBadge alliance="blue" eventKey="2026test" teams={[604, 581, 9408, 973]} />
					</div>
					<div style={{ display: 'flex', gap: '2rem' }}>
						<MatchWarning warning="Back to back" />
						<MatchWarning warning="2nd match after lunch" />
					</div>
					<UpdateHealth connected receivedAt={SCENARIO_NOW - 30_000} now={SCENARIO_NOW} />
					<UpdateHealth connected receivedAt={SCENARIO_NOW - 7 * 60_000} now={SCENARIO_NOW} />
					<UpdateHealth connected={false} receivedAt={SCENARIO_NOW - 7 * 60_000} now={SCENARIO_NOW} />
					<UpdateHealth connected={false} now={SCENARIO_NOW} />
				</div>
			</TilePreview>
		),
	},
];

for (const tile of tileCases) {
	test(`tiles: ${tile.name}`, async () => {
		await render(tile.render());
		await waitForAssets();
		await expect(page.getByTestId('visual-target')).toMatchScreenshot(`tile-${tile.name}`);
	});
}

test('match summary status text fills its panels without overflowing as values and sizes change', async () => {
	const dashboard = requireDashboard('qualification-normal');
	const currentActivity = { type: 'match' as const, displayLabel: 'Q18', endsAt: SCENARIO_NOW + 2 * 60_000 };
	const nextMatch = {
		...dashboard.nextMatch!,
		displayLabel: 'Q24',
		startTime: Date.UTC(2026, 2, 15, 2, 21),
	};
	const view = await render(
		<MatchSummary
			competitionPhase="qualification"
			currentActivity={currentActivity}
			nextMatch={nextMatch}
			now={SCENARIO_NOW}
		/>,
	);
	await waitForAssets();

	function expectFillsWithoutOverflow(testId: string) {
		const container = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
		const value = container?.querySelector<HTMLElement>('strong');
		expect(container).not.toBeNull();
		expect(value).not.toBeNull();
		const containerBounds = container!.getBoundingClientRect();
		const valueBounds = value!.getBoundingClientRect();
		expect(valueBounds.left).toBeGreaterThanOrEqual(containerBounds.left);
		expect(valueBounds.right).toBeLessThanOrEqual(containerBounds.right);
		expect(valueBounds.width / containerBounds.width).toBeGreaterThan(0.75);
	}

	expectFillsWithoutOverflow('current-activity-status');
	expectFillsWithoutOverflow('our-match-start-time');

	await view.rerender(
		<MatchSummary
			competitionPhase="qualification"
			currentActivity={currentActivity}
			nextMatch={nextMatch}
			now={SCENARIO_NOW + 1_000}
		/>,
	);
	expectFillsWithoutOverflow('current-activity-status');
	expectFillsWithoutOverflow('our-match-start-time');

	await page.viewport(1000, 884);
	await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
	expectFillsWithoutOverflow('current-activity-status');
	expectFillsWithoutOverflow('our-match-start-time');
});
