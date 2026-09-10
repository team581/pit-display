import * as stylex from '@stylexjs/stylex';
import type { UpcomingMatch } from '../dashboard';
import { TEAM_NUMBER } from '../team';
import { styles } from './AllianceBadge.stylex';

export function AllianceBadge({ alliance, teams }: Pick<UpcomingMatch, 'alliance' | 'teams'>) {
	return (
		<div
			{...stylex.props(styles.container, alliance === 'red' ? styles.red : styles.blue)}
			aria-label={`${alliance} alliance: teams ${teams.join(', ')}`}
		>
			<div {...stylex.props(styles.teams)}>
				{teams.map((team) => (
					<strong {...stylex.props(styles.team, team === TEAM_NUMBER && styles.ourTeam)} key={team}>
						{team}
					</strong>
				))}
			</div>
		</div>
	);
}
