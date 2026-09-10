import react from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
	staged: {
		'*': 'vp check --fix',
	},
	fmt: {
		ignorePatterns: ['convex/_generated/**'],
		printWidth: 120,
		singleQuote: true,
		useTabs: true,
	},
	lint: {
		plugins: ['react', 'typescript', 'oxc'],
		rules: {
			'react/rules-of-hooks': 'error',
			'react/only-export-components': [
				'warn',
				{
					allowConstantExport: true,
				},
			],
			'vite-plus/prefer-vite-plus-imports': 'error',
		},
		options: {
			typeAware: true,
			typeCheck: true,
		},
		jsPlugins: [
			{
				name: 'vite-plus',
				specifier: 'vite-plus/oxlint-plugin',
			},
		],
	},
	plugins: lazyPlugins(() => [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['team-581.svg'],
			pwaAssets: {
				config: true,
			},
			manifest: {
				id: '/',
				name: 'Team 581 Pit Display',
				short_name: 'Pit Display',
				description: "Team 581's live match and queue dashboard.",
				start_url: '/',
				scope: '/',
				display: 'standalone',
				orientation: 'landscape',
				background_color: '#303030',
				theme_color: '#282828',
			},
		}),
	]),
});
