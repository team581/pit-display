import * as stylex from '@stylexjs/stylex';
import { ClientOnly } from '@tanstack/react-router';
import type { Dashboard } from '../dashboard';
import { formatMatchStart } from '../format-time';
import { AllianceBadge } from './AllianceBadge';
import { FittedText } from './FittedText';
import { MatchLabel } from './MatchLabel';
import { styles } from './MatchSchedule.stylex';
import { MatchWarning } from './MatchWarning';
import { panelStyles } from './Panel.stylex';

export function MatchSchedule({
	eventKey,
	matches,
	now,
}: {
	eventKey: Dashboard['eventKey'];
	matches: Dashboard['upcomingMatches'];
	now: number;
}) {
	return (
		<section {...stylex.props(panelStyles.schedule)} aria-labelledby="schedule-heading">
			<div {...stylex.props(panelStyles.header)}>
				<h2 {...stylex.props(panelStyles.heading)} id="schedule-heading">
					Next matches
				</h2>
			</div>
			<div {...stylex.props(panelStyles.scrollArea, styles.rows)}>
				{matches.map((match) => (
					<article {...stylex.props(styles.matchRow)} key={match.key}>
						<MatchLabel displayLabel={match.displayLabel} {...stylex.props(styles.matchNumber)} />
						<div {...stylex.props(styles.matchTime)} data-testid="schedule-match-start">
							{match.startTime === null ? (
								<FittedText align="start" className={stylex.props(styles.startTime).className}>
									{formatMatchStart(match.startTime, now)}
								</FittedText>
							) : (
								<ClientOnly
									fallback={
										<FittedText align="start" className={stylex.props(styles.startTime).className}>
											Starts —
										</FittedText>
									}
								>
									<FittedText align="start" className={stylex.props(styles.startTime).className}>
										{formatMatchStart(match.startTime, now)}
									</FittedText>
								</ClientOnly>
							)}
						</div>
						{match.warning && <MatchWarning warning={match.warning} />}
						<AllianceBadge alliance={match.alliance} eventKey={eventKey} teams={match.teams} />
					</article>
				))}
			</div>
		</section>
	);
}
