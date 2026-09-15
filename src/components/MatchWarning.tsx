import * as stylex from '@stylexjs/stylex';
import { TextMorph } from 'torph/react';
import { styles } from './MatchWarning.stylex';

export function MatchWarning({ warning }: { warning: string }) {
	return (
		<TextMorph as="div" {...stylex.props(styles.warning)}>
			{warning}
		</TextMorph>
	);
}
