import * as stylex from '@stylexjs/stylex';
import type { Dashboard } from '../dashboard';
import { isBetweenQueueAndMatch, formatMatchTiming, timingStatusMilestones } from '../dashboard-time';
import { formatRelativeTime } from '../format-time';
import { matchStartText } from '../match-start';
import { DurationMorph } from './DurationMorph';
import { FittedText } from './FittedText';
import { MatchLabel } from './MatchLabel';
import { MatchStart } from './MatchStart';
import { styles } from './MatchSummary.stylex';
import { Tile, tileGrid } from './Tile';

type CurrentActivity = Dashboard['currentActivity'];
type NextMatch = Dashboard['nextMatch'];

function endsInText(endsAt: number, now: number): string {
	const remaining = formatRelativeTime(endsAt, now, '', 'seconds');
	return `Ends ${remaining === 'now' ? '<1s' : remaining}`;
}

function currentStatusText(currentActivity: CurrentActivity, now: number): string {
	if (currentActivity?.type === 'awards')
		return now >= currentActivity.endsAt ? 'Ends soon' : endsInText(currentActivity.endsAt, now);
	if (currentActivity?.type !== 'match') return '';
	if (currentActivity.endsAt === null) return 'In progress';
	if (currentActivity.endsAt <= now) return 'Awaiting scores';
	return endsInText(currentActivity.endsAt, now);
}

function OnFieldTile({
	competitionPhase,
	currentActivity,
	now,
}: {
	competitionPhase: Dashboard['competitionPhase'];
	currentActivity: CurrentActivity;
	now: number;
}) {
	const statusText = competitionPhase === 'allianceSelection' ? '' : currentStatusText(currentActivity, now);

	return (
		<Tile title="On field" xstyle={styles.onFieldTile}>
			<div {...stylex.props(styles.tileBody)}>
				<div {...stylex.props(styles.heroArea)}>
					{competitionPhase === 'allianceSelection' ? (
						<strong {...stylex.props(styles.message)} aria-label="Alliance selection">
							<span aria-hidden="true">Alliance</span>
							<span aria-hidden="true">selection</span>
						</strong>
					) : currentActivity?.type === 'awards' ? (
						<FittedText className={stylex.props(styles.hero).className} fitHeight>
							Awards
						</FittedText>
					) : (
						<MatchLabel
							className={stylex.props(styles.hero).className}
							fitHeight
							displayLabel={currentActivity?.displayLabel}
						/>
					)}
				</div>
				{statusText && (
					<div {...stylex.props(styles.pillSlot)}>
						<div {...stylex.props(styles.pill)} data-testid="current-activity-status">
							<FittedText className={stylex.props(styles.pillText).className} morph="duration">
								{statusText}
							</FittedText>
						</div>
					</div>
				)}
			</div>
		</Tile>
	);
}

function OurMatchTile({ nextMatch, now }: { nextMatch: NonNullable<NextMatch>; now: number }) {
	const countdown = matchStartText(nextMatch.startTime, now, 'countdown');
	const statuses = timingStatusMilestones(nextMatch.timing);
	const highlightCountdown = isBetweenQueueAndMatch(nextMatch.timing.queued.time, nextMatch.startTime, now);
	const allianceStyle = nextMatch.alliance === 'red' ? styles.redAlliancePill : styles.blueAlliancePill;

	return (
		<Tile title="Our match" xstyle={styles.ourMatchTile}>
			<div {...stylex.props(styles.ourMatchBody)}>
				<div
					{...stylex.props(
						styles.tileBody,
						styles.ourMatchPane,
						styles.leadingPane,
						styles.timingBody,
						highlightCountdown && styles.highlightedTimingBody,
					)}
				>
					<div {...stylex.props(styles.matchCountdown)} data-testid="our-match-countdown">
						{nextMatch.startTime !== null && (
							<span {...stylex.props(styles.countdownLabel, highlightCountdown && styles.highlightedLabel)}>
								{countdown === 'Soon' ? 'Starts' : 'Starts in'}
							</span>
						)}
						<FittedText className={stylex.props(styles.countdownValue).className} fitHeight morph="duration">
							{countdown}
						</FittedText>
					</div>
					<div {...stylex.props(styles.timingStatuses)}>
						{statuses.map((status) => (
							<div
								{...stylex.props(styles.timingRow, highlightCountdown && styles.highlightedTimingRow)}
								key={status.label}
							>
								<span {...stylex.props(styles.timingLabel, highlightCountdown && styles.highlightedTimingLabel)}>
									{status.label}
								</span>
								<DurationMorph as="strong" {...stylex.props(styles.timingValue)}>
									{formatMatchTiming(status, now)}
								</DurationMorph>
							</div>
						))}
					</div>
				</div>
				<div
					{...stylex.props(
						styles.tileBody,
						styles.ourMatchPane,
						nextMatch.alliance === 'red' ? styles.redAlliance : styles.blueAlliance,
					)}
				>
					<div {...stylex.props(styles.heroArea)}>
						<MatchLabel
							className={stylex.props(styles.hero).className}
							fitHeight
							displayLabel={nextMatch.displayLabel}
						/>
					</div>
					<div {...stylex.props(styles.pillSlot, nextMatch.requiresBumperChange && styles.splitPillSlot)}>
						{nextMatch.requiresBumperChange && (
							<div {...stylex.props(styles.pill, styles.compactPill, allianceStyle)} data-testid="bumper-change">
								<FittedText className={stylex.props(styles.pillCompactText).className}>
									{`Swap to ${nextMatch.alliance}`}
								</FittedText>
							</div>
						)}
						<div
							{...stylex.props(styles.pill, nextMatch.requiresBumperChange && styles.compactPill, allianceStyle)}
							data-testid="our-match-start-time"
						>
							<MatchStart now={now} time={nextMatch.startTime} variant="clock">
								{(text) => (
									<FittedText
										className={
											stylex.props(nextMatch.requiresBumperChange ? styles.pillCompactText : styles.pillText).className
										}
									>
										{text}
									</FittedText>
								)}
							</MatchStart>
						</div>
					</div>
				</div>
			</div>
		</Tile>
	);
}

export function MatchSummary({
	competitionPhase,
	currentActivity,
	nextMatch,
	now,
}: {
	competitionPhase: Dashboard['competitionPhase'];
	currentActivity: CurrentActivity;
	nextMatch: NextMatch;
	now: number;
}) {
	return (
		<section {...stylex.props(tileGrid.grid, styles.grid)} aria-label="Match summary">
			<OnFieldTile competitionPhase={competitionPhase} currentActivity={currentActivity} now={now} />
			{nextMatch ? (
				<OurMatchTile nextMatch={nextMatch} now={now} />
			) : (
				<Tile title="Our match" xstyle={styles.ourMatchTile}>
					<div {...stylex.props(styles.tileBody, styles.messageBody)}>
						<strong {...stylex.props(styles.message)}>No matches scheduled</strong>
					</div>
				</Tile>
			)}
		</section>
	);
}
