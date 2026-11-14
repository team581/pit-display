import * as stylex from '@stylexjs/stylex';
import { useId, type ReactNode } from 'react';
import { TextMorph } from 'torph/react';
import { colors, spacing, type, typefaces } from '../theme.stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';

const styles = stylex.create({
	tile: {
		display: 'flex',
		minWidth: 0,
		minHeight: 0,
		flexDirection: 'column',
		overflow: 'hidden',
		borderWidth: { default: 0, [portrait]: '1px' },
		borderStyle: 'solid',
		borderColor: colors.outlineVariant,
		borderRadius: { default: 0, [portrait]: spacing.md },
		backgroundColor: colors.surfaceContainer,
	},
	header: {
		display: 'flex',
		height: { default: '4rem', [narrow]: '3rem' },
		flex: '0 0 auto',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.lg,
		paddingInline: { default: spacing.xl, [narrow]: spacing.lg },
		backgroundColor: colors.surfaceContainerHigh,
	},
	heading: {
		margin: 0,
		fontFamily: typefaces.display,
		fontSize: type.tileHeading,
		fontWeight: 850,
		letterSpacing: '0.02em',
		whiteSpace: 'nowrap',
	},
	trailing: {
		fontSize: type.label,
		fontWeight: 700,
		letterSpacing: '0.02em',
		whiteSpace: 'nowrap',
	},
	red: {
		backgroundColor: colors.redAllianceContainer,
		color: colors.onRedAllianceContainer,
	},
	blue: {
		backgroundColor: colors.blueAllianceContainer,
		color: colors.onBlueAllianceContainer,
	},
});

/**
 * Lines between tiles come from the parent grid's gap (see `tileGrid`), never from tiles.
 */
export const tileGrid = stylex.create({
	grid: {
		display: 'grid',
		minWidth: 0,
		minHeight: 0,
		gap: { default: '1px', [portrait]: spacing.lg },
		backgroundColor: { default: colors.outlineVariant, [portrait]: 'transparent' },
	},
});

export function Tile({
	as: Element = 'article',
	'aria-label': ariaLabel,
	children,
	title,
	tone = 'neutral',
	trailing,
	xstyle,
}: {
	as?: 'article' | 'section';
	'aria-label'?: string;
	children: ReactNode;
	title?: string;
	tone?: 'blue' | 'neutral' | 'red';
	trailing?: string;
	xstyle?: stylex.StyleXStyles;
}) {
	const headingId = useId();

	return (
		<Element
			{...stylex.props(styles.tile, xstyle)}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabel === undefined && title !== undefined ? headingId : undefined}
		>
			{title !== undefined && (
				<div {...stylex.props(styles.header, tone !== 'neutral' && styles[tone])}>
					<h2 id={headingId} {...stylex.props(styles.heading)}>
						<TextMorph>{title}</TextMorph>
					</h2>
					{trailing && <strong {...stylex.props(styles.trailing)}>{trailing}</strong>}
				</div>
			)}
			{children}
		</Element>
	);
}
