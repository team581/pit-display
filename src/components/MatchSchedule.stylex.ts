import * as stylex from '@stylexjs/stylex';
import { colors } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	schedule: {
		overflow: 'hidden',
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: colors.line,
		borderRadius: '12px',
		backgroundColor: colors.surface,
	},
	header: {
		display: 'flex',
		height: 'clamp(54px, 7vh, 70px)',
		alignItems: 'center',
		paddingInline: 'clamp(20px, 2.4vw, 36px)',
		backgroundColor: colors.surfaceRaised,
	},
	heading: {
		margin: 0,
		fontSize: 'clamp(1.2rem, 2.2vw, 2rem)',
		fontWeight: 850,
		letterSpacing: '0.025em',
		textTransform: 'uppercase',
	},
	rows: {
		maxHeight: 'clamp(234px, 33.9vh, 348px)',
		overflowY: 'auto',
		overscrollBehavior: 'contain',
		scrollbarColor: `${colors.orange} #252525`,
		scrollbarWidth: 'thin',
	},
	matchRow: {
		display: 'grid',
		minHeight: 'clamp(78px, 11.3vh, 116px)',
		gridTemplateColumns: {
			default: 'minmax(82px, 0.65fr) minmax(150px, 1.05fr) minmax(190px, 1.4fr) minmax(320px, 2.4fr)',
			[portrait]: '74px 1fr 1.4fr',
			[narrow]: '58px 1fr',
		},
		alignItems: 'center',
		columnGap: { default: 'clamp(12px, 2vw, 30px)', [narrow]: '14px' },
		rowGap: { default: 'clamp(12px, 2vw, 30px)', [narrow]: '8px' },
		paddingBlock: { default: '8px', [narrow]: '14px' },
		paddingInline: { default: 'clamp(20px, 3.2vw, 48px)', [narrow]: '14px' },
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: colors.line,
	},
	matchNumber: {
		fontSize: 'clamp(3rem, 5vw, 4.35rem)',
		fontWeight: 900,
		fontVariationSettings: "'wdth' 92",
		lineHeight: 1,
	},
	matchTime: { display: 'flex', flexDirection: 'column', lineHeight: 1.12 },
	relativeTime: { fontSize: 'clamp(1.05rem, 2vw, 1.65rem)' },
	scheduledTime: {
		marginTop: '5px',
		color: 'white',
		fontSize: 'clamp(1.05rem, 1.75vw, 1.4rem)',
		fontWeight: 800,
	},
});
