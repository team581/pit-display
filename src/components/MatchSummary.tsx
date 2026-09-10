import * as stylex from '@stylexjs/stylex';
import type { Dashboard } from '../dashboard';
import { milestoneState } from '../dashboard-time';
import { formatClock, formatRelativeTime } from '../format-time';
import { styles } from './MatchSummary.stylex';

export function MatchSummary({
	currentMatch,
	nextMatch,
	now,
}: {
	currentMatch: Dashboard['currentMatch'];
	nextMatch: Dashboard['nextMatch'];
	now: number;
}) {
	return (
		<section {...stylex.props(styles.grid)} aria-label="Match summary">
			<article {...stylex.props(styles.card, styles.currentCard)}>
				<div {...stylex.props(styles.cardHeader, styles.currentHeader)}>
					<h2 {...stylex.props(styles.heading)}>On field</h2>
				</div>
				<div {...stylex.props(styles.cardBody)}>
					<strong {...stylex.props(styles.matchNumber)}>{currentMatch.displayLabel}</strong>
					<div {...stylex.props(styles.matchDetail, styles.fieldState)}>{currentMatch.state}</div>
				</div>
			</article>

			<article {...stylex.props(styles.card, styles.nextCard)}>
				<div {...stylex.props(styles.cardHeader, styles.nextHeader)}>
					<h2 {...stylex.props(styles.heading)}>Next match</h2>
				</div>
				<div {...stylex.props(styles.cardBody)}>
					<strong {...stylex.props(styles.matchNumber)}>{nextMatch.displayLabel}</strong>
					<div {...stylex.props(styles.matchDetail, styles.matchStartTime)}>
						<span {...stylex.props(styles.matchStartLabel)}>Scheduled</span>
						<strong {...stylex.props(styles.matchStartValue)}>{formatClock(nextMatch.scheduledTime)}</strong>
					</div>
				</div>
			</article>

			<article {...stylex.props(styles.card, styles.timingCard)}>
				<div {...stylex.props(styles.cardHeader, styles.timingHeader)}>
					<h2 {...stylex.props(styles.heading)}>Next match timing</h2>
				</div>
				<div {...stylex.props(styles.cardBody, styles.timingBody)}>
					{nextMatch.milestones.map((milestone) => {
						const state = milestoneState(milestone, now);
						return (
							<div
								{...stylex.props(
									styles.timingRow,
									state === 'past' && styles.timingPast,
									state === 'soon' && styles.timingSoon,
								)}
								key={milestone.label}
							>
								<span {...stylex.props(styles.timingLabel, state === 'soon' && styles.timingLabelSoon)}>
									{milestone.label}
								</span>
								<strong {...stylex.props(styles.timingValue)}>{formatRelativeTime(milestone.time, now, 'in ')}</strong>
							</div>
						);
					})}
				</div>
			</article>
		</section>
	);
}
