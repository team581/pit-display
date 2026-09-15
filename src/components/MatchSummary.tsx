import * as stylex from '@stylexjs/stylex';
import { TextMorph } from 'torph/react';
import type { Dashboard } from '../dashboard';
import { activeTimingMilestoneIndex, formatTimingMilestoneTime } from '../dashboard-time';
import { formatClock } from '../format-time';
import { queueProgress } from '../match-progress';
import { MatchLabel } from './MatchLabel';
import { styles } from './MatchSummary.stylex';
import { panelStyles } from './Panel.stylex';

export function MatchSummary({
	currentMatch,
	nextMatch,
	now,
}: {
	currentMatch: Dashboard['currentMatch'];
	nextMatch: Dashboard['nextMatch'];
	now: number;
}) {
	const activeTimingIndex = nextMatch ? activeTimingMilestoneIndex(nextMatch.milestones) : -1;
	const hasActiveTiming = activeTimingIndex !== -1;
	const nextQueueProgress = queueProgress(currentMatch?.startedAt, nextMatch?.milestones[0]?.time, now);
	const queueWindowComplete = nextQueueProgress === 1;

	return (
		<section {...stylex.props(styles.grid)} aria-label="Match summary">
			<article {...stylex.props(styles.card, styles.dividedCard)}>
				<div {...stylex.props(panelStyles.header)}>
					<h2 {...stylex.props(panelStyles.heading)}>On field</h2>
				</div>
				<div {...stylex.props(styles.cardBody)}>
					<div {...stylex.props(styles.matchNumberArea)}>
						<MatchLabel displayLabel={currentMatch?.displayLabel} {...stylex.props(styles.matchNumber)} />
					</div>
					{nextMatch && (
						<div
							{...stylex.props(styles.matchDetail, styles.matchProgress)}
							aria-label={`Progress until ${nextMatch.displayLabel} queues: ${Math.round(nextQueueProgress * 100)}%`}
							role="progressbar"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={Math.round(nextQueueProgress * 100)}
						>
							<div {...stylex.props(styles.matchProgressFill)} style={{ width: `${nextQueueProgress * 100}%` }} />
							{queueWindowComplete && (
								<strong {...stylex.props(styles.matchStartValue, styles.matchProgressMessage)}>Ending soon</strong>
							)}
						</div>
					)}
				</div>
			</article>

			{nextMatch ? (
				<>
					<article {...stylex.props(styles.card, styles.dividedCard)}>
						<div {...stylex.props(panelStyles.header)}>
							<h2 {...stylex.props(panelStyles.heading)}>Next match</h2>
						</div>
						<div {...stylex.props(styles.cardBody)}>
							<div {...stylex.props(styles.matchNumberArea)}>
								<MatchLabel displayLabel={nextMatch.displayLabel} {...stylex.props(styles.matchNumber)} />
							</div>
							<div {...stylex.props(styles.matchDetail, styles.matchStartTime)}>
								<TextMorph as="strong" {...stylex.props(styles.matchStartValue)}>
									Starts {formatClock(nextMatch.startTime)}
								</TextMorph>
							</div>
						</div>
					</article>

					<article {...stylex.props(styles.card)}>
						<div {...stylex.props(panelStyles.header)}>
							<h2 {...stylex.props(panelStyles.heading)}>Timing</h2>
						</div>
						<div {...stylex.props(styles.cardBody, styles.timingBody)}>
							{nextMatch.milestones.map((milestone, index) => {
								const isActive = index === activeTimingIndex;
								return (
									<div
										{...stylex.props(
											styles.timingRow,
											hasActiveTiming && styles.timingRowExpanded,
											isActive && styles.timingActive,
										)}
										key={milestone.label}
									>
										<span {...stylex.props(styles.timingLabel, isActive && styles.timingLabelActive)}>
											{milestone.label}
										</span>
										<TextMorph as="strong" {...stylex.props(styles.timingValue, isActive && styles.timingValueActive)}>
											{formatTimingMilestoneTime(milestone, now)}
										</TextMorph>
									</div>
								);
							})}
						</div>
					</article>
				</>
			) : (
				<article {...stylex.props(styles.card, styles.noNextCard)}>
					<div {...stylex.props(panelStyles.header)}>
						<h2 {...stylex.props(panelStyles.heading)}>Next match</h2>
					</div>
					<div {...stylex.props(styles.cardBody)}>
						<strong {...stylex.props(styles.noNextMessage)}>No more matches scheduled</strong>
					</div>
				</article>
			)}
		</section>
	);
}
