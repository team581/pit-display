import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

export const panelStyles = stylex.create({
	header: {
		display: 'flex',
		height: '4rem',
		flex: '0 0 auto',
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
});
