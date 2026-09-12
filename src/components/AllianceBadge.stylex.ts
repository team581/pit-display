import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	container: {
		display: 'flex',
		minWidth: 0,
		minHeight: '4rem',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: colors.line,
		borderRadius: spacing.sm,
		gridColumn: {
			[narrow]: '1 / -1',
		},
	},
	red: { backgroundColor: colors.redAlliance },
	blue: { backgroundColor: colors.blueAlliance },
	teams: {
		display: 'grid',
		width: '100%',
		gridTemplateColumns: 'repeat(3, 1fr)',
		alignItems: 'center',
		gap: spacing.xs,
		paddingInline: spacing.lg,
	},
	team: {
		color: 'white',
		fontSize: '1.5rem',
		textAlign: 'center',
	},
	ourTeam: {
		textDecorationLine: 'underline',
		textDecorationColor: colors.gold,
		textDecorationThickness: '3px',
		textUnderlineOffset: spacing.sm,
	},
});
