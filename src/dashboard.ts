import type { FunctionReturnType } from 'convex/server';
import type { api } from '../convex/_generated/api';

export type Dashboard = NonNullable<FunctionReturnType<typeof api.dashboard.get>>;
export type UpcomingMatch = Dashboard['upcomingMatches'][number];
