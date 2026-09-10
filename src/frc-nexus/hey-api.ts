import { env } from '../env';
import type { CreateClientConfig } from './generated/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
	...config,
	auth: env.NEXUS_API_KEY,
});
