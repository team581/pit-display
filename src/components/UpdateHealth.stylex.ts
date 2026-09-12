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
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: 'currentColor',
		borderRadius: spacing.sm,
		backgroundColor: '#1f1f1f',
		fontSize: '1rem',
		fontWeight: 750,
		fontVariantNumeric: 'tabular-nums',
	},
	fresh: { color: '#51cf78' },
	delayed: { color: colors.gold },
	stale: { color: '#ff6b6b' },
	dot: {
		width: spacing.md,
		height: spacing.md,
		borderRadius: '50%',
		backgroundColor: 'currentColor',
	},
});
