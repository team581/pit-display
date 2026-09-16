import * as stylex from '@stylexjs/stylex';
import { TextMorph } from 'torph/react';
import type { Dashboard } from '../dashboard';
import { formatTimingMilestoneTime, timingStatusMilestones } from '../dashboard-time';
import { formatClock } from '../format-time';
import { queueProgress } from '../match-progress';
import { MatchLabel } from './MatchLabel';
import { styles } from './MatchSummary.stylex';
import { panelStyles } from './Panel.stylex';

export function MatchSummary({
	competitionPhase,
	currentMatch,
	nextMatch,
	now,
}: {
	competitionPhase: Dashboard['competitionPhase'];
	currentMatch: Dashboard['currentMatch'];
	nextMatch: Dashboard['nextMatch'];
	now: number;
}) {
	const matchStartMilestone = nextMatch?.milestones.find(({ label }) => label === 'Match start');
	const matchStartCountdown = matchStartMilestone
		? formatTimingMilestoneTime(matchStartMilestone, now, '')
		: 'Not available';
	const matchStartText = nextMatch ? `Starts ${formatClock(nextMatch.startTime)}` : '';
	const timingStatuses = nextMatch ? timingStatusMilestones(nextMatch.milestones) : [];
	const nextQueueProgress = queueProgress(currentMatch?.startedAt, nextMatch?.milestones[0]?.time, now);
	const queueWindowComplete = nextQueueProgress === 1;
	const isAllianceSelection = competitionPhase === 'allianceSelection';
	const showMatchProgress =
		currentMatch !== null &&
		nextMatch !== null &&
		currentMatch.displayLabel !== nextMatch.displayLabel &&
		!isAllianceSelection;

	return (
		<section {...stylex.props(styles.grid)} aria-label="Match summary">
			<article {...stylex.props(styles.card, styles.dividedCard)}>
				<div {...stylex.props(panelStyles.header)}>
					<h2 {...stylex.props(panelStyles.heading)}>Currently on field</h2>
				</div>
				<div {...stylex.props(styles.cardBody)}>
					<div {...stylex.props(styles.matchNumberArea)}>
						{isAllianceSelection ? (
							<strong {...stylex.props(styles.currentStage)} aria-label="Alliance selection">
								<span aria-hidden="true">Alliance</span>
								<span aria-hidden="true">selection</span>
							</strong>
						) : (
							<MatchLabel displayLabel={currentMatch?.displayLabel} {...stylex.props(styles.matchNumber)} />
						)}
					</div>
					<div {...stylex.props(styles.matchDetailSlot)}>
						{showMatchProgress && (
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
				</div>
			</article>

			{nextMatch ? (
				<>
					<article {...stylex.props(styles.card, styles.dividedCard)}>
						<div {...stylex.props(panelStyles.header)}>
							<h2 {...stylex.props(panelStyles.heading)}>Our match</h2>
						</div>
						<div {...stylex.props(styles.cardBody)}>
							<div {...stylex.props(styles.matchNumberArea)}>
								<MatchLabel displayLabel={nextMatch.displayLabel} {...stylex.props(styles.matchNumber)} />
							</div>
							<div {...stylex.props(styles.matchDetailSlot)}>
								<div {...stylex.props(styles.matchDetail, styles.matchStartTime)}>
									<TextMorph
										as="strong"
										{...stylex.props(
											styles.matchTimeValue,
											matchStartText.length > 14 && styles.matchTimeValueWithTwoDigitHour,
											matchStartText.length > 16 && styles.matchTimeValueLong,
										)}
									>
										{matchStartText}
									</TextMorph>
								</div>
							</div>
						</div>
					</article>

					<article {...stylex.props(styles.card)}>
						<div {...stylex.props(panelStyles.header)}>
							<h2 {...stylex.props(panelStyles.heading)}>Timing</h2>
						</div>
						<div {...stylex.props(styles.cardBody, styles.timingBody)}>
							<div {...stylex.props(styles.matchCountdown)}>
								<span {...stylex.props(styles.matchCountdownLabel)}>
									{matchStartCountdown === 'Soon' ? 'Starts' : 'Starts in'}
								</span>
								<TextMorph
									as="strong"
									{...stylex.props(
										styles.matchCountdownValue,
										matchStartCountdown.length > 9 && styles.matchCountdownValueLong,
										matchStartCountdown.includes('hr') && styles.matchCountdownValueWithHours,
										matchStartCountdown.includes('sec') && styles.matchCountdownValueWithSeconds,
									)}
								>
									{matchStartCountdown}
								</TextMorph>
							</div>
							<div {...stylex.props(styles.timingStatuses)}>
								{timingStatuses.map((milestone) => (
									<div {...stylex.props(styles.timingRow)} key={milestone.label}>
										<span {...stylex.props(styles.timingLabel)}>{milestone.label}</span>
										<TextMorph as="strong" {...stylex.props(styles.timingValue)}>
											{formatTimingMilestoneTime(milestone, now)}
										</TextMorph>
									</div>
								))}
							</div>
						</div>
					</article>
				</>
			) : (
				<article {...stylex.props(styles.card, styles.noNextCard)}>
					<div {...stylex.props(panelStyles.header)}>
						<h2 {...stylex.props(panelStyles.heading)}>Our match</h2>
					</div>
					<div {...stylex.props(styles.cardBody)}>
						<strong {...stylex.props(styles.noNextMessage)}>No more matches scheduled</strong>
					</div>
				</article>
			)}
		</section>
	);
}
