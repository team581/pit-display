import react from '@vitejs/plugin-react';
import { unplugin as stylex } from '@stylexjs/unplugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { cleanEnv, url } from 'envalid';
import { defineConfig, lazyPlugins, loadEnv, type TestProjectConfiguration } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
	if (command === 'build') {
		cleanEnv(loadEnv(mode, process.cwd()), { VITE_CONVEX_URL: url() });
	}
	const testProjects: TestProjectConfiguration[] = [
		{
			extends: true,
			test: {
				name: 'unit',
				environment: 'node',
				include: ['src/**/*.test.ts', 'convex/**/*.test.ts'],
			},
		},
	];

	if (process.env.VISUAL_TESTS === 'true') {
		testProjects.push({
			extends: true,
			plugins: [stylex.vite()],
			test: {
				name: 'visual',
				maxWorkers: 1,
				include: ['src/**/*.visual.test.tsx'],
				setupFiles: ['./src/testing/visual-setup.ts'],
				browser: {
					enabled: true,
					headless: true,
					ui: false,
					provider: playwright({
						contextOptions: {
							colorScheme: 'dark',
							deviceScaleFactor: 1,
							locale: 'en-US',
							reducedMotion: 'reduce',
							timezoneId: 'America/Los_Angeles',
							// Leave room for Vitest's 320px controller so the test iframe remains at 1:1 scale.
							viewport: { width: 1696, height: 1032 },
						},
					}),
					instances: [{ browser: 'webkit', viewport: { width: 1376, height: 1032 } }],
				},
			},
		});
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
		test: {
			attachmentsDir: '.vitest/attachments',
			projects: testProjects,
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
