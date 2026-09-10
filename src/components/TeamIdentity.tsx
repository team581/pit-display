import * as stylex from '@stylexjs/stylex';
import { TEAM_NUMBER } from '../team';
import { styles } from './TeamIdentity.stylex';

export function TeamIdentity() {
	return (
		<div {...stylex.props(styles.container)}>
			<img {...stylex.props(styles.logo)} src="/team-581.svg" alt="Team 581 logo" />
			<strong {...stylex.props(styles.teamNumber)}>{TEAM_NUMBER}</strong>
		</div>
	);
}
