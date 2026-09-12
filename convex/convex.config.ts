import { defineApp } from 'convex/server';
import { v } from 'convex/values';

export default defineApp({
	env: {
		NEXUS_API_KEY: v.string(),
		NEXUS_WEBHOOK_TOKEN: v.string(),
	},
});
