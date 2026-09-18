import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const appIconBackground = '#271d1d';

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
				background: appIconBackground,
			},
		},
		apple: {
			...minimal2023Preset.apple,
			sizes: [],
		},
	},
	images: ['public/team-581.svg'],
});
