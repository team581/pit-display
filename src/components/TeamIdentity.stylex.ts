import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
	container: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
	},
	logo: {
		width: 'clamp(50px, 5vw, 72px)',
		height: 'clamp(50px, 5vw, 72px)',
		objectFit: 'contain',
	},
	teamNumber: {
		paddingBlock: '3px',
		paddingInline: '8px',
		color: 'white',
		fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
		fontWeight: 900,
		fontVariationSettings: "'wdth' 90",
		lineHeight: 1,
	},
});
