import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardView } from './App';
import { dashboardScenario, SCENARIO_NOW } from './testing/dashboard-scenarios';

const meta = {
	title: 'Dashboard/Complete app',
	component: DashboardView,
	parameters: { layout: 'fullscreen' },
	args: { now: SCENARIO_NOW },
} satisfies Meta<typeof DashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

function fromScenario(id: Parameters<typeof dashboardScenario>[0]): Story {
	const scenario = dashboardScenario(id);
	return {
		name: scenario.name,
		args: { connected: scenario.connected, dashboard: scenario.dashboard },
		parameters: { docs: { description: { story: scenario.description } } },
	};
}

export const Loading = fromScenario('loading');
export const NoEvent = fromScenario('no-event');
export const QualificationBeforeStart = fromScenario('qualification-before-start');
export const QualificationNormal = fromScenario('qualification-normal');
export const QualificationUrgent = fromScenario('qualification-urgent');
export const QualificationComplete = fromScenario('qualification-complete');
export const AllianceSelectionWaiting = fromScenario('alliance-selection-waiting');
export const AllianceSelectionAssigned = fromScenario('alliance-selection-assigned');
export const EliminationPending = fromScenario('elimination-pending');
export const EliminationScheduledBreak = fromScenario('elimination-scheduled-break');
export const EliminationPaths = fromScenario('elimination-paths');
export const EliminationWithEliminatedPath = fromScenario('elimination-eliminated-path');
export const AwardsBreak = fromScenario('awards-break');
