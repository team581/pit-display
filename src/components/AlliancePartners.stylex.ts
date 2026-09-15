import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	panel: {
		display: 'flex',
		minHeight: 0,
		flexDirection: 'column',
		borderTopWidth: '1px',
		borderInlineWidth: { default: 0, [portrait]: '1px' },
		borderBottomWidth: { default: 0, [portrait]: '1px' },
		borderStyle: 'solid',
		borderColor: colors.line,
		borderRadius: { default: 0, [portrait]: spacing.md },
		backgroundColor: colors.surface,
		gridColumn: '1 / -1',
	},
	body: {
		display: 'grid',
		minHeight: '10rem',
		flex: 1,
		placeItems: 'center',
		padding: spacing['2xl'],
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: colors.line,
	},
	teams: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		gap: spacing['2xl'],
		flexWrap: 'wrap',
	},
	team: {
		color: colors.gold,
		fontSize: { default: '6rem', [portrait]: '4.5rem', [narrow]: '3.5rem' },
		fontWeight: 900,
		fontVariationSettings: "'wdth' 92",
		lineHeight: 1,
		textDecoration: 'none',
	},
	waiting: {
		color: colors.muted,
		fontSize: { default: '3rem', [portrait]: '2.25rem', [narrow]: '1.75rem' },
		textAlign: 'center',
	},
});
