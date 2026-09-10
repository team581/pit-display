import * as stylex from '@stylexjs/stylex';
import { colors } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';

export const styles = stylex.create({
	pill: {
		display: {
			default: 'flex',
			[portrait]: 'none',
		},
		minHeight: 'clamp(48px, 6.3vh, 64px)',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '10px',
		backgroundColor: '#4b4b4b',
		fontSize: 'clamp(0.78rem, 1.4vw, 1.08rem)',
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
