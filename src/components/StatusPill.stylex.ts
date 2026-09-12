import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';

export const styles = stylex.create({
	pill: {
		display: {
			default: 'flex',
			[portrait]: 'none',
		},
		minHeight: '3rem',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: spacing.sm,
		backgroundColor: '#4b4b4b',
		fontSize: '1rem',
		fontWeight: 850,
		letterSpacing: '0.03em',
		textTransform: 'uppercase',
	},
	queueing: {
		backgroundColor: colors.gold,
		color: '#171717',
	},
	warning: {
		backgroundColor: colors.orange,
		color: '#171717',
	},
	placeholder: { minHeight: '1px' },
});
