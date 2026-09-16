import * as stylex from '@stylexjs/stylex';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ClientOnly } from '@tanstack/react-router';
import { useConvexConnectionState } from 'convex/react';
import { useEffect, useState } from 'react';
import { TextMorph } from 'torph/react';
import { api } from '../convex/_generated/api';
import { styles } from './App.stylex';
import { AlliancePartners } from './components/AlliancePartners';
import { EliminationSchedule } from './components/EliminationSchedule';
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

	useEffect(() => {
		let wakeLock: WakeLockSentinel | undefined;
		let disposed = false;

		const requestWakeLock = async () => {
			if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;

			try {
				const lock = await navigator.wakeLock.request('screen');
				if (disposed) {
					await lock.release();
				} else {
					wakeLock = lock;
				}
			} catch {
				// The device may deny wake locks, such as while in low-power mode.
			}
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible' && wakeLock?.released !== false) void requestWakeLock();
		};

		void requestWakeLock();
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			disposed = true;
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			void wakeLock?.release();
		};
	}, []);

	return (
		<ClientOnly fallback={<DashboardView connected={false} dashboard={dashboard} now={now} />}>
			<ConnectedDashboardView dashboard={dashboard} now={now} />
		</ClientOnly>
	);
}

export function DashboardView({
	connected,
	dashboard,
	now,
}: {
	connected: boolean;
	dashboard: DashboardData | null | undefined;
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
					<MatchSummary
						competitionPhase={dashboard.competitionPhase}
						currentMatch={dashboard.currentMatch}
						nextMatch={dashboard.nextMatch}
						now={now}
					/>
					{dashboard.competitionPhase === 'allianceSelection' ? (
						<AlliancePartners eventKey={dashboard.eventKey} teams={dashboard.alliancePartners} />
					) : dashboard.competitionPhase === 'elimination' ? (
						<EliminationSchedule matches={dashboard.upcomingMatches} now={now} paths={dashboard.eliminationPaths} />
					) : (
						<MatchSchedule eventKey={dashboard.eventKey} matches={dashboard.upcomingMatches} now={now} />
					)}
				</div>
			) : (
				<section {...stylex.props(styles.emptyState)}>
					<TextMorph as="h1" {...stylex.props(styles.emptyStateHeading)}>
						{dashboard === undefined ? 'Connecting to backend' : `No current event data for Team ${TEAM_NUMBER}`}
					</TextMorph>
					<TextMorph as="p" {...stylex.props(styles.emptyStateText)}>
						{dashboard === undefined
							? 'Waiting for the server.'
							: 'Waiting for Team 581 data from an active Nexus event.'}
					</TextMorph>
				</section>
			)}
		</main>
	);
}

function ConnectedDashboardView({ dashboard, now }: { dashboard: DashboardData | null | undefined; now: number }) {
	const { isWebSocketConnected } = useConvexConnectionState();
	return <DashboardView connected={isWebSocketConnected} dashboard={dashboard} now={now} />;
}

export default App;
