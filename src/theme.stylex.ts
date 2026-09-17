import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
	maroon: '#591616',
	orange: '#e86d38',
	gold: '#fabc3c',
	onAccent: '#171717',
	surface: '#271d1d',
	surfaceRaised: '#322827',
	background: '#171717',
	line: '#534342',
	text: '#f1dedd',
	muted: '#d8c2c0',
	redAlliance: '#591616',
	blueAlliance: '#0a2b43',
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
