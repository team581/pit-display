import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';
const compact = '@media (max-width: 1150px)';

export const styles = stylex.create({
	schedule: {
		display: 'flex',
		minHeight: 0,
		flexDirection: 'column',
		overflow: 'hidden',
		borderTopWidth: '1px',
		borderInlineWidth: { default: 0, [portrait]: '1px' },
		borderBottomWidth: { default: 0, [portrait]: '1px' },
		borderStyle: 'solid',
		borderColor: colors.line,
		borderRadius: { default: 0, [portrait]: spacing.md },
		backgroundColor: colors.surface,
		gridColumn: '1 / -1',
	},
	header: {
		display: 'flex',
		height: '4rem',
		alignItems: 'center',
		paddingInline: spacing.xl,
		backgroundColor: colors.surfaceRaised,
	},
	heading: {
		margin: 0,
		fontSize: '1.75rem',
		fontWeight: 850,
		letterSpacing: '0.02em',
	},
	rows: {
		minHeight: 0,
		maxHeight: { default: 'none', [portrait]: '16rem' },
		flex: 1,
		overflowY: 'auto',
		overscrollBehavior: 'contain',
		scrollbarColor: `${colors.orange} ${colors.surface}`,
		scrollbarWidth: 'thin',
	},
	matchRow: {
		display: 'grid',
		minHeight: '6rem',
		gridTemplateColumns: {
			default: 'minmax(5rem, 0.55fr) minmax(18rem, 2.3fr) minmax(12rem, 1fr) minmax(20rem, 1.8fr)',
			[portrait]: '5rem minmax(9rem, 1fr) minmax(9rem, max-content) minmax(14rem, 1.4fr)',
			[narrow]: '4rem 1fr',
		},
		alignItems: 'center',
		columnGap: { default: spacing['2xl'], [portrait]: spacing.lg, [narrow]: spacing.md },
		rowGap: { default: spacing.lg, [narrow]: spacing.sm },
		paddingBlock: { default: spacing.sm, [narrow]: spacing.md },
		paddingInline: { default: spacing['2xl'], [portrait]: spacing.lg, [narrow]: spacing.md },
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: colors.line,
	},
	matchNumber: {
		fontSize: '4rem',
		fontWeight: 900,
		fontVariationSettings: "'wdth' 92",
		lineHeight: 1,
	},
	matchTime: { lineHeight: 1.12 },
	startTime: {
		fontSize: { default: '2.25rem', [compact]: '1.75rem', [portrait]: '1.5rem' },
		whiteSpace: { default: 'nowrap', [portrait]: 'normal' },
	},
});
