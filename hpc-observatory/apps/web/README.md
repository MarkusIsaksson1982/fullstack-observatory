# @hpc-observatory/web

Next.js 15 dashboard for the HPC-Observatory scheduler. Two ways to view it.

## Live demo on Vercel

`<TODO: paste Vercel URL after first deploy>` — runs with `NEXT_PUBLIC_DEMO_MODE=true`. Sample jobs, nodes, and stats; submit/delete actions are no-ops. The DEMO MODE banner across the top makes the snapshot explicit.

## Local against the live scheduler

```bash
# from the hpc-observatory/ directory
docker compose up -d
```

This brings up the Go scheduler, Python hooks, Prometheus, Grafana, Alertmanager, and this dashboard. The dashboard at <http://localhost:3002> talks to the scheduler via same-origin `/api/*` proxy and shows real job/node state. The header links to the live Prometheus / Grafana / Alertmanager UIs.

## Demo-mode toggle

`src/lib/api.ts` checks `process.env.NEXT_PUBLIC_DEMO_MODE` on every fetch. When `true`, each method returns data from `src/lib/demo-data.ts` instead of hitting `/api/*`. Timestamps are computed relative to `Date.now()` so the dashboard's walltimes tick forward on each refresh and the snapshot feels alive.

To run the demo mode locally:

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

## Vercel deploy notes

- **Root Directory:** `hpc-observatory/apps/web`
- **Framework Preset:** Next.js (auto-detected)
- **Environment variables:** `NEXT_PUBLIC_DEMO_MODE=true`
- Speed Insights and Analytics are wired in `src/app/layout.tsx` — enable them in the Vercel project settings to start collecting Web Vitals.
