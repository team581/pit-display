export type CompetitionPhase = 'qualification' | 'allianceSelection' | 'elimination';

type Match = {
	label?: string | null;
	status?: string | null;
};

export function isEliminationMatch(label: string | null | undefined): boolean {
	return /^(Playoff|Final) /.test(label ?? '');
}

export function matchIndexes(matches: readonly Match[], phase: CompetitionPhase) {
	const lastOnFieldIndex = matches.findLastIndex((match) => match.status === 'On field');
	if (phase !== 'elimination') return { currentMatchIndex: lastOnFieldIndex, lastOnFieldIndex };

	const eliminationOnFieldIndex = matches.findLastIndex(
		(match) => match.status === 'On field' && isEliminationMatch(match.label),
	);
	const eliminationOnDeckIndex = matches.findIndex(
		(match) => match.status === 'On deck' && isEliminationMatch(match.label),
	);
	return {
		currentMatchIndex: Math.max(eliminationOnFieldIndex, eliminationOnDeckIndex),
		lastOnFieldIndex,
	};
}
