import * as stylex from '@stylexjs/stylex';

const portrait = '@media (max-width: 850px), (orientation: portrait)';
const narrow = '@media (max-width: 620px)';
const compact = '@media (max-width: 1150px)';
const shortLandscape = '@media (max-height: 850px) and (min-width: 851px) and (orientation: landscape)';
// Unlike stylex.create, defineVars doesn't make later media queries win when they overlap, so a var that would mix
// overlapping queries uses one of these non-overlapping ones instead.
const compactLandscape = '@media (max-width: 1150px) and (min-width: 851px) and (orientation: landscape)';
const portraitNotNarrow =
	'@media (min-width: 620.01px) and (max-width: 850px), (min-width: 620.01px) and (orientation: portrait)';

export const colors = stylex.defineVars({
	primaryContainer: 'var(--theme-primary-container)',
	error: 'var(--theme-error)',
	onError: 'var(--theme-on-error)',
	tertiary: 'var(--theme-tertiary)',
	onTertiary: 'var(--theme-on-tertiary)',
	queueAlert: 'var(--theme-queue-alert)',
	onQueueAlert: 'var(--theme-on-queue-alert)',
	queueAlertContainer: 'var(--theme-queue-alert-container)',
	onQueueAlertContainer: 'var(--theme-on-queue-alert-container)',
	background: 'var(--theme-background)',
	onBackground: 'var(--theme-on-background)',
	onSurface: 'var(--theme-on-surface)',
	onSurfaceVariant: 'var(--theme-on-surface-variant)',
	outlineVariant: 'var(--theme-outline-variant)',
	inverseSurface: 'var(--theme-inverse-surface)',
	inverseOnSurface: 'var(--theme-inverse-on-surface)',
	surfaceContainer: 'var(--theme-surface-container)',
	surfaceContainerHigh: 'var(--theme-surface-container-high)',
	redAlliance: 'var(--theme-red-alliance)',
	onRedAlliance: 'var(--theme-on-red-alliance)',
	redAllianceContainer: 'var(--theme-red-alliance-container)',
	onRedAllianceContainer: 'var(--theme-on-red-alliance-container)',
	blueAlliance: 'var(--theme-blue-alliance)',
	onBlueAlliance: 'var(--theme-on-blue-alliance)',
	blueAllianceContainer: 'var(--theme-blue-alliance-container)',
	onBlueAllianceContainer: 'var(--theme-on-blue-alliance-container)',
});

export const spacing = stylex.defineVars({
	xs: '0.25rem',
	sm: '0.5rem',
	md: '0.75rem',
	lg: '1rem',
	xl: '1.5rem',
	'2xl': '2rem',
});

/**
 * Font sizes by role. Text that plays the same role on different tiles uses the same role.
 * Fitted roles are maximums that FittedText shrinks from.
 */
export const type = stylex.defineVars({
	tileHeading: { default: '2.625rem', [narrow]: '1.75rem' },
	/** What is on the field, and our next match, in the match summary. Fitted. */
	hero: { default: 'clamp(7rem, 10.5vw, 10rem)', [portrait]: '7rem' },
	/** Match labels in schedule rows and elimination cards. Fitted. */
	matchLabel: { default: '4.5rem', [compact]: '4rem' },
	/** The countdown to our next match. Fitted to width and height. */
	countdown: '12.5rem',
	countdownLabel: { default: '3.25rem', [shortLandscape]: '2rem', [portrait]: '2rem' },
	/** Status pills under match labels in the match summary. Fitted. */
	pill: '5rem',
	pillCompact: '2.5rem',
	/** The headline time of an elimination card. */
	timePrimary: { default: '3rem', [compact]: '2.5rem' },
	time: { default: '2.25rem', [compactLandscape]: '1.75rem', [portrait]: '1.5rem' },
	label: { default: '1.75rem', [compactLandscape]: '1.5rem', [portrait]: '1.5rem' },
	/** The On deck and Queued rows in our match, which give up height on short landscape screens. */
	statusLabel: { default: '1.75rem', [shortLandscape]: '1.25rem', [portrait]: '1.5rem' },
	statusValue: { default: '2.25rem', [shortLandscape]: '1.5rem', [portrait]: '1.75rem' },
	message: { default: '3rem', [portraitNotNarrow]: '2.25rem', [narrow]: '1.75rem' },
});

export const typefaces = stylex.defineVars({
	body: "'IBM Plex Sans Variable', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
	display: "'Source Sans 3 Variable', 'Source Sans Pro', ui-sans-serif, system-ui, sans-serif",
});
