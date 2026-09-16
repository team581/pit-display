import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	container: {
		display: 'flex',
		minWidth: {
			default: '11rem',
			[narrow]: 0,
		},
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		paddingBlock: spacing.sm,
		paddingInline: {
			default: spacing.lg,
			[narrow]: spacing.md,
		},
		borderRadius: spacing.sm,
		fontSize: '1rem',
		fontWeight: 700,
		fontVariantNumeric: 'tabular-nums',
	},
	healthy: {
		color: colors.muted,
	},
	problem: {
		backgroundColor: 'white',
		color: 'black',
		fontWeight: 700,
	},
	icon: {
		width: '1.5rem',
		height: '1.5rem',
		flex: '0 0 auto',
	},
});
