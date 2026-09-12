import * as stylex from '@stylexjs/stylex';
import { spacing } from '../theme.stylex';

export const styles = stylex.create({
	container: {
		display: 'flex',
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
		color: 'white',
		fontSize: '2rem',
		fontWeight: 900,
		fontVariationSettings: "'wdth' 90",
		lineHeight: 1,
	},
});
