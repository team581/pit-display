import * as stylex from '@stylexjs/stylex';
import type { UpcomingMatch } from '../dashboard';
import { statusPill } from '../dashboard-time';
import { styles } from './StatusPill.stylex';

export function StatusPill({ match, now }: { match: UpcomingMatch; now: number }) {
	const status = statusPill(match, now);
	if (!status) return <div {...stylex.props(styles.placeholder)} aria-hidden="true" />;

	return (
		<div
			{...stylex.props(
				styles.pill,
				status.tone === 'queueing' && styles.queueing,
				status.tone === 'warning' && styles.warning,
			)}
		>
			{status.label}
		</div>
	);
}
