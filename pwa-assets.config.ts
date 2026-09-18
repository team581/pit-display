import { defaultAssetName, defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';
import { themeColors } from './theme-colors.ts';

export default defineConfig({
	manifestIconsEntry: false,
	preset: {
		...minimal2023Preset,
		// The transparent renderer always uses an alpha canvas, so render regular PWA icons through the opaque path.
		assetName: (type, size) =>
			type === 'maskable' ? `pwa-${size.width}x${size.height}.png` : defaultAssetName(type, size),
		transparent: {
			...minimal2023Preset.transparent,
			sizes: [],
			padding: 0,
		},
		maskable: {
			...minimal2023Preset.maskable,
			sizes: minimal2023Preset.transparent.sizes,
			padding: 0.3,
			resizeOptions: {
				background: themeColors.surfaceContainer,
			},
		},
		apple: {
			...minimal2023Preset.apple,
			padding: 0.3,
			resizeOptions: {
				background: themeColors.surfaceContainer,
			},
		},
	},
	images: ['public/team-581.svg'],
});
