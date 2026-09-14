import * as stylex from '@stylexjs/stylex';
import { useConvexConnectionState, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { api } from '../convex/_generated/api';
import { styles } from './App.stylex';
import { MatchSchedule } from './components/MatchSchedule';
import { MatchSummary } from './components/MatchSummary';
import { TeamIdentity } from './components/TeamIdentity';
import { UpdateHealth } from './components/UpdateHealth';
import type { Dashboard as DashboardData } from './dashboard';
import { TEAM_NUMBER } from './team';

function App() {
	const [now, setNow] = useState(Date.now);
	const dashboard = useQuery(api.dashboard.get);
	const { isWebSocketConnected } = useConvexConnectionState();

	useEffect(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	return <Dashboard dashboard={dashboard} connected={isWebSocketConnected} now={now} />;
}

export function AppFallback() {
	return <Dashboard dashboard={undefined} connected={false} now={0} />;
}

function Dashboard({
	dashboard,
	connected,
	now,
}: {
	dashboard: DashboardData | null | undefined;
	connected: boolean;
	now: number;
}) {
	return (
		<main {...stylex.props(styles.dashboard)}>
			<header {...stylex.props(styles.topbar)}>
				<TeamIdentity />
				<UpdateHealth connected={connected} receivedAt={dashboard?.updatedAt} now={now} />
			</header>

			{dashboard ? (
				<div {...stylex.props(styles.dashboardContent)}>
					<MatchSummary currentMatch={dashboard.currentMatch} nextMatch={dashboard.nextMatch} now={now} />
					<MatchSchedule eventKey={dashboard.eventKey} matches={dashboard.upcomingMatches} now={now} />
				</div>
			) : (
				<section {...stylex.props(styles.emptyState)}>
					<h1 {...stylex.props(styles.emptyStateHeading)}>
						{dashboard === undefined ? 'Connecting to backend' : `No current event data for Team ${TEAM_NUMBER}`}
					</h1>
					<p {...stylex.props(styles.emptyStateText)}>
						{dashboard === undefined
							? 'Waiting for the server.'
							: 'Waiting for Team 581 data from an active Nexus event.'}
					</p>
				</section>
			)}
		</main>
	);
}

export default App;
