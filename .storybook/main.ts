import type { StorybookConfig } from '@storybook/react-vite';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function packagePath(packageName: string): string {
	return dirname(fileURLToPath(import.meta.resolve(`${packageName}/package.json`)));
}

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.tsx'],
	staticDirs: ['../public'],
	framework: {
		name: packagePath('@storybook/react-vite'),
		options: {
			builder: { viteConfigPath: '.storybook/vite.config.ts' },
		},
	},
	typescript: { reactDocgen: false },
};

export default config;
