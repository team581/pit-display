import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	ignore: [
		// Referenced by Storybook through its viteConfigPath string.
		'.storybook/vite.config.ts',
		// Loaded by the visual project only when the container sets VISUAL_TESTS.
		'src/testing/visual-setup.ts',
		'src/frc-nexus/generated/**',
		'maskable-assets.config.ts',
		'public/sw-update.js',
	],
	ignoreDependencies: [
		// Provides the HTML reporter selected by the test:visual:ci script.
		'@vitest/ui',
	],
};

export default config;
