import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext } from '@tanstack/react-router';
import fontCss from '@fontsource-variable/source-sans-3?url';
import { RootDocument } from '../components/RootDocument';
import appCss from '../index.css?url';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
			{ name: 'description', content: "Team 581's live match and queue dashboard." },
			{ name: 'theme-color', content: '#591616' },
			{ name: 'mobile-web-app-capable', content: 'yes' },
			{ name: 'apple-mobile-web-app-capable', content: 'yes' },
			{ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
			{ name: 'apple-mobile-web-app-title', content: 'Pit Display' },
			{ title: 'Team 581 Pit Display' },
		],
		links: [
			{ rel: 'stylesheet', href: fontCss },
			{ rel: 'stylesheet', href: appCss },
			{ rel: 'manifest', href: '/manifest.webmanifest' },
			{ rel: 'icon', href: '/favicon.ico', sizes: 'any' },
			{ rel: 'icon', href: '/team-581.svg', type: 'image/svg+xml' },
			{ rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
		],
	}),
	shellComponent: RootDocument,
});
