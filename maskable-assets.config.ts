import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';
import { themeColors } from './theme-colors.ts';

export default defineConfig({
	manifestIconsEntry: false,
	preset: {
		...minimal2023Preset,
		transparent: {
			...minimal2023Preset.transparent,
			favicons: undefined,
			sizes: [],
		},
		maskable: {
			...minimal2023Preset.maskable,
			padding: 0.4,
			resizeOptions: {
				background: themeColors.surfaceContainer,
			},
		},
		apple: {
			...minimal2023Preset.apple,
			sizes: [],
		},
	},
	images: ['public/team-581.svg'],
});
