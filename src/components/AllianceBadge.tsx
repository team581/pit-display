import * as stylex from '@stylexjs/stylex';
import type { UpcomingMatch } from '../dashboard';
import { nexusTeamUrl } from '../nexus';
import { TEAM_NUMBER } from '../team';
import { styles } from './AllianceBadge.stylex';

export function AllianceBadge({
	alliance,
	eventKey,
	teams,
}: Pick<UpcomingMatch, 'alliance' | 'teams'> & { eventKey: string }) {
	return (
		<div
			{...stylex.props(styles.container, alliance === 'red' ? styles.red : styles.blue)}
			aria-label={`${alliance} alliance: teams ${teams.join(', ')}`}
		>
			<div {...stylex.props(styles.teams)}>
				{teams.map((team) => (
					<a
						{...stylex.props(styles.team, team === TEAM_NUMBER && styles.ourTeam)}
						href={nexusTeamUrl(eventKey, team)}
						key={team}
						rel="noreferrer"
						target="_blank"
					>
						{team}
					</a>
				))}
			</div>
		</div>
	);
}
