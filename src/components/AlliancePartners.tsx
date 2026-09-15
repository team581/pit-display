import * as stylex from '@stylexjs/stylex';
import type { Dashboard } from '../dashboard';
import { nexusTeamUrl } from '../nexus';
import { styles } from './AlliancePartners.stylex';
import { panelStyles } from './Panel.stylex';

export function AlliancePartners({
	eventKey,
	teams,
}: {
	eventKey: Dashboard['eventKey'];
	teams: Dashboard['alliancePartners'];
}) {
	return (
		<section {...stylex.props(styles.panel)} aria-labelledby="alliance-partners-heading">
			<div {...stylex.props(panelStyles.header)}>
				<h2 {...stylex.props(panelStyles.heading)} id="alliance-partners-heading">
					Alliance partners
				</h2>
			</div>
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
		</section>
	);
}
