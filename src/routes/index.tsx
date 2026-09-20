import { createFileRoute } from '@tanstack/react-router';
import { DashboardRoute } from '../components/DashboardRoute';

export const Route = createFileRoute('/')({
	loader: () => ({ loadedAt: Date.now() }),
	component: DashboardRoute,
});
