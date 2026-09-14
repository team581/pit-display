import * as stylex from '@stylexjs/stylex';
import type { Dashboard } from '../dashboard';
import { formatClock, formatRelativeTime } from '../format-time';
import { AllianceBadge } from './AllianceBadge';
import { styles } from './MatchSchedule.stylex';
import { MatchWarning } from './MatchWarning';
import { panelStyles } from './Panel.stylex';

export function MatchSchedule({ matches, now }: { matches: Dashboard['upcomingMatches']; now: number }) {
	return (
		<section {...stylex.props(styles.schedule)} aria-labelledby="schedule-heading">
			<div {...stylex.props(panelStyles.header)}>
				<h2 {...stylex.props(panelStyles.heading)} id="schedule-heading">
					Next matches
				</h2>
			</div>
			<div {...stylex.props(styles.rows)}>
				{matches.map((match) => (
					<article {...stylex.props(styles.matchRow)} key={match.key}>
						<strong {...stylex.props(styles.matchNumber)}>{match.displayLabel}</strong>
						<div {...stylex.props(styles.matchTime)}>
							<strong {...stylex.props(styles.startTime)}>
								Starts {formatClock(match.startTime)} ({formatRelativeTime(match.startTime, now, '')})
							</strong>
						</div>
						{match.warning && <MatchWarning warning={match.warning} />}
						<AllianceBadge alliance={match.alliance} teams={match.teams} />
					</article>
				))}
			</div>
		</section>
	);
}
