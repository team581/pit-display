import * as stylex from '@stylexjs/stylex';
import { TextMorph } from 'torph/react';
import type { Dashboard } from '../dashboard';
import { formatMatchTiming, timingStatusMilestones } from '../dashboard-time';
import { formatClock, formatRelativeTime } from '../format-time';
import { MatchLabel } from './MatchLabel';
import { styles } from './MatchSummary.stylex';
import { panelStyles } from './Panel.stylex';

type CurrentActivity = Dashboard['currentActivity'];
type NextMatch = Dashboard['nextMatch'];

function awardsEndText(endsAt: number, now: number): string {
	if (now >= endsAt) return 'Ends soon';
	const remaining = formatRelativeTime(endsAt, now, '', 'seconds');
	return `Ends ${remaining === 'now' ? '<1 sec' : remaining}`;
}

function matchEndText(nextMatch: NonNullable<NextMatch>, now: number): string {
	const estimatedEnd = formatMatchTiming(nextMatch.timing.queued, now, '');
	if (estimatedEnd === 'Not available') return 'End unknown';
	if (estimatedEnd === 'Soon' || nextMatch.timing.queued.isActual) return 'Ends soon';
	return `Ends ${estimatedEnd}`;
}

function currentActivityState(
	competitionPhase: Dashboard['competitionPhase'],
	currentActivity: CurrentActivity,
	nextMatch: NextMatch,
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
	const showCountdown = displayLabel !== undefined && nextMatch !== null && displayLabel !== nextMatch.displayLabel;
	return {
		kind: 'match' as const,
		displayLabel,
		statusText: showCountdown ? matchEndText(nextMatch, now) : '',
	};
}

function CurrentActivityCard({
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
	const state = currentActivityState(competitionPhase, currentActivity, nextMatch, now);
	return (
		<article {...stylex.props(styles.card, styles.dividedCard)}>
			<div {...stylex.props(panelStyles.header)}>
				<h2 {...stylex.props(panelStyles.heading)}>Currently on field</h2>
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
						<MatchLabel displayLabel={state.displayLabel} {...stylex.props(styles.matchNumber)} />
					)}
				</div>
				{state.statusText && (
					<div {...stylex.props(styles.matchDetailSlot)}>
						<div {...stylex.props(styles.matchDetail, styles.matchStartTime)}>
							<TextMorph
								as="strong"
								{...stylex.props(styles.matchTimeValue, state.statusText.length > 16 && styles.activityEndValueLong)}
							>
								{state.statusText}
							</TextMorph>
						</div>
					</div>
				)}
			</div>
		</article>
	);
}

function NextMatchCard({ nextMatch }: { nextMatch: NonNullable<NextMatch> }) {
	const startText =
		nextMatch.startTime === null ? 'Start time unavailable' : `Starts ${formatClock(nextMatch.startTime)}`;
	return (
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
								startText.length > 14 && styles.matchTimeValueWithTwoDigitHour,
								startText.length > 16 && styles.matchTimeValueLong,
							)}
						>
							{startText}
						</TextMorph>
					</div>
				</div>
			</div>
		</article>
	);
}

function TimingCard({ nextMatch, now }: { nextMatch: NonNullable<NextMatch>; now: number }) {
	const countdown =
		nextMatch.startTime === null ? 'TBD' : formatMatchTiming({ time: nextMatch.startTime, isActual: false }, now, '');
	const statuses = timingStatusMilestones(nextMatch.timing);
	return (
		<article {...stylex.props(styles.card)}>
			<div {...stylex.props(panelStyles.header)}>
				<h2 {...stylex.props(panelStyles.heading)}>Timing</h2>
			</div>
			<div {...stylex.props(styles.cardBody, styles.timingBody)}>
				<div {...stylex.props(styles.matchCountdown)}>
					<span {...stylex.props(styles.matchCountdownLabel)}>
						{countdown === 'Soon' || countdown === 'TBD' ? 'Starts' : 'Starts in'}
					</span>
					<TextMorph
						as="strong"
						{...stylex.props(
							styles.matchCountdownValue,
							countdown.length > 9 && styles.matchCountdownValueLong,
							countdown.includes('hr') && styles.matchCountdownValueWithHours,
							countdown.includes('sec') && styles.matchCountdownValueWithSeconds,
						)}
					>
						{countdown}
					</TextMorph>
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
			<CurrentActivityCard
				competitionPhase={competitionPhase}
				currentActivity={currentActivity}
				nextMatch={nextMatch}
				now={now}
			/>
			{nextMatch ? (
				<>
					<NextMatchCard nextMatch={nextMatch} />
					<TimingCard nextMatch={nextMatch} now={now} />
				</>
			) : (
				<NoNextMatchCard />
			)}
		</section>
	);
}
