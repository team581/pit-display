import * as stylex from '@stylexjs/stylex';
import { colors, spacing, type } from '../theme.stylex';

const narrow = '@media (max-width: 620px)';
const compact = '@media (max-width: 1150px)';

export const styles = stylex.create({
	fullWidth: {
		gridColumn: '1 / -1',
	},
	tiles: {
		gridTemplateColumns: { default: 'repeat(2, minmax(0, 1fr))', [narrow]: '1fr' },
	},
	singleTile: {
		gridTemplateColumns: '1fr',
	},
	tile: {
		minHeight: { default: '15rem', [narrow]: '18rem' },
	},
	tileBody: {
		display: 'flex',
		minHeight: 0,
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		gap: spacing.xs,
		paddingBlockStart: spacing.sm,
		paddingBlockEnd: 'max(0.5rem, var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))',
		paddingInline: { default: spacing.xl, [compact]: spacing.lg, [narrow]: spacing.md },
	},
	tileBodyWithTimeline: {
		gap: 0,
	},
	primaryRow: {
		display: 'flex',
		width: '100%',
		minWidth: 0,
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.lg,
	},
	matchLabel: {
		fontSize: type.matchLabel,
		fontWeight: 700,
		fontVariantNumeric: 'tabular-nums',
		lineHeight: 1,
	},
	eliminated: {
		alignSelf: 'center',
		marginBlock: 'auto',
		fontSize: type.message,
		lineHeight: 1.05,
	},
	matchTime: {
		display: 'flex',
		flexShrink: 0,
		flexDirection: 'column',
		alignItems: 'flex-end',
		lineHeight: 1,
	},
	relativeStart: {
		fontSize: type.timePrimary,
		fontVariantNumeric: 'tabular-nums',
		whiteSpace: 'nowrap',
	},
	clockStart: {
		color: colors.onSurfaceVariant,
		fontSize: type.label,
		fontWeight: 700,
		fontVariantNumeric: 'tabular-nums',
		whiteSpace: 'nowrap',
	},
	breakTimeline: {
		display: 'flex',
		position: 'relative',
		width: '100%',
		minWidth: 0,
		minHeight: 0,
		flex: '1 1 auto',
		flexDirection: 'column',
		paddingInlineStart: spacing['2xl'],
	},
	timelineRow: {
		display: 'grid',
		position: 'relative',
		minWidth: 0,
		gridTemplateColumns: 'minmax(0, 1fr) auto',
		alignItems: 'center',
		// Rows grow into spare height, up to a cap, so the timeline isn't cramped on tall tiles.
		maxHeight: '4rem',
		flex: '1 1 auto',
		gap: spacing.md,
		paddingBlock: spacing.xs,
		paddingInline: spacing.sm,
		borderRadius: spacing.sm,
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
		borderColor: colors.onSurfaceVariant,
		borderRadius: '999px',
		backgroundColor: colors.surfaceContainer,
		transform: 'translateY(-50%)',
	},
	timelineConnector: {
		position: 'absolute',
		insetBlockStart: '50%',
		insetInlineStart: 'calc(-1.25rem - 2px)',
		width: '4px',
		height: '100%',
		backgroundColor: colors.onSurfaceVariant,
	},
	timelineText: {
		fontSize: type.time,
		fontVariantNumeric: 'tabular-nums',
		lineHeight: 1.1,
		whiteSpace: 'nowrap',
	},
	// Labels wrap rather than run into the time beside them.
	timelineLabel: {
		whiteSpace: 'normal',
	},
	activeBreak: {
		backgroundColor: colors.tertiary,
		color: colors.onTertiary,
	},
	activeBreakMarker: {
		backgroundColor: colors.onSurfaceVariant,
	},
	timelineDestination: {
		color: colors.onSurface,
	},
	empty: {
		display: 'grid',
		flex: 1,
		margin: 0,
		placeItems: 'center',
		padding: spacing['2xl'],
		color: colors.onSurfaceVariant,
		fontSize: type.label,
	},
});
