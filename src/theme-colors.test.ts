import { readFile } from 'node:fs/promises';
import { expect, test } from 'vite-plus/test';
import { themeColors } from '../theme-colors';

test('static manifest colors stay in sync with the shared theme', async () => {
	const manifest = JSON.parse(
		await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'),
	) as Record<string, unknown>;

	expect(manifest.background_color).toBe(themeColors.surfaceContainer);
	expect(manifest.theme_color).toBe(themeColors.primaryContainer);
});
