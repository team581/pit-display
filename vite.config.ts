import react from '@vitejs/plugin-react';
import { unplugin as stylex } from '@stylexjs/unplugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { cleanEnv, url } from 'envalid';
import { defineConfig, lazyPlugins, loadEnv } from 'vite-plus';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
	if (command === 'build') {
		cleanEnv(loadEnv(mode, process.cwd()), { VITE_CONVEX_URL: url() });
	}

	return {
		staged: {
			'*': 'vp check --fix',
		},
		fmt: {
			ignorePatterns: ['.wrangler/**', 'convex/_generated/**', 'src/frc-nexus/generated/**', 'src/routeTree.gen.ts'],
			printWidth: 120,
			singleQuote: true,
			useTabs: true,
		},
		lint: {
			ignorePatterns: ['.wrangler/**', 'convex/_generated/**', 'src/frc-nexus/generated/**', 'src/routeTree.gen.ts'],
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
			...(process.env.VITEST
				? []
				: [
						tanstackStart({
							prerender: { enabled: true },
						}),
						stylex.vite(),
					]),
			react(),
		]),
	};
});
