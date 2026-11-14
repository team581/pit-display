import * as stylex from '@stylexjs/stylex';
import { TextMorph } from 'torph/react';
import type { Dashboard, UpcomingMatch } from '../dashboard';
import { DurationMorph } from './DurationMorph';
import { breakStatusText, isBreakActive } from './elimination-break';
import { MatchLabel } from './MatchLabel';
import { MatchStart } from './MatchStart';
import { styles } from './EliminationSchedule.stylex';
import { Tile, tileGrid } from './Tile';

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
				<strong {...stylex.props(styles.timelineText, styles.timelineLabel)}>
					{row.break.previousMatch.displayLabel}
				</strong>
				<span {...stylex.props(styles.timelineText)}>
					<MatchStart now={now} time={row.break.previousMatch.startTime} variant="clock">
						{(text) => text}
					</MatchStart>
				</span>
			</div>
			<div {...stylex.props(styles.timelineRow, isActive && styles.activeBreak)}>
				<span {...stylex.props(styles.timelineMarker, isActive && styles.activeBreakMarker)} aria-hidden="true" />
				<span {...stylex.props(styles.timelineConnector)} aria-hidden="true" />
				<strong {...stylex.props(styles.timelineText, styles.timelineLabel)}>{row.break.label}</strong>
				<strong {...stylex.props(styles.timelineText)}>{breakStatusText(row.break, now)}</strong>
			</div>
			<div {...stylex.props(styles.timelineRow, styles.timelineDestination)}>
				<span {...stylex.props(styles.timelineMarker)} aria-hidden="true" />
				<strong {...stylex.props(styles.timelineText, styles.timelineLabel)}>{row.displayLabel}</strong>
				<span {...stylex.props(styles.timelineText)}>
					<MatchStart now={now} time={row.startTime} variant="clock">
						{(text) => text}
					</MatchStart>
				</span>
			</div>
		</div>
	);
}

function EliminationTile({ row, now }: { row: EliminationRow; now: number }) {
	return (
		<Tile
			title={row.context}
			tone={row.alliance ?? 'neutral'}
			trailing={row.displayLabel && row.alliance ? (row.alliance === 'red' ? 'Red' : 'Blue') : undefined}
			xstyle={styles.tile}
		>
			<div {...stylex.props(styles.tileBody, row.break && styles.tileBodyWithTimeline)}>
				{row.displayLabel ? (
					<>
						<div {...stylex.props(styles.primaryRow)}>
							<MatchLabel
								align="start"
								className={stylex.props(styles.matchLabel).className}
								displayLabel={row.displayLabel}
							/>
							<div {...stylex.props(styles.matchTime)}>
								<MatchStart now={now} time={row.startTime} variant="relative">
									{(text) => (
										<DurationMorph as="strong" {...stylex.props(styles.relativeStart)}>
											{text}
										</DurationMorph>
									)}
								</MatchStart>
								{!row.break && row.startTime !== null && (
									<MatchStart now={now} time={row.startTime} variant="clock">
										{(text) => (
											<TextMorph as="span" {...stylex.props(styles.clockStart)}>
												{text}
											</TextMorph>
										)}
									</MatchStart>
								)}
							</div>
						</div>
						<BreakTimeline now={now} row={{ ...row, displayLabel: row.displayLabel }} />
					</>
				) : (
					<strong {...stylex.props(styles.eliminated)}>Eliminated</strong>
				)}
			</div>
		</Tile>
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
	const rows = paths.length > 0 ? paths.map(rowFromPath) : matches.slice(0, 2).map(rowFromMatch);

	if (rows.length === 0) {
		return (
			<Tile aria-label="Next matches" as="section" xstyle={styles.fullWidth}>
				<p {...stylex.props(styles.empty)}>Waiting for the playoff bracket to update</p>
			</Tile>
		);
	}

	return (
		<section
			{...stylex.props(tileGrid.grid, styles.fullWidth, styles.tiles, rows.length === 1 && styles.singleTile)}
			aria-label="Next matches"
		>
			{rows.map((row) => (
				<EliminationTile key={row.key} now={now} row={row} />
			))}
		</section>
	);
}
