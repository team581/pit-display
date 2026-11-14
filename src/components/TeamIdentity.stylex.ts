import * as stylex from '@stylexjs/stylex';
import { colors, spacing, typefaces } from '../theme.stylex';

const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	container: {
		// Phones only show update health in the top bar.
		display: { default: 'flex', [narrow]: 'none' },
		alignItems: 'center',
		gap: spacing.md,
	},
	logo: {
		width: '4rem',
		height: '4rem',
		objectFit: 'contain',
	},
	teamNumber: {
		paddingBlock: spacing.xs,
		paddingInline: spacing.sm,
		color: colors.onSurface,
		fontFamily: typefaces.display,
		fontSize: '2rem',
		fontWeight: 900,
		lineHeight: 1,
	},
});
