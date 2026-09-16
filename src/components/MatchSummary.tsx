import * as stylex from '@stylexjs/stylex';
import { TextMorph } from 'torph/react';
import type { Dashboard } from '../dashboard';
import { formatTimingMilestoneTime, timingStatusMilestones } from '../dashboard-time';
import { formatClock, formatRelativeTime } from '../format-time';
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
		? matchStartMilestone.time === null
			? 'TBD'
			: formatTimingMilestoneTime(matchStartMilestone, now, '')
		: 'Not available';
	const matchStartText = nextMatch
		? nextMatch.startTime === null
			? 'Start time unavailable'
			: `Starts ${formatClock(nextMatch.startTime)}`
		: '';
	const timingStatuses = nextMatch ? timingStatusMilestones(nextMatch.milestones) : [];
	const isAllianceSelection = competitionPhase === 'allianceSelection';
	const awardsEndsAt = currentMatch?.displayLabel === 'Awards' ? currentMatch.endsAt : null;
	const isAwardsBreak = awardsEndsAt !== null;
	const awardsRemaining = awardsEndsAt === null ? '' : formatRelativeTime(awardsEndsAt, now, '', 'seconds');
	const awardsEndText =
		awardsEndsAt === null
			? ''
			: now >= awardsEndsAt
				? 'Ends soon'
				: `Ends ${awardsRemaining === 'now' ? '<1 sec' : awardsRemaining}`;
	const showMatchCountdown =
		currentMatch !== null &&
		nextMatch !== null &&
		!isAwardsBreak &&
		currentMatch.displayLabel !== nextMatch.displayLabel &&
		!isAllianceSelection;
	const queueMilestone = nextMatch?.milestones.find(({ label }) => label === 'Queued');
	const estimatedMatchEnd = queueMilestone ? formatTimingMilestoneTime(queueMilestone, now, '') : 'Not available';
	const matchEndText =
		estimatedMatchEnd === 'Not available'
			? 'End unknown'
			: estimatedMatchEnd === 'Soon' || queueMilestone?.isActual
				? 'Ends soon'
				: `Ends ${estimatedMatchEnd}`;
	const currentStatusText = isAwardsBreak ? awardsEndText : showMatchCountdown ? matchEndText : '';

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
						) : isAwardsBreak ? (
							<strong {...stylex.props(styles.currentActivity)}>Awards</strong>
						) : (
							<MatchLabel displayLabel={currentMatch?.displayLabel} {...stylex.props(styles.matchNumber)} />
						)}
					</div>
					{currentStatusText && (
						<div {...stylex.props(styles.matchDetailSlot)}>
							<div {...stylex.props(styles.matchDetail, styles.matchStartTime)}>
								<TextMorph
									as="strong"
									{...stylex.props(styles.matchTimeValue, currentStatusText.length > 16 && styles.activityEndValueLong)}
								>
									{currentStatusText}
								</TextMorph>
							</div>
						</div>
					)}
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
									{matchStartCountdown === 'Soon' || matchStartCountdown === 'TBD' ? 'Starts' : 'Starts in'}
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
