import * as stylex from '@stylexjs/stylex';

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

export const typefaces = stylex.defineVars({
	body: "'IBM Plex Sans Variable', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
	display: "'Source Sans 3 Variable', 'Source Sans Pro', ui-sans-serif, system-ui, sans-serif",
});
