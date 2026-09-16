import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { AllianceBadge } from './AllianceBadge';
import { AlliancePartners } from './AlliancePartners';
import { EliminationSchedule } from './EliminationSchedule';
import { MatchSchedule } from './MatchSchedule';
import { MatchSummary } from './MatchSummary';
import { MatchWarning } from './MatchWarning';
import { UpdateHealth } from './UpdateHealth';
import { dashboardScenario, SCENARIO_NOW } from '../testing/dashboard-scenarios';

function TileFrame({ children, height }: { children: ReactNode; height?: string }) {
	return <div style={{ width: '100%', height, padding: '2rem', background: '#171717' }}>{children}</div>;
}

const meta = {
	title: 'Tiles',
	parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const qualification = dashboardScenario('qualification-normal').dashboard;
const elimination = dashboardScenario('elimination-paths').dashboard;
const allianceSelection = dashboardScenario('alliance-selection-assigned').dashboard;
if (!qualification || !elimination || !allianceSelection) throw new Error('Tile stories require dashboard data');

export const MatchSummaryStates: Story = {
	render: () => (
		<TileFrame>
			<MatchSummary
				competitionPhase={qualification.competitionPhase}
				currentActivity={qualification.currentActivity}
				nextMatch={qualification.nextMatch}
				now={SCENARIO_NOW}
			/>
		</TileFrame>
	),
};

export const QualificationSchedule: Story = {
	render: () => (
		<TileFrame height="34rem">
			<MatchSchedule eventKey={qualification.eventKey} matches={qualification.upcomingMatches} now={SCENARIO_NOW} />
		</TileFrame>
	),
};

export const EliminationPaths: Story = {
	render: () => (
		<TileFrame height="34rem">
			<EliminationSchedule
				matches={elimination.upcomingMatches}
				now={SCENARIO_NOW}
				paths={elimination.eliminationPaths}
			/>
		</TileFrame>
	),
};

export const AlliancePartnersStates: Story = {
	render: () => (
		<TileFrame>
			<div style={{ display: 'grid', gap: '2rem' }}>
				<AlliancePartners eventKey={allianceSelection.eventKey} teams={[]} />
				<AlliancePartners eventKey={allianceSelection.eventKey} teams={allianceSelection.alliancePartners} />
			</div>
		</TileFrame>
	),
};

export const AllianceBadges: Story = {
	render: () => (
		<TileFrame>
			<div style={{ display: 'flex', gap: '2rem' }}>
				<AllianceBadge alliance="red" eventKey="2026test" teams={[581, 254, 1678]} />
				<AllianceBadge alliance="blue" eventKey="2026test" teams={[604, 581, 9408, 973]} />
			</div>
		</TileFrame>
	),
};

export const Warnings: Story = {
	render: () => (
		<TileFrame>
			<div style={{ display: 'flex', gap: '2rem' }}>
				<MatchWarning warning="Back to back" />
				<MatchWarning warning="2nd match after lunch" />
			</div>
		</TileFrame>
	),
};

export const UpdateHealthStates: Story = {
	render: () => (
		<TileFrame>
			<div style={{ display: 'grid', justifyContent: 'start', gap: '1rem' }}>
				<UpdateHealth connected receivedAt={SCENARIO_NOW - 30_000} now={SCENARIO_NOW} />
				<UpdateHealth connected receivedAt={SCENARIO_NOW - 7 * 60_000} now={SCENARIO_NOW} />
				<UpdateHealth connected={false} receivedAt={SCENARIO_NOW - 7 * 60_000} now={SCENARIO_NOW} />
				<UpdateHealth connected={false} now={SCENARIO_NOW} />
			</div>
		</TileFrame>
	),
};
