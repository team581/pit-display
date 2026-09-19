import { useLoaderData } from '@tanstack/react-router';
import { useEffect } from 'react';
import App from '../App';

const serviceWorkerUpdateIntervalMs = 60_000;

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

		if (import.meta.hot || !('serviceWorker' in navigator)) return;

		let disposed = false;
		let hasController = navigator.serviceWorker.controller !== null;
		let reloadTimeout: number | undefined;
		let updateInterval: number | undefined;
		let updateInProgress = false;
		let registration: ServiceWorkerRegistration | undefined;

		const checkForUpdate = async () => {
			if (!registration || updateInProgress || !navigator.onLine || document.visibilityState !== 'visible') return;

			updateInProgress = true;
			try {
				await registration.update();
			} catch {
				// The next interval or online event will retry the update check.
			} finally {
				updateInProgress = false;
			}
		};

		const handleVisibilityChange = () => void checkForUpdate();
		const handleOnline = () => void checkForUpdate();
		const handleControllerChange = () => {
			if (!hasController) {
				hasController = true;
				return;
			}
			if (reloadTimeout !== undefined) return;

			// Give the transitional service-worker activation hook a chance to navigate first.
			reloadTimeout = window.setTimeout(() => window.location.reload(), 100);
		};

		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

		void navigator.serviceWorker
			.register('/sw.js', { updateViaCache: 'none' })
			.then((nextRegistration) => {
				if (disposed) return;

				registration = nextRegistration;
				void checkForUpdate();
				updateInterval = window.setInterval(() => void checkForUpdate(), serviceWorkerUpdateIntervalMs);
				document.addEventListener('visibilitychange', handleVisibilityChange);
				window.addEventListener('online', handleOnline);
			})
			.catch(() => {
				// Registration will be retried on the next page load.
			});

		return () => {
			disposed = true;
			if (reloadTimeout !== undefined) window.clearTimeout(reloadTimeout);
			if (updateInterval !== undefined) window.clearInterval(updateInterval);
			navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('online', handleOnline);
		};
	}, []);

	return <App loadedAt={loadedAt} />;
}
