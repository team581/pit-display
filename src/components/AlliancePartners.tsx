import * as stylex from '@stylexjs/stylex';
import type { Dashboard } from '../dashboard';
import { nexusTeamUrl } from '../nexus';
import { styles } from './AlliancePartners.stylex';
import { Tile } from './Tile';

export function AlliancePartners({
	eventKey,
	teams,
}: {
	eventKey: Dashboard['eventKey'];
	teams: Dashboard['alliancePartners'];
}) {
	return (
		<Tile as="section" title="Alliance partners" xstyle={styles.tile}>
			<div {...stylex.props(styles.body)}>
				{teams.length > 0 ? (
					<div {...stylex.props(styles.teams)}>
						{teams.map((team) => (
							<a
								{...stylex.props(styles.team)}
								href={nexusTeamUrl(eventKey, team)}
								key={team}
								rel="noreferrer"
								target="_blank"
							>
								{team}
							</a>
						))}
					</div>
				) : (
					<strong {...stylex.props(styles.waiting)}>Waiting for our alliance</strong>
				)}
			</div>
		</Tile>
	);
}
