import '@fontsource-variable/source-sans-3';
import { useQuery } from 'convex/react';
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../convex/_generated/api';
import './App.css';
import { createDashboardData, type AllianceColor, type MatchType, type UpcomingMatch } from './dashboard-data';

function formatMatch(type: MatchType, number: number) {
	const prefixes: Record<MatchType, string> = {
		qualification: 'Q',
		elimination: 'M',
		final: 'F',
		practice: 'P',
	};
	return `${prefixes[type]}${number}`;
}

function StatusPill({ match }: { match: UpcomingMatch }) {
	const labels = {
		queueing: 'Queueing soon',
		'on-deck': 'On deck',
	};

	if (match.status !== 'upcoming') {
		return <div className={`status-pill status-pill--${match.status}`}>{labels[match.status]}</div>;
	}

	const matchesApart = match.number - match.previousMatchNumber;
	const isTightTurnaround = match.turnaroundMinutes <= 20 || matchesApart <= 4;
	if (!isTightTurnaround) {
		return <div className="status-pill-placeholder" aria-hidden="true" />;
	}

	const detail = match.turnaroundMinutes <= 20 ? `${match.turnaroundMinutes} min` : `${matchesApart} matches`;
	return <div className="status-pill status-pill--warning">Tight · {detail}</div>;
}

function AllianceBadge({
	color,
	teams,
	teamNumber,
}: {
	color: AllianceColor;
	teams: readonly number[];
	teamNumber: number;
}) {
	return (
		<div className={`alliance alliance--${color}`} aria-label={`${color} alliance: teams ${teams.join(', ')}`}>
			<div className="alliance__teams">
				{teams.map((team) => (
					<strong className={team === teamNumber ? 'is-us' : undefined} key={team}>
						{team}
					</strong>
				))}
			</div>
		</div>
	);
}

function TeamIdentity({ teamNumber, onChange }: { teamNumber: number; onChange: () => void }) {
	return (
		<div className="team-identity">
			<img className="team-logo" src="/team-581.svg" alt="Team 581 logo" />
			<button
				type="button"
				className="team-number-button"
				onClick={onChange}
				aria-label={`Change team number, currently ${teamNumber}`}
			>
				{teamNumber}
			</button>
		</div>
	);
}

function UpdateHealth({ receivedAt, now }: { receivedAt: number; now: number }) {
	const secondsAgo = Math.max(0, Math.floor((now - receivedAt) / 1000));
	const health = secondsAgo < 10 ? 'fresh' : secondsAgo < 30 ? 'delayed' : 'stale';

	return (
		<div className={`update-health update-health--${health}`} role="status">
			<span className="update-health__dot" />
			<span>Updated {secondsAgo}s ago</span>
		</div>
	);
}

function Settings({
	teamNumber,
	onSave,
	onClose,
}: {
	teamNumber: number;
	onSave: (teamNumber: number) => void;
	onClose: () => void;
}) {
	const [value, setValue] = useState(String(teamNumber));

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextTeamNumber = Number(value);
		if (Number.isInteger(nextTeamNumber) && nextTeamNumber > 0 && nextTeamNumber < 100_000) {
			onSave(nextTeamNumber);
		}
	}

	return (
		<div
			className="settings-backdrop"
			role="presentation"
			onMouseDown={(event) => event.target === event.currentTarget && onClose()}
		>
			<section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
				<h2 id="settings-title">Change team number</h2>
				<form onSubmit={submit}>
					<label htmlFor="team-number">Team number</label>
					<input
						id="team-number"
						inputMode="numeric"
						min="1"
						max="99999"
						pattern="[0-9]+"
						required
						value={value}
						onChange={(event) => setValue(event.target.value)}
						autoFocus
					/>
					<div className="settings-actions">
						<button type="button" className="button button--secondary" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="button button--primary">
							Save
						</button>
					</div>
				</form>
			</section>
		</div>
	);
}

function App() {
	const [teamNumber, setTeamNumber] = useState(() => Number(localStorage.getItem('pit-display-team')) || 581);
	const liveDashboard = useQuery(api.dashboard.get, { teamNumber });
	const [now, setNow] = useState(Date.now);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const data = liveDashboard ? createDashboardData(liveDashboard, now) : null;

	useEffect(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	function saveTeamNumber(nextTeamNumber: number) {
		setTeamNumber(nextTeamNumber);
		localStorage.setItem('pit-display-team', String(nextTeamNumber));
		setSettingsOpen(false);
	}

	return (
		<main className="dashboard">
			<header className="topbar">
				<TeamIdentity teamNumber={teamNumber} onChange={() => setSettingsOpen(true)} />
				{liveDashboard ? (
					<UpdateHealth receivedAt={liveDashboard.updatedAt} now={now} />
				) : (
					<div className="update-health update-health--stale" role="status">
						<span className="update-health__dot" />
						<span>{liveDashboard === undefined ? 'Connecting' : 'No event data'}</span>
					</div>
				)}
			</header>

			{data ? (
				<div className="dashboard__content">
					<section className="summary-grid" aria-label="Match summary">
						<article className="summary-card summary-card--current">
							<div className="summary-card__header">
								<h2>On field</h2>
							</div>
							<div className="summary-card__body">
								<strong className="match-number">
									{formatMatch(data.currentMatch.type, data.currentMatch.number)}
								</strong>
								<div className="field-state">{data.currentMatch.state}</div>
							</div>
						</article>

						<article className="summary-card summary-card--next">
							<div className="summary-card__header">
								<h2>Next match</h2>
							</div>
							<div className="summary-card__body">
								<strong className="match-number">{formatMatch(data.nextMatch.type, data.nextMatch.number)}</strong>
								<div className="match-start-time">
									<span>Scheduled</span>
									<strong>{data.nextMatch.scheduledTime}</strong>
								</div>
							</div>
						</article>

						<article className="summary-card summary-card--timing">
							<div className="summary-card__header">
								<h2>Next match timing</h2>
							</div>
							<div className="summary-card__body timing-body">
								{data.nextMatch.milestones.map((milestone) => (
									<div className={`timing-row timing-row--${milestone.state}`} key={milestone.label}>
										<span>{milestone.label}</span>
										<strong>{milestone.value}</strong>
									</div>
								))}
							</div>
						</article>
					</section>

					<section className="schedule" aria-labelledby="schedule-heading">
						<div className="schedule__header">
							<h2 id="schedule-heading">Next matches</h2>
						</div>
						<div className="schedule__rows">
							{data.upcomingMatches.map((match) => (
								<article className="match-row" key={match.number}>
									<strong className="match-row__number">{formatMatch(match.type, match.number)}</strong>
									<div className="match-row__time">
										<strong>{match.relativeTime === 'Tomorrow' ? match.relativeTime : `~${match.relativeTime}`}</strong>
										<span>{match.scheduledTime}</span>
									</div>
									<StatusPill match={match} />
									<AllianceBadge color={match.alliance} teams={match.teams} teamNumber={teamNumber} />
								</article>
							))}
						</div>
					</section>
				</div>
			) : (
				<section className="empty-state">
					<h1>
						{liveDashboard === undefined ? 'Connecting to Convex' : `No current event data for Team ${teamNumber}`}
					</h1>
					<p>
						{liveDashboard === undefined
							? 'Waiting for the realtime subscription.'
							: 'Choose a team at an active Nexus event or wait for the next webhook update.'}
					</p>
				</section>
			)}

			{settingsOpen && (
				<Settings teamNumber={teamNumber} onSave={saveTeamNumber} onClose={() => setSettingsOpen(false)} />
			)}
		</main>
	);
}

export default App;
