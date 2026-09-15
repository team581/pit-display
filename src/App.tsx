import * as stylex from '@stylexjs/stylex';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ClientOnly } from '@tanstack/react-router';
import { useConvexConnectionState } from 'convex/react';
import { useEffect, useState } from 'react';
import { api } from '../convex/_generated/api';
import { styles } from './App.stylex';
import { MatchSchedule } from './components/MatchSchedule';
import { MatchSummary } from './components/MatchSummary';
import { TeamIdentity } from './components/TeamIdentity';
import { UpdateHealth } from './components/UpdateHealth';
import type { Dashboard as DashboardData } from './dashboard';
import { TEAM_NUMBER } from './team';

function App({ loadedAt }: { loadedAt: number }) {
	const [now, setNow] = useState(loadedAt);
	const { data: dashboard } = useSuspenseQuery(convexQuery(api.dashboard.get, {}));

	useEffect(() => {
		const updateNow = () => setNow(Date.now());
		const timeout = window.setTimeout(updateNow);
		const interval = window.setInterval(updateNow, 1000);
		return () => {
			window.clearTimeout(timeout);
			window.clearInterval(interval);
		};
	}, []);

	return <Dashboard dashboard={dashboard} now={now} />;
}

function Dashboard({ dashboard, now }: { dashboard: DashboardData | null | undefined; now: number }) {
	return (
		<main {...stylex.props(styles.dashboard)}>
			<header {...stylex.props(styles.topbar)}>
				<TeamIdentity />
				<ClientOnly fallback={<UpdateHealth connected={false} receivedAt={dashboard?.updatedAt} now={now} />}>
					<LiveUpdateHealth receivedAt={dashboard?.updatedAt} now={now} />
				</ClientOnly>
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

function LiveUpdateHealth({ receivedAt, now }: { receivedAt?: number; now: number }) {
	const { isWebSocketConnected } = useConvexConnectionState();
	return <UpdateHealth connected={isWebSocketConnected} receivedAt={receivedAt} now={now} />;
}

export default App;
