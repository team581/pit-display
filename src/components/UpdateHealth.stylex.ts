import * as stylex from '@stylexjs/stylex';
import { colors } from '../theme.stylex';

const narrow = '@media (max-width: 620px)';

export const styles = stylex.create({
	container: {
		display: 'flex',
		minWidth: {
			default: '176px',
			[narrow]: 0,
		},
		alignItems: 'center',
		justifyContent: 'center',
		gap: '10px',
		paddingBlock: '10px',
		paddingInline: {
			default: '16px',
			[narrow]: '11px',
		},
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: 'currentColor',
		borderRadius: '10px',
		backgroundColor: '#1f1f1f',
		fontSize: 'clamp(0.85rem, 1.4vw, 1.05rem)',
		fontWeight: 750,
		fontVariantNumeric: 'tabular-nums',
	},
	fresh: { color: '#51cf78' },
	delayed: { color: colors.gold },
	stale: { color: '#ff6b6b' },
	dot: {
		width: '11px',
		height: '11px',
		borderRadius: '50%',
		backgroundColor: 'currentColor',
	},
});
