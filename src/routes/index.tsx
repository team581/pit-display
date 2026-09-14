import { createFileRoute } from '@tanstack/react-router';
import { DashboardRoute } from '../components/DashboardRoute';

export const Route = createFileRoute('/')({
	component: DashboardRoute,
});
