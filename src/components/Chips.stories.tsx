import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { themeColors } from '../../theme-colors';
import { SCENARIO_NOW } from '../testing/dashboard-scenarios';
import { AllianceBadge } from './AllianceBadge';
import { MatchWarning } from './MatchWarning';
import { UpdateHealth } from './UpdateHealth';

// Tiles are shown in the complete dashboard stories, where they get their real grid slot. Chips don't depend on their
// slot, so they're shown on their own.
function ChipFrame({ children }: { children: ReactNode }) {
	return (
		<div
			data-testid="visual-target"
			style={{
				display: 'grid',
				justifyContent: 'start',
				gap: '1.5rem',
				padding: '2rem',
				background: themeColors.background,
			}}
		>
			{children}
		</div>
	);
}

const meta = {
	title: 'Chips',
	parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllianceBadges: Story = {
	render: () => (
		<ChipFrame>
			<div style={{ display: 'flex', gap: '2rem' }}>
				<AllianceBadge alliance="red" eventKey="2026test" teams={[581, 254, 1678]} />
				<AllianceBadge alliance="blue" eventKey="2026test" teams={[604, 581, 9408, 973]} />
			</div>
		</ChipFrame>
	),
};

export const Warnings: Story = {
	render: () => (
		<ChipFrame>
			<div style={{ display: 'flex', gap: '2rem' }}>
				<MatchWarning warning="Back to back" />
				<MatchWarning warning="2nd match after lunch" />
			</div>
		</ChipFrame>
	),
};

export const UpdateHealthStates: Story = {
	render: () => (
		<ChipFrame>
			<UpdateHealth connected receivedAt={SCENARIO_NOW - 30_000} now={SCENARIO_NOW} />
			<UpdateHealth connected receivedAt={SCENARIO_NOW - 7 * 60_000} now={SCENARIO_NOW} />
			<UpdateHealth connected={false} receivedAt={SCENARIO_NOW - 7 * 60_000} now={SCENARIO_NOW} />
			<UpdateHealth connected={false} now={SCENARIO_NOW} />
		</ChipFrame>
	),
};
