import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { styles } from './UpdateHealth.stylex';

export function UpdateHealth({
	receivedAt,
	now,
	children,
}: {
	receivedAt?: number;
	now: number;
	children?: ReactNode;
}) {
	const secondsAgo = receivedAt === undefined ? null : Math.max(0, Math.floor((now - receivedAt) / 1000));
	const health = secondsAgo === null || secondsAgo >= 30 ? 'stale' : secondsAgo < 10 ? 'fresh' : 'delayed';

	return (
		<div
			{...stylex.props(
				styles.container,
				health === 'fresh' ? styles.fresh : health === 'delayed' ? styles.delayed : styles.stale,
			)}
			role="status"
		>
			<span {...stylex.props(styles.dot)} />
			<span>{secondsAgo === null ? children : `Updated ${secondsAgo}s ago`}</span>
		</div>
	);
}
