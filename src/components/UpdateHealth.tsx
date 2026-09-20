import * as stylex from '@stylexjs/stylex';
import { TriangleAlert } from 'lucide-react';
import { updateHealthState } from '../update-health';
import { DurationMorph } from './DurationMorph';
import { styles } from './UpdateHealth.stylex';

export function UpdateHealth({ connected, receivedAt, now }: { connected: boolean; receivedAt?: number; now: number }) {
	const { label, hasProblem } = updateHealthState(connected, receivedAt, now);

	return (
		<div
			{...stylex.props(styles.container, hasProblem ? styles.problem : styles.healthy)}
			role={hasProblem ? 'alert' : 'status'}
		>
			{hasProblem && <TriangleAlert {...stylex.props(styles.icon)} aria-hidden="true" strokeWidth={3} />}
			<DurationMorph>{label}</DurationMorph>
		</div>
	);
}
