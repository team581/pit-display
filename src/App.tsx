import '@fontsource-variable/source-sans-3';
import * as stylex from '@stylexjs/stylex';
import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { api } from '../convex/_generated/api';
import { styles } from './App.stylex';
import { MatchSchedule } from './components/MatchSchedule';
import { MatchSummary } from './components/MatchSummary';
import { TeamIdentity } from './components/TeamIdentity';
import { UpdateHealth } from './components/UpdateHealth';
import { TEAM_NUMBER } from './team';

function App() {
	const [now, setNow] = useState(Date.now);
	const dashboard = useQuery(api.dashboard.get);

	useEffect(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	return (
		<main {...stylex.props(styles.dashboard)}>
			<header {...stylex.props(styles.topbar)}>
				<TeamIdentity />
				<UpdateHealth receivedAt={dashboard?.updatedAt} now={now}>
					{dashboard === undefined ? 'Connecting' : 'No event data'}
				</UpdateHealth>
			</header>

			{dashboard ? (
				<div {...stylex.props(styles.dashboardContent)}>
					<MatchSummary currentMatch={dashboard.currentMatch} nextMatch={dashboard.nextMatch} now={now} />
					<MatchSchedule matches={dashboard.upcomingMatches} now={now} />
				</div>
			) : (
				<section {...stylex.props(styles.emptyState)}>
					<h1 {...stylex.props(styles.emptyStateHeading)}>
						{dashboard === undefined ? 'Connecting to Convex' : `No current event data for Team ${TEAM_NUMBER}`}
					</h1>
					<p {...stylex.props(styles.emptyStateText)}>
						{dashboard === undefined
							? 'Waiting for the realtime subscription.'
							: 'Waiting for Team 581 data from an active Nexus event.'}
					</p>
				</section>
			)}
		</main>
	);
}

export default App;
