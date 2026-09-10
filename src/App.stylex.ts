import * as stylex from '@stylexjs/stylex';
import { colors } from './theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	dashboard: {
		minHeight: '100svh',
		backgroundColor: colors.background,
		color: colors.text,
		overflow: {
			default: 'hidden',
			[portrait]: 'auto',
		},
	},
	topbar: {
		display: 'flex',
		height: 'clamp(70px, 9.25vh, 95px)',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingBlock: '8px',
		paddingInline: {
			default: 'clamp(22px, 3vw, 46px)',
			[narrow]: '18px',
		},
		backgroundColor: colors.charcoal,
		borderBottomColor: colors.orange,
		borderBottomStyle: 'solid',
		borderBottomWidth: '5px',
	},
	dashboardContent: {
		display: 'flex',
		flexDirection: 'column',
		gap: 'clamp(14px, 2.2vh, 24px)',
		padding: 'clamp(14px, 2.1vh, 22px)',
	},
	emptyState: {
		display: 'grid',
		minHeight: 'calc(100dvh - 6rem)',
		placeContent: 'center',
		padding: '2rem',
		textAlign: 'center',
	},
	emptyStateHeading: {
		margin: 0,
		fontSize: 'clamp(2rem, 5vw, 4rem)',
	},
	emptyStateText: {
		marginBlockStart: '0.5rem',
		marginBlockEnd: 0,
		color: colors.muted,
		fontSize: '1.25rem',
	},
});
