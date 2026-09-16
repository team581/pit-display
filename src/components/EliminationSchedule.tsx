import * as stylex from '@stylexjs/stylex';
import { TextMorph } from 'torph/react';
import type { Dashboard, UpcomingMatch } from '../dashboard';
import { formatClock, formatRelativeTime } from '../format-time';
import { breakStatusText, isBreakActive } from './elimination-break';
import { MatchLabel } from './MatchLabel';
import { panelStyles } from './Panel.stylex';
import { styles } from './EliminationSchedule.stylex';

type EliminationPath = Dashboard['eliminationPaths'][number];
type EliminationRow = Pick<EliminationPath, 'alliance' | 'break' | 'displayLabel' | 'startTime'> & {
	context: string;
	key: string;
};

function rowFromPath(path: EliminationPath): EliminationRow {
	return { ...path, context: `If we ${path.outcome}`, key: path.outcome };
}

function rowFromMatch(match: UpcomingMatch, index: number): EliminationRow {
	return {
		context: index === 0 ? 'Next' : 'Then',
		key: match.key,
		displayLabel: match.displayLabel,
		startTime: match.startTime,
		break: match.break,
		alliance: match.alliance,
	};
}

function BreakTimeline({ row, now }: { row: EliminationRow & { displayLabel: string }; now: number }) {
	if (!row.break) return null;
	const isActive = isBreakActive(row.break, now);

	return (
		<div
			{...stylex.props(styles.breakTimeline)}
			aria-label={`${row.break.label} after ${row.break.previousMatch.displayLabel} before ${row.displayLabel}`}
		>
			<div {...stylex.props(styles.timelineRow)}>
				<span {...stylex.props(styles.timelineMarker)} aria-hidden="true" />
				<span {...stylex.props(styles.timelineConnector)} aria-hidden="true" />
				<strong {...stylex.props(styles.timelineLabel)}>{row.break.previousMatch.displayLabel}</strong>
				<span {...stylex.props(styles.timelineTime)}>Starts {formatClock(row.break.previousMatch.startTime)}</span>
			</div>
			<div {...stylex.props(styles.timelineRow, styles.timelineBreak, isActive && styles.activeBreak)}>
				<span {...stylex.props(styles.timelineMarker, isActive && styles.activeBreakMarker)} aria-hidden="true" />
				<span {...stylex.props(styles.timelineConnector)} aria-hidden="true" />
				<strong {...stylex.props(styles.timelineLabel)}>{row.break.label}</strong>
				<strong {...stylex.props(styles.timelineTime)}>{breakStatusText(row.break, now)}</strong>
			</div>
			<div {...stylex.props(styles.timelineRow, styles.timelineDestination)}>
				<span {...stylex.props(styles.timelineMarker)} aria-hidden="true" />
				<strong {...stylex.props(styles.timelineLabel)}>{row.displayLabel}</strong>
				<span {...stylex.props(styles.timelineTime)}>Starts {formatClock(row.startTime)}</span>
			</div>
		</div>
	);
}

export function EliminationSchedule({
	paths,
	matches,
	now,
}: {
	paths: Dashboard['eliminationPaths'];
	matches: Dashboard['upcomingMatches'];
	now: number;
}) {
	const rows = paths.length > 0 ? paths.map(rowFromPath) : matches.map(rowFromMatch);

	return (
		<section {...stylex.props(styles.schedule)} aria-label="Next matches">
			<div {...stylex.props(styles.rows)}>
				{rows.length === 0 ? (
					<p {...stylex.props(styles.empty)}>Waiting for the playoff bracket to update.</p>
				) : (
					rows.map((row, index) => (
						<article {...stylex.props(styles.matchCard, index > 0 && styles.divider)} key={row.key}>
							<div {...stylex.props(panelStyles.header)}>
								<TextMorph as="h2" {...stylex.props(panelStyles.heading)}>
									{row.context}
								</TextMorph>
							</div>
							<div {...stylex.props(styles.cardBody)}>
								{row.displayLabel ? (
									<>
										<div {...stylex.props(styles.primaryRow)}>
											<div {...stylex.props(styles.destination)}>
												<MatchLabel displayLabel={row.displayLabel} {...stylex.props(styles.matchNumber)} />
												<div
													{...stylex.props(styles.alliance, row.alliance === 'red' ? styles.red : styles.blue)}
													aria-label={`${row.alliance} alliance`}
												>
													{row.alliance === 'red' ? 'Red' : 'Blue'}
												</div>
											</div>
											<div {...stylex.props(styles.matchTime)}>
												<TextMorph as="strong" {...stylex.props(styles.startTime)}>
													{row.break
														? formatRelativeTime(row.startTime, now, 'in ')
														: `Starts ${formatClock(row.startTime)}`}
												</TextMorph>
												{!row.break && (
													<TextMorph as="span" {...stylex.props(styles.relativeTime)}>
														{formatRelativeTime(row.startTime, now, 'in ')}
													</TextMorph>
												)}
											</div>
										</div>
										<BreakTimeline now={now} row={{ ...row, displayLabel: row.displayLabel }} />
									</>
								) : (
									<strong {...stylex.props(styles.eliminated)}>Eliminated</strong>
								)}
							</div>
						</article>
					))
				)}
			</div>
		</section>
	);
}
