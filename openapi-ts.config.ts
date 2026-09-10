import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	input: './schemas/frc-nexus.json',
	output: './src/frc-nexus/generated',
	plugins: [
		{
			name: '@hey-api/client-fetch',
			throwOnError: true,
			runtimeConfigPath: './src/frc-nexus/hey-api.ts',
		},
		{
			name: '@hey-api/sdk',
			operations: {
				containerName: 'FrcNexus',
				strategy: 'single',
			},
			validator: true,
			responseStyle: 'data',
		},
		'zod',
	],
});
