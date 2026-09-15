import { useLoaderData } from '@tanstack/react-router';
import { useEffect } from 'react';
import App from '../App';

export function DashboardRoute() {
	const { loadedAt } = useLoaderData({ from: '/' });

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

	return <App loadedAt={loadedAt} />;
}
