# Team 581 Pit Display

An iPad-friendly dashboard for keeping the pit crew aware of the team's current match, queue timing, alliance color, and upcoming partners.

The display reads a dashboard-specific model from Convex. FRC Nexus sends full event updates to `/frc-nexus/webhook`; ingestion keeps the current field match and the configured team's remaining qualification matches, or the remaining playoff bracket and configured break durations during eliminations, then a reactive Convex query shapes the active event snapshot for the UI. When an update arrives for a new event, its snapshot atomically replaces the previous event's data. The browser only formats timestamps for its local time zone.

## Development

The project uses Node 26, pnpm 12, React, TanStack Start, TypeScript, and Vite+.

```sh
mise install
vp install
vp run dev
```

This starts the Convex function watcher and frontend together. Open the Portless URL shown in the terminal and use
landscape orientation for the intended display layout.

With [Pitchfork](https://pitchfork.jdx.dev/) activated in your shell, entering the project directory automatically
starts its Docker-based development services and leaving stops them. Run `pitchfork start playwright` to start the
Playwright server manually.

### Visual states

Open the Storybook catalog to inspect complete dashboard states and focused tile variants without running Convex or
FRC Nexus:

```sh
vp run storybook
```

The catalog uses deterministic dashboard fixtures from `src/testing/dashboard-scenarios.ts`. Raw Nexus fixtures in
`src/testing/nexus-fixtures.ts` cover the separate Nexus-to-dashboard transformation boundary.

Local screenshot comparisons run Vitest on the host and connect to a Playwright server in a pinned Linux/AMD64
container, so macOS can compare and update the Linux baselines directly:

```sh
vp run test:visual
vp run test:visual:update
```

Review and commit the updated PNGs after running the update command. CI runs natively on a pinned Ubuntu runner with
the same Playwright and WebKit versions. A manual **Generate Linux visual baselines** workflow remains available as a
fallback if the runner environment ever produces a different rendering. Failed comparison runs attach a Vitest HTML
report containing the actual and diff images. Pitchfork automatically manages the local server through Docker Compose.
The Docker build derives its Playwright and pnpm versions from `package.json`, and its BuildKit cache retains pnpm's
content-addressable store between image builds.

## Deploy

Publish the frontend to [pit.frc581.com](https://pit.frc581.com):

```sh
vp run deploy
```

Wrangler must be authenticated to the Team 581 Cloudflare account. The command deploys the prerendered `pit-display`
site and attaches the custom domain.

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
vp test
vp exec knip
vp run build
vp run storybook:build
```
