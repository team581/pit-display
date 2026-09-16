import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	warning: {
		display: 'flex',
		minHeight: '3rem',
		alignItems: 'center',
		justifyContent: 'center',
		justifySelf: 'center',
		paddingInline: spacing.lg,
		borderRadius: spacing.sm,
		backgroundColor: colors.orange,
		color: colors.onAccent,
		fontSize: '1rem',
		fontWeight: 700,
		letterSpacing: '0.03em',
		whiteSpace: 'nowrap',
		gridColumn: { default: '3', [narrow]: '1 / -1' },
	},
});
