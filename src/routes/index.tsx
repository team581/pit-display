import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '../../convex/_generated/api';
import { DashboardRoute } from '../components/DashboardRoute';

const noop = () => {};

export const Route = createFileRoute('/')({
	loader: ({ context }) => {
		void context.queryClient.query(convexQuery(api.dashboard.get, {})).catch(noop);
		return { loadedAt: Date.now() };
	},
	component: DashboardRoute,
});
