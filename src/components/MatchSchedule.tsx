import * as stylex from '@stylexjs/stylex';
import type { Dashboard } from '../dashboard';
import { AllianceBadge } from './AllianceBadge';
import { FittedText } from './FittedText';
import { MatchLabel } from './MatchLabel';
import { MatchStart } from './MatchStart';
import { styles } from './MatchSchedule.stylex';
import { MatchWarning } from './MatchWarning';
import { Tile } from './Tile';

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
		<Tile aria-label="Next matches" as="section" xstyle={styles.tile}>
			<div {...stylex.props(styles.rows)}>
				{matches.map((match, index) => (
					<article {...stylex.props(styles.matchRow, index > 0 && styles.divider)} key={match.key}>
						<MatchLabel
							align="start"
							className={stylex.props(styles.matchLabel).className}
							displayLabel={match.displayLabel}
						/>
						<div data-testid="schedule-match-start">
							<MatchStart now={now} time={match.startTime} variant="row">
								{(text) => (
									<FittedText align="start" className={stylex.props(styles.startTime).className}>
										{text}
									</FittedText>
								)}
							</MatchStart>
						</div>
						{match.warning && <MatchWarning warning={match.warning} />}
						<AllianceBadge alliance={match.alliance} eventKey={eventKey} teams={match.teams} />
					</article>
				))}
			</div>
		</Tile>
	);
}
