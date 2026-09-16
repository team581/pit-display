import type { Doc } from '../../convex/_generated/dataModel';
import type { Match } from '../frc-nexus/generated/types.gen';

export function nexusApiMatch(label: string, overrides: Partial<Match> = {}): Match {
	return {
		label,
		status: 'Queuing soon',
		redTeams: ['1', '2', '3'],
		blueTeams: ['4', '5', '6'],
		times: {},
		...overrides,
	};
}

type StoredNexusMatch = Doc<'eventStatuses'>['matches'][number];

export function storedNexusMatch(label: string, overrides: Partial<StoredNexusMatch> = {}): StoredNexusMatch {
	return {
		label,
		status: 'Queuing soon',
		redTeams: ['1', '2', '3'],
		blueTeams: ['4', '5', '6'],
		times: {},
		...overrides,
	};
}
