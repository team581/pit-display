import '@fontsource-variable/source-sans-3';
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
import { rootThemeCss } from '../theme-colors';

const themeStyle = document.createElement('style');
themeStyle.textContent = rootThemeCss;
document.head.append(themeStyle);

const preview: Preview = {
	parameters: {
		layout: 'fullscreen',
		options: { storySort: { order: ['Dashboard', 'Tiles'] } },
		viewport: {
			options: {
				ipadPro13Landscape: {
					name: 'iPad Pro 13-inch landscape',
					styles: { width: '1376px', height: '1032px' },
					type: 'tablet',
				},
			},
		},
	},
};

export default preview;
