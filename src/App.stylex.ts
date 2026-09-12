import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from './theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	dashboard: {
		minHeight: '100svh',
		backgroundColor: colors.background,
		color: colors.text,
		overflow: {
			default: 'hidden',
			[portrait]: 'auto',
		},
	},
	topbar: {
		display: 'flex',
		height: '5rem',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingBlock: spacing.sm,
		paddingInline: {
			default: spacing['2xl'],
			[narrow]: spacing.lg,
		},
		backgroundColor: colors.charcoal,
		borderBottomColor: colors.orange,
		borderBottomStyle: 'solid',
		borderBottomWidth: '4px',
	},
	dashboardContent: {
		display: 'flex',
		flexDirection: 'column',
		gap: spacing.lg,
		padding: spacing.lg,
	},
	emptyState: {
		display: 'grid',
		minHeight: 'calc(100svh - 5rem)',
		placeContent: 'center',
		padding: spacing['2xl'],
		textAlign: 'center',
	},
	emptyStateHeading: {
		margin: 0,
		fontSize: { default: '4rem', [portrait]: '3rem', [narrow]: '2rem' },
	},
	emptyStateText: {
		marginBlockStart: spacing.sm,
		marginBlockEnd: 0,
		color: colors.muted,
		fontSize: '1.25rem',
	},
});
