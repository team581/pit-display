self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			await self.clients.claim();
			const clients = await self.clients.matchAll({ type: 'window' });
			await Promise.allSettled(clients.map((client) => client.navigate(client.url)));
		})(),
	);
});
