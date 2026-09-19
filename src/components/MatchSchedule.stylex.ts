import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';
const compact = '@media (max-width: 1150px)';

export const styles = stylex.create({
	rows: {
		maxHeight: { default: 'none', [portrait]: '16rem' },
	},
	matchRow: {
		display: 'grid',
		minHeight: { default: 'calc(22rem / 3)', [portrait]: '6rem' },
		gridTemplateColumns: {
			default: 'minmax(5rem, 0.55fr) minmax(18rem, 2.3fr) minmax(12rem, max-content) minmax(20rem, 1.8fr)',
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
		borderTopColor: colors.outlineVariant,
	},
	matchNumber: {
		fontSize: '4rem',
		fontWeight: 700,
		fontVariantNumeric: 'tabular-nums',
		lineHeight: 1,
		whiteSpace: 'nowrap',
	},
	matchTime: { lineHeight: 1.12 },
	startTime: {
		fontSize: { default: '2.25rem', [compact]: '1.75rem', [portrait]: '1.5rem' },
		fontVariantNumeric: 'tabular-nums',
		whiteSpace: { default: 'nowrap', [portrait]: 'normal' },
	},
});
