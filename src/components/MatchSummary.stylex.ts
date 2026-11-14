import * as stylex from '@stylexjs/stylex';
import { colors, spacing, type } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const shortLandscape = '@media (max-height: 850px) and (min-width: 851px) and (orientation: landscape)';

export const styles = stylex.create({
	grid: {
		height: { default: '100%', [portrait]: 'auto' },
		gridTemplateColumns: { default: 'repeat(4, minmax(0, 1fr))', [portrait]: '1fr' },
		gridColumn: '1 / -1',
	},
	onFieldTile: {
		height: { default: 'auto', [portrait]: '23.5rem' },
	},
	ourMatchTile: {
		gridColumn: { default: 'span 3', [portrait]: 'auto' },
	},
	ourMatchBody: {
		display: 'grid',
		minHeight: 0,
		flex: 1,
		gridTemplateColumns: { default: '2fr 1fr', [portrait]: '1fr' },
	},
	ourMatchPane: {
		minHeight: { default: 0, [portrait]: '19.5rem' },
	},
	redAlliance: {
		backgroundColor: colors.redAllianceContainer,
		color: colors.onRedAllianceContainer,
	},
	blueAlliance: {
		backgroundColor: colors.blueAllianceContainer,
		color: colors.onBlueAllianceContainer,
	},
	leadingPane: {
		borderInlineEndWidth: { default: '1px', [portrait]: 0 },
		borderInlineEndStyle: 'solid',
		borderInlineEndColor: colors.outlineVariant,
		borderBottomWidth: { default: 0, [portrait]: '1px' },
		borderBottomStyle: 'solid',
		borderBottomColor: colors.outlineVariant,
	},
	tileBody: {
		display: 'flex',
		minHeight: 0,
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.lg,
		paddingInline: spacing.lg,
		paddingBlockEnd: spacing.lg,
	},
	messageBody: {
		minHeight: '10rem',
		paddingBlockStart: spacing.lg,
	},
	message: {
		display: 'flex',
		maxWidth: '100%',
		flexDirection: 'column',
		fontSize: type.message,
		fontWeight: 700,
		lineHeight: 1.05,
		textAlign: 'center',
	},
	heroArea: {
		display: 'flex',
		width: '100%',
		minHeight: 0,
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: spacing.lg,
	},
	hero: {
		fontSize: type.hero,
		fontWeight: 700,
		fontVariantNumeric: 'tabular-nums',
		// Leave room for descenders like Q's tail, so fitting to height keeps them inside the box.
		lineHeight: 1,
		letterSpacing: '-0.045em',
	},
	pillSlot: {
		display: 'flex',
		width: '100%',
		minHeight: { default: '8.5rem', [portrait]: '7.5rem' },
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
	},
	splitPillSlot: {
		minHeight: { default: '9.5rem', [portrait]: '7.5rem' },
	},
	pill: {
		display: 'flex',
		width: '100%',
		minHeight: { default: '8.5rem', [portrait]: '7.5rem' },
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		paddingInline: spacing.lg,
		borderRadius: spacing.sm,
		backgroundColor: colors.surfaceContainerHigh,
	},
	compactPill: {
		minHeight: { default: '4.5rem', [portrait]: '3.5rem' },
	},
	redAlliancePill: {
		backgroundColor: colors.redAlliance,
		color: colors.onRedAlliance,
	},
	blueAlliancePill: {
		backgroundColor: colors.blueAlliance,
		color: colors.onBlueAlliance,
	},
	pillText: {
		fontSize: type.pill,
		fontVariantNumeric: 'tabular-nums',
		letterSpacing: '-0.03em',
	},
	pillCompactText: {
		fontSize: type.pillCompact,
		fontVariantNumeric: 'tabular-nums',
		letterSpacing: '-0.03em',
	},
	timingBody: {
		alignItems: 'stretch',
		gap: { default: spacing.lg, [shortLandscape]: spacing.sm },
		padding: { default: spacing.lg, [shortLandscape]: spacing.sm },
	},
	highlightedTimingBody: {
		backgroundColor: colors.queueAlert,
		color: colors.onQueueAlert,
	},
	matchCountdown: {
		display: 'flex',
		minHeight: 0,
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.xs,
		textAlign: 'center',
	},
	countdownLabel: {
		color: colors.onSurfaceVariant,
		fontSize: type.countdownLabel,
		fontWeight: 700,
		letterSpacing: '0.035em',
	},
	highlightedLabel: {
		color: colors.onQueueAlert,
	},
	countdownValue: {
		fontSize: type.countdown,
		fontVariantNumeric: 'tabular-nums',
		lineHeight: 1,
		letterSpacing: '-0.03em',
	},
	timingStatuses: {
		display: 'flex',
		width: '100%',
		minHeight: { default: '9.5rem', [shortLandscape]: '6.5rem', [portrait]: '7.5rem' },
		flexDirection: 'column',
		justifyContent: 'flex-end',
		gap: { default: spacing.sm, [shortLandscape]: spacing.xs },
	},
	timingRow: {
		display: 'flex',
		minHeight: { default: '4.5rem', [shortLandscape]: '3rem', [portrait]: '3.5rem' },
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.md,
		paddingBlock: { default: spacing.sm, [shortLandscape]: spacing.xs },
		paddingInline: spacing.lg,
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: colors.outlineVariant,
		borderRadius: spacing.sm,
		backgroundColor: colors.surfaceContainerHigh,
	},
	highlightedTimingRow: {
		borderColor: colors.queueAlertContainer,
		backgroundColor: colors.queueAlertContainer,
		color: colors.onQueueAlertContainer,
	},
	timingLabel: {
		color: colors.onSurfaceVariant,
		fontSize: type.statusLabel,
		fontWeight: 700,
		letterSpacing: '0.035em',
		whiteSpace: 'nowrap',
	},
	highlightedTimingLabel: {
		color: colors.onQueueAlertContainer,
	},
	timingValue: {
		fontSize: type.statusValue,
		fontVariantNumeric: 'tabular-nums',
		whiteSpace: 'nowrap',
	},
});
