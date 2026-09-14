import * as stylex from '@stylexjs/stylex';
import { styles } from './MatchWarning.stylex';

export function MatchWarning({ warning }: { warning: string }) {
	return <div {...stylex.props(styles.warning)}>{warning}</div>;
}
