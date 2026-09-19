import * as stylex from '@stylexjs/stylex';
import { ClientOnly } from '@tanstack/react-router';
import { TextMorph } from 'torph/react';
import type { Dashboard } from '../dashboard';
import { formatMatchTiming, timingStatusMilestones } from '../dashboard-time';
import { formatClock, formatRelativeTime } from '../format-time';
import { FittedText } from './FittedText';
import { MatchLabel } from './MatchLabel';
import { styles } from './MatchSummary.stylex';
import { panelStyles } from './Panel.stylex';

type CurrentActivity = Dashboard['currentActivity'];
type NextMatch = Dashboard['nextMatch'];

function awardsEndText(endsAt: number, now: number): string {
	if (now >= endsAt) return 'Ends soon';
	const remaining = formatRelativeTime(endsAt, now, '', 'seconds');
	return `Ends ${remaining === 'now' ? '<1s' : remaining}`;
}

function matchEndText(endsAt: number | null, now: number): string {
	if (endsAt === null) return 'End unknown';
	if (endsAt <= now) return 'Ends soon';
	return `Ends ${formatRelativeTime(endsAt, now, '')}`;
}

function currentActivityState(
	competitionPhase: Dashboard['competitionPhase'],
	currentActivity: CurrentActivity,
	now: number,
) {
	if (competitionPhase === 'allianceSelection') {
		return { kind: 'allianceSelection' as const, displayLabel: undefined, statusText: '' };
	}
	if (currentActivity?.type === 'awards') {
		return {
			kind: 'awards' as const,
			displayLabel: undefined,
			statusText: awardsEndText(currentActivity.endsAt, now),
		};
	}

	const displayLabel = currentActivity?.displayLabel;
	return {
		kind: 'match' as const,
		displayLabel,
		statusText: currentActivity?.type === 'match' ? matchEndText(currentActivity.endsAt, now) : '',
	};
}

function CurrentActivityCard({
	competitionPhase,
	currentActivity,
	now,
}: {
	competitionPhase: Dashboard['competitionPhase'];
	currentActivity: CurrentActivity;
	now: number;
}) {
	const state = currentActivityState(competitionPhase, currentActivity, now);
	return (
		<article {...stylex.props(styles.card, styles.dividedCard)}>
			<div {...stylex.props(panelStyles.header)}>
				<h2 {...stylex.props(panelStyles.heading, styles.currentHeading)}>Currently on field</h2>
			</div>
			<div {...stylex.props(styles.cardBody)}>
				<div {...stylex.props(styles.matchNumberArea)}>
					{state.kind === 'allianceSelection' ? (
						<strong {...stylex.props(styles.currentStage)} aria-label="Alliance selection">
							<span aria-hidden="true">Alliance</span>
							<span aria-hidden="true">selection</span>
						</strong>
					) : state.kind === 'awards' ? (
						<strong {...stylex.props(styles.currentActivity)}>Awards</strong>
					) : (
						<MatchLabel
							displayLabel={state.displayLabel}
							{...stylex.props(styles.matchNumber, styles.currentMatchNumber)}
						/>
					)}
				</div>
				{state.statusText && (
					<div {...stylex.props(styles.matchDetailSlot)}>
						<div {...stylex.props(styles.matchDetail, styles.matchStartTime)} data-testid="current-activity-status">
							<FittedText className={stylex.props(styles.matchTimeValue).className} maxFontSize="4.1875rem">
								{state.statusText}
							</FittedText>
						</div>
					</div>
				)}
			</div>
		</article>
	);
}

function OurMatchCard({
	countdownMaxFontSize,
	nextMatch,
	now,
}: {
	countdownMaxFontSize: string;
	nextMatch: NonNullable<NextMatch>;
	now: number;
}) {
	const startText =
		nextMatch.startTime === null ? 'Start time unavailable' : `Starts ${formatClock(nextMatch.startTime)}`;
	const countdown =
		nextMatch.startTime === null ? 'TBD' : formatMatchTiming({ time: nextMatch.startTime, isActual: false }, now, '');
	const statuses = timingStatusMilestones(nextMatch.timing);
	const startTimeMaxFontSize = nextMatch.requiresBumperChange ? '2.5rem' : '5rem';

	return (
		<article {...stylex.props(styles.card, styles.ourMatchCard)}>
			<div {...stylex.props(panelStyles.header)}>
				<h2 {...stylex.props(panelStyles.heading)}>Our match</h2>
			</div>
			<div {...stylex.props(styles.ourMatchBody)}>
				<div {...stylex.props(styles.cardBody, styles.ourMatchPane, styles.leadingPane, styles.timingBody)}>
					<div {...stylex.props(styles.matchCountdown)} data-testid="our-match-countdown">
						<span {...stylex.props(styles.matchCountdownLabel)}>
							{countdown === 'Soon' || countdown === 'TBD' ? 'Starts' : 'Starts in'}
						</span>
						<FittedText
							className={stylex.props(styles.matchCountdownValue).className}
							maxFontSize={countdownMaxFontSize}
						>
							{countdown}
						</FittedText>
					</div>
					<div {...stylex.props(styles.timingStatuses)}>
						{statuses.map((status) => (
							<div {...stylex.props(styles.timingRow)} key={status.label}>
								<span {...stylex.props(styles.timingLabel)}>{status.label}</span>
								<TextMorph as="strong" {...stylex.props(styles.timingValue)}>
									{formatMatchTiming(status, now)}
								</TextMorph>
							</div>
						))}
					</div>
				</div>
				<div
					{...stylex.props(
						styles.cardBody,
						styles.ourMatchPane,
						nextMatch.alliance === 'red' ? styles.redAlliance : styles.blueAlliance,
					)}
				>
					<div {...stylex.props(styles.matchNumberArea)}>
						<MatchLabel
							displayLabel={nextMatch.displayLabel}
							{...stylex.props(styles.matchNumber, styles.nextMatchNumber)}
						/>
					</div>
					<div {...stylex.props(styles.matchDetailSlot, nextMatch.requiresBumperChange && styles.splitMatchDetailSlot)}>
						{nextMatch.requiresBumperChange && (
							<div
								{...stylex.props(
									styles.matchDetail,
									styles.matchStartTime,
									styles.compactMatchDetail,
									nextMatch.alliance === 'red' ? styles.redAllianceStartTime : styles.blueAllianceStartTime,
								)}
								data-testid="bumper-change"
							>
								<FittedText className={stylex.props(styles.matchTimeValue).className} maxFontSize="2.25rem">
									{`Swap to ${nextMatch.alliance}`}
								</FittedText>
							</div>
						)}
						<div
							{...stylex.props(
								styles.matchDetail,
								styles.matchStartTime,
								nextMatch.requiresBumperChange && styles.compactMatchDetail,
								nextMatch.alliance === 'red' ? styles.redAllianceStartTime : styles.blueAllianceStartTime,
							)}
							data-testid="our-match-start-time"
						>
							{nextMatch.startTime === null ? (
								<FittedText
									className={stylex.props(styles.matchTimeValue).className}
									maxFontSize={startTimeMaxFontSize}
								>
									{startText}
								</FittedText>
							) : (
								<ClientOnly
									fallback={
										<FittedText
											className={stylex.props(styles.matchTimeValue).className}
											maxFontSize={startTimeMaxFontSize}
										>
											Starts —
										</FittedText>
									}
								>
									<FittedText
										className={stylex.props(styles.matchTimeValue).className}
										maxFontSize={startTimeMaxFontSize}
									>
										{startText}
									</FittedText>
								</ClientOnly>
							)}
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}

function NoNextMatchCard() {
	return (
		<article {...stylex.props(styles.card, styles.noNextCard)}>
			<div {...stylex.props(panelStyles.header)}>
				<h2 {...stylex.props(panelStyles.heading)}>Our match</h2>
			</div>
			<div {...stylex.props(styles.cardBody)}>
				<strong {...stylex.props(styles.noNextMessage)}>No matches scheduled</strong>
			</div>
		</article>
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
		<section {...stylex.props(styles.grid)} aria-label="Match summary">
			<CurrentActivityCard competitionPhase={competitionPhase} currentActivity={currentActivity} now={now} />
			{nextMatch ? (
				<OurMatchCard
					countdownMaxFontSize={competitionPhase === 'qualification' ? '12.5rem' : '10rem'}
					nextMatch={nextMatch}
					now={now}
				/>
			) : (
				<NoNextMatchCard />
			)}
		</section>
	);
}
