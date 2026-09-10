import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const appIconBackground = '#282828';

export default defineConfig({
	preset: {
		...minimal2023Preset,
		maskable: {
			...minimal2023Preset.maskable,
			padding: 0.3,
			resizeOptions: {
				background: appIconBackground,
			},
		},
		apple: {
			...minimal2023Preset.apple,
			padding: 0.15,
			resizeOptions: {
				background: appIconBackground,
			},
		},
	},
	images: ['public/team-581.svg'],
});
