import { generateSW } from 'workbox-build';

const { count, size, warnings } = await generateSW({
	globDirectory: 'dist/client',
	globPatterns: ['**/*.{css,html,ico,js,png,svg,webmanifest,woff2}'],
	swDest: 'dist/client/sw.js',
	cleanupOutdatedCaches: true,
	clientsClaim: true,
	navigateFallback: 'index.html',
	skipWaiting: true,
});

for (const warning of warnings) console.warn(warning);
console.log(`Generated service worker with ${count} precached files (${size} bytes).`);
