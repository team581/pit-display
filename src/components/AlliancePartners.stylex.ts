import * as stylex from '@stylexjs/stylex';
import { colors, spacing, type, typefaces } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	tile: {
		gridColumn: '1 / -1',
	},
	body: {
		display: 'grid',
		minHeight: '10rem',
		flex: 1,
		placeItems: 'center',
		padding: spacing['2xl'],
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
		color: colors.onSurface,
		fontFamily: typefaces.display,
		fontSize: { default: '6rem', [portrait]: '4.5rem', [narrow]: '3.5rem' },
		fontWeight: 900,
		fontVariantNumeric: 'tabular-nums',
		lineHeight: 1,
		textDecoration: 'none',
	},
	waiting: {
		color: colors.onSurfaceVariant,
		fontSize: type.message,
		textAlign: 'center',
	},
});
