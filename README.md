# Team 581 Pit Display

An iPad-friendly dashboard for keeping the pit crew aware of the team's current match, queue timing, alliance color, and upcoming partners.

The display reads realtime event snapshots from Convex. FRC Nexus sends full event updates to `/frc-nexus/webhook`; Convex keeps the newest snapshot for each event and reactively updates the dashboard.

## Development

The project uses Node 26, pnpm 12, React, TypeScript, and Vite+.

```sh
mise install
vp install
vp dev
```

In a second terminal, run the Convex function watcher:

```sh
pnpm convex dev
```

Open the local URL shown by Vite+ and use landscape orientation for the intended display layout.

## Deploy

Publish the frontend to [pit.frc581.com](https://pit.frc581.com):

```sh
vp run deploy
```

Wrangler must be authenticated to the Team 581 Cloudflare account. The command deploys the `pit-display` Worker and
attaches the custom domain.

## Install on iPad

Open the deployed site in Safari, tap **Share**, then choose **Add to Home Screen**. The installed app launches in
landscape as a standalone display and keeps the frontend available offline; live match data still requires a network
connection.

## FRC Nexus webhook

Register this URL as a **Live event status** webhook in FRC Nexus:

```text
https://hardy-trout-638.convex.site/frc-nexus/webhook
```

Configure the same shared token as `NEXUS_WEBHOOK_TOKEN` in the Convex deployment. `NEXUS_API_KEY` is reserved for later reconciliation pulls; normal live updates use the webhook token.

To pull an event immediately instead of waiting for its next webhook update:

```sh
pnpm convex run frcNexus:pullEventStatus '{"eventKey":"demo9705"}'
```

## Validation

```sh
vp check
vp exec knip
vp run build
```
