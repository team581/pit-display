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
		backgroundColor: colors.surfaceRaised,
		fontSize: '1rem',
		fontWeight: 850,
		letterSpacing: '0.03em',
	},
	warning: {
		justifySelf: 'center',
		paddingInline: spacing.lg,
		backgroundColor: colors.orange,
		color: '#171717',
		whiteSpace: 'nowrap',
	},
	placeholder: { minHeight: '1px' },
});
