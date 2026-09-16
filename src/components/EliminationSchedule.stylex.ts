import * as stylex from '@stylexjs/stylex';
import { colors, spacing } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';
const compact = '@media (max-width: 1150px)';

export const styles = stylex.create({
	rows: {
		display: 'grid',
		maxHeight: { default: 'none', [portrait]: '24rem' },
		gridTemplateColumns: { default: 'repeat(2, minmax(0, 1fr))', [narrow]: '1fr' },
	},
	singleRow: {
		gridTemplateColumns: '1fr',
	},
	matchCard: {
		display: 'flex',
		minWidth: 0,
		minHeight: { default: '15rem', [narrow]: '18rem' },
		flexDirection: 'column',
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: colors.line,
		containerType: 'inline-size',
	},
	divider: {
		borderInlineStartWidth: { default: '1px', [narrow]: 0 },
		borderInlineStartStyle: 'solid',
		borderInlineStartColor: colors.line,
	},
	cardHeader: {
		justifyContent: 'space-between',
		gap: spacing.lg,
		color: 'white',
	},
	cardBody: {
		display: 'flex',
		minHeight: 0,
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		gap: spacing.xs,
		paddingBlockStart: spacing.xs,
		paddingBlockEnd: spacing.xs,
		paddingInline: { default: spacing.xl, [compact]: spacing.lg, [narrow]: spacing.md },
	},
	cardBodyWithTimeline: {
		gap: 0,
		paddingBlockStart: spacing.md,
		paddingBlockEnd: 0,
	},
	primaryRow: {
		display: 'flex',
		width: '100%',
		minWidth: 0,
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.lg,
	},
	matchNumber: {
		fontSize: 'clamp(4.5rem, 15cqw, 6rem)',
		fontWeight: 700,
		fontVariantNumeric: 'tabular-nums',
		lineHeight: 1,
		whiteSpace: 'nowrap',
	},
	eliminated: {
		alignSelf: 'center',
		fontSize: { default: '4rem', [compact]: '3.25rem' },
		lineHeight: 1.1,
	},
	matchTime: {
		display: 'flex',
		minWidth: 0,
		flexDirection: 'column',
		alignItems: 'flex-end',
		lineHeight: 1,
	},
	startTime: {
		fontSize: 'clamp(2.5rem, 8cqw, 3.25rem)',
		fontVariantNumeric: 'tabular-nums',
		whiteSpace: 'nowrap',
	},
	relativeTime: {
		color: colors.muted,
		fontSize: { default: '1.65rem', [compact]: '1.4rem' },
		fontWeight: 700,
		fontVariantNumeric: 'tabular-nums',
		whiteSpace: 'nowrap',
	},
	allianceLabel: {
		fontSize: { default: '1.75rem', [portrait]: '1.5rem' },
		fontWeight: 700,
		letterSpacing: '0.02em',
		whiteSpace: 'nowrap',
	},
	red: { backgroundColor: colors.redAlliance },
	blue: { backgroundColor: colors.blueAlliance },
	breakTimeline: {
		display: 'flex',
		position: 'relative',
		width: '100%',
		minWidth: 0,
		flexDirection: 'column',
		gap: spacing.xs,
		paddingBlock: 0,
		paddingInlineStart: spacing['2xl'],
	},
	timelineRow: {
		display: 'grid',
		position: 'relative',
		minWidth: 0,
		gridTemplateColumns: 'minmax(0, 1fr) auto',
		alignItems: 'center',
		gap: spacing.md,
		paddingBlock: spacing.sm,
		paddingInline: spacing.sm,
	},
	timelineStart: {
		paddingBlockStart: 0,
	},
	timelineMarker: {
		position: 'absolute',
		zIndex: 1,
		insetBlockStart: '50%',
		insetInlineStart: '-1.75rem',
		width: '1rem',
		height: '1rem',
		borderWidth: '4px',
		borderStyle: 'solid',
		borderColor: colors.muted,
		borderRadius: '999px',
		backgroundColor: colors.surface,
		transform: 'translateY(-50%)',
	},
	timelineConnector: {
		position: 'absolute',
		insetBlockStart: '50%',
		insetInlineStart: 'calc(-1.25rem - 2px)',
		width: '4px',
		height: 'calc(100% + 0.25rem)',
		backgroundColor: colors.muted,
	},
	timelineLabel: {
		fontSize: { default: '2.3rem', [compact]: '2rem' },
		lineHeight: 1.1,
	},
	timelineTime: {
		fontSize: { default: '2.05rem', [compact]: '1.8rem' },
		fontVariantNumeric: 'tabular-nums',
		whiteSpace: 'nowrap',
	},
	timelineBreak: {
		borderRadius: spacing.sm,
	},
	activeBreak: {
		backgroundColor: colors.gold,
		color: colors.onAccent,
	},
	activeBreakMarker: {
		backgroundColor: colors.muted,
	},
	timelineDestination: {
		color: colors.text,
	},
	empty: {
		display: 'grid',
		height: '100%',
		gridColumn: '1 / -1',
		margin: 0,
		placeItems: 'center',
		padding: spacing['2xl'],
		color: colors.muted,
		fontSize: '1.5rem',
	},
});
