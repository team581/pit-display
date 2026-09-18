import * as stylex from '@stylexjs/stylex';
import { colors, spacing, typefaces } from './theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';
// Measured in PWA running on 13" iPad
const statusBarClearance = '1.25rem';

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
		display: 'grid',
		height: `calc(5rem + env(safe-area-inset-top, 0px) + min(${statusBarClearance}, env(safe-area-inset-top, 0px)))`,
		alignItems: 'center',
		fontFamily: typefaces.display,
		gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
		paddingTop: `calc(0.5rem + env(safe-area-inset-top, 0px) + min(${statusBarClearance}, env(safe-area-inset-top, 0px)))`,
		paddingBottom: spacing.sm,
		paddingInline: {
			default: spacing['2xl'],
			[narrow]: spacing.lg,
		},
		backgroundColor: colors.maroon,
		borderBottomColor: colors.line,
		borderBottomStyle: 'solid',
		borderBottomWidth: '1px',
	},
	clock: {
		color: 'white',
		fontSize: {
			default: '3.5rem',
			[portrait]: '2.75rem',
			[narrow]: '2rem',
		},
		fontVariantNumeric: 'tabular-nums',
		fontWeight: 800,
		lineHeight: 1,
		whiteSpace: 'nowrap',
	},
	dashboardContent: {
		display: { default: 'grid', [portrait]: 'flex' },
		height: {
			default: `calc(100svh - 5rem - env(safe-area-inset-top, 0px) - min(${statusBarClearance}, env(safe-area-inset-top, 0px)))`,
			[portrait]: 'auto',
		},
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
		gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
		flexDirection: 'column',
		gap: { default: 0, [portrait]: spacing.lg },
		padding: { default: 0, [portrait]: spacing.lg },
	},
	emptyState: {
		display: 'grid',
		minHeight: `calc(100svh - 5rem - env(safe-area-inset-top, 0px) - min(${statusBarClearance}, env(safe-area-inset-top, 0px)))`,
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
