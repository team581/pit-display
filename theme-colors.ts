/**
 * App color source of truth.
 *
 * Material roles come from the dark scheme generated from #591616 by Material
 * Theme Builder with color matching enabled.
 */
type SrgbColor = `#${string}`;

export const themeColors = {
	primaryContainer: '#591616',
	error: '#FFB4AB',
	onError: '#690005',
	tertiary: '#EABF88',
	onTertiary: '#452B01',
	// Material dark-scheme roles generated from the logo yellow, #FABC3C.
	queueAlert: '#EDC06C',
	onQueueAlert: '#412D00',
	queueAlertContainer: '#5E4200',
	onQueueAlertContainer: '#FFDEA7',
	background: '#191111',
	onBackground: '#EFDFDD',
	onSurface: '#EFDFDD',
	onSurfaceVariant: '#DAC1BF',
	outlineVariant: '#544241',
	inverseSurface: '#EFDFDD',
	inverseOnSurface: '#382E2D',
	surfaceContainer: '#261E1D',
	surfaceContainerHigh: '#312827',

	// Alliance colors communicate FRC field assignments, not Material roles.
	redAlliance: '#FFB4AB',
	onRedAlliance: '#561E1A',
	redAllianceContainer: '#73332E',
	onRedAllianceContainer: '#FFDAD6',
	blueAlliance: '#A3C9FE',
	onBlueAlliance: '#00315B',
	blueAllianceContainer: '#1E4876',
	onBlueAllianceContainer: '#D3E4FF',
} as const satisfies Record<string, SrgbColor>;

function cssVariableName(name: string) {
	return `--theme-${name.replaceAll(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`;
}

function colorDeclarations() {
	return Object.entries(themeColors)
		.map(([name, color]) => `\t${cssVariableName(name)}: ${color};`)
		.join('\n');
}

export const rootThemeCss = `
:root {
	${colorDeclarations()}
	color-scheme: dark;
	color: ${themeColors.onBackground};
	background: ${themeColors.background};
}
`;
