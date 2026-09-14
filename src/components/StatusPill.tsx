import * as stylex from '@stylexjs/stylex';
import type { UpcomingMatch } from '../dashboard';
import { statusPill } from '../dashboard-time';
import { styles } from './StatusPill.stylex';

export function StatusPill({ match }: { match: UpcomingMatch }) {
	const status = statusPill(match);
	if (!status) return <div {...stylex.props(styles.placeholder)} aria-hidden="true" />;

	return <div {...stylex.props(styles.pill, status.tone === 'warning' && styles.warning)}>{status.label}</div>;
}
