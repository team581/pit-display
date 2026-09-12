import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { formatRelativeTime } from '../format-time';
import { styles } from './UpdateHealth.stylex';

export function UpdateHealth({
	connection,
	receivedAt,
	now,
	children,
}: {
	connection: 'connected' | 'connecting' | 'reconnecting';
	receivedAt?: number;
	now: number;
	children?: ReactNode;
}) {
	const updateAge = receivedAt === undefined ? null : formatRelativeTime(receivedAt, now, 'in ');
	const label =
		connection === 'connected' ? (
			updateAge === null ? (
				<>Live · {children}</>
			) : (
				`Live · event data updated ${updateAge}`
			)
		) : connection === 'reconnecting' ? (
			'Reconnecting'
		) : (
			children
		);

	return (
		<div
			{...stylex.props(
				styles.container,
				connection === 'connected'
					? styles.connected
					: connection === 'connecting'
						? styles.connecting
						: styles.reconnecting,
			)}
			role="status"
		>
			<span {...stylex.props(styles.dot)} />
			<span>{label}</span>
		</div>
	);
}
