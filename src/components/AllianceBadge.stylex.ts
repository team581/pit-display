import * as stylex from '@stylexjs/stylex';
import { colors } from '../theme.stylex';

const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	container: {
		display: 'flex',
		minWidth: 0,
		minHeight: 'clamp(58px, 6.8vh, 70px)',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: colors.line,
		borderRadius: '10px',
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
		gap: '4px',
		paddingInline: 'clamp(10px, 1.4vw, 22px)',
	},
	team: {
		color: 'white',
		fontSize: 'clamp(1rem, 1.9vw, 1.55rem)',
		textAlign: 'center',
	},
	ourTeam: {
		textDecorationLine: 'underline',
		textDecorationColor: colors.gold,
		textDecorationThickness: '3px',
		textUnderlineOffset: '7px',
	},
});
