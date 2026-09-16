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
		borderRadius: spacing.sm,
		gridColumn: {
			default: '4',
			[narrow]: '1 / -1',
		},
	},
	red: { backgroundColor: colors.redAlliance },
	blue: { backgroundColor: colors.blueAlliance },
	teams: {
		display: 'grid',
		width: '100%',
		gridTemplateColumns: 'repeat(3, 1fr)',
		alignSelf: 'stretch',
	},
	fourTeams: { gridTemplateColumns: 'repeat(4, 1fr)' },
	team: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		paddingInline: { default: spacing.sm, [narrow]: spacing.xs },
		color: 'white',
		fontSize: { default: '2rem', [narrow]: '1.75rem' },
		fontWeight: 800,
		textAlign: 'center',
		textDecoration: 'none',
	},
	ourTeam: {
		backgroundColor: 'rgb(255 255 255 / 10%)',
	},
});
