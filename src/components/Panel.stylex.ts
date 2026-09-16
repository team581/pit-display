import * as stylex from '@stylexjs/stylex';
import { colors, spacing, typefaces } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';

export const panelStyles = stylex.create({
	schedule: {
		display: 'flex',
		minHeight: 0,
		flexDirection: 'column',
		overflow: 'hidden',
		borderTopWidth: '1px',
		borderInlineWidth: { default: 0, [portrait]: '1px' },
		borderBottomWidth: { default: 0, [portrait]: '1px' },
		borderStyle: 'solid',
		borderColor: colors.line,
		borderRadius: { default: 0, [portrait]: spacing.md },
		backgroundColor: colors.surface,
		gridColumn: '1 / -1',
	},
	scrollArea: {
		minHeight: 0,
		flex: 1,
		overflowY: 'auto',
		overscrollBehavior: 'contain',
		scrollbarColor: `${colors.orange} ${colors.surface}`,
		scrollbarWidth: 'thin',
	},
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
		fontFamily: typefaces.display,
		fontSize: '2.625rem',
		fontWeight: 850,
		letterSpacing: '0.02em',
	},
});
