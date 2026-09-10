/// <reference types="node" />

import { cleanEnv, str } from 'envalid';

export const env = cleanEnv(process.env, {
	NEXUS_API_KEY: str(),
	NEXUS_WEBHOOK_TOKEN: str(),
});
