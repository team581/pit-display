import { HeadContent, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { rootThemeCss } from '../../theme-colors';

export function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<style>{rootThemeCss}</style>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
