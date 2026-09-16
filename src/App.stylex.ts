import * as stylex from '@stylexjs/stylex';
import { colors, spacing, typefaces } from './theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	dashboard: {
		minHeight: '100svh',
		backgroundColor: colors.surface,
		color: colors.text,
		fontFamily: typefaces.body,
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
		fontFamily: typefaces.display,
		paddingBlock: spacing.sm,
		paddingInline: {
			default: spacing['2xl'],
			[narrow]: spacing.lg,
		},
		backgroundColor: colors.maroon,
		borderBottomColor: colors.line,
		borderBottomStyle: 'solid',
		borderBottomWidth: '1px',
	},
	dashboardContent: {
		display: { default: 'grid', [portrait]: 'flex' },
		height: { default: 'calc(100svh - 5rem)', [portrait]: 'auto' },
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
		gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
		flexDirection: 'column',
		gap: { default: 0, [portrait]: spacing.lg },
		padding: { default: 0, [portrait]: spacing.lg },
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
