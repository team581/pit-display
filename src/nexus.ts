export function nexusTeamUrl(eventKey: string, team: number): string {
	return `https://frc.nexus/en/event/${encodeURIComponent(eventKey)}/team/${team}`;
}
