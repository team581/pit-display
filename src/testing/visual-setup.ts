import '@fontsource-variable/ibm-plex-sans';
import '@fontsource-variable/source-sans-3';
import '../index.css';
import { rootThemeCss } from '../../theme-colors';

document.documentElement.lang = 'en-US';

const style = document.createElement('style');
style.textContent = `
	${rootThemeCss}

	*, *::before, *::after {
		animation-delay: 0s !important;
		animation-duration: 0s !important;
		caret-color: transparent !important;
		transition-delay: 0s !important;
		transition-duration: 0s !important;
	}
`;
document.head.append(style);
