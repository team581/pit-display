import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	schedule: {
		overflow: 'hidden',
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: colors.line,
		borderRadius: spacing.md,
		backgroundColor: colors.surface,
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
		textTransform: 'uppercase',
	},
	rows: {
		maxHeight: '16rem',
		overflowY: 'auto',
		overscrollBehavior: 'contain',
		scrollbarColor: `${colors.orange} #252525`,
		scrollbarWidth: 'thin',
	},
	matchRow: {
		display: 'grid',
		minHeight: '6rem',
		gridTemplateColumns: {
			default: 'minmax(5rem, 0.65fr) minmax(9rem, 1fr) minmax(12rem, 1.4fr) minmax(20rem, 2.4fr)',
			[portrait]: '5rem 1fr 1.4fr',
			[narrow]: '4rem 1fr',
		},
		alignItems: 'center',
		columnGap: { default: spacing.xl, [narrow]: spacing.md },
		rowGap: { default: spacing.lg, [narrow]: spacing.sm },
		paddingBlock: { default: spacing.sm, [narrow]: spacing.md },
		paddingInline: { default: spacing['2xl'], [narrow]: spacing.md },
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
	matchTime: { display: 'flex', flexDirection: 'column', lineHeight: 1.12 },
	relativeTime: { fontSize: '1.5rem' },
	scheduledTime: {
		marginTop: spacing.xs,
		color: 'white',
		fontSize: '1.25rem',
		fontWeight: 800,
	},
});
