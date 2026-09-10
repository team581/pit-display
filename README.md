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
npx convex dev
```

Open the local URL shown by Vite+ and use landscape orientation for the intended display layout.

## FRC Nexus webhook

Register this URL as a **Live event status** webhook in FRC Nexus:

```text
https://hardy-trout-638.convex.site/frc-nexus/webhook
```

Configure the same shared token as `NEXUS_WEBHOOK_TOKEN` in the Convex deployment. `NEXUS_API_KEY` is reserved for later reconciliation pulls; normal live updates use the webhook token.

To pull an event immediately instead of waiting for its next webhook update:

```sh
npx convex run frcNexus:pullEventStatus '{"eventKey":"demo9705"}'
```

## Validation

```sh
vp check
vp exec knip
vp run build
```
