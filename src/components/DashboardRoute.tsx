import { ClientOnly } from '@tanstack/react-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useEffect, useState } from 'react';
import App, { AppFallback } from '../App';

export function DashboardRoute() {
	return (
		<ClientOnly fallback={<AppFallback />}>
			<ClientApp />
		</ClientOnly>
	);
}

function ClientApp() {
	const [convex] = useState(() => new ConvexReactClient(import.meta.env.VITE_CONVEX_URL));

	useEffect(() => {
		if (import.meta.hot && !document.querySelector('[data-stylex-dev-runtime]')) {
			const script = document.createElement('script');
			script.type = 'module';
			script.src = '/@id/virtual:stylex:runtime';
			script.dataset.stylexDevRuntime = '';
			document.head.append(script);
		}

		if (!import.meta.hot && 'serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js');
	}, []);

	return (
		<ConvexProvider client={convex}>
			<App />
		</ConvexProvider>
	);
}
