# KEYRA Global Developer Administration Console

`admin.developer.keyra.ie` — the master control layer for the worldwide KEYRA developer ecosystem.

> KEYRA is not merely another authentication provider — it is the trust layer of the internet, the human verification layer for AI, the telecom-grade identity infrastructure, the deterministic identity layer above all ecosystems. This console is the operational command surface that governs it.

## Stack

- Next.js 16 App Router (webpack) + React 19 + TypeScript 5
- Tailwind CSS v4 with KEYRA design tokens (dark-default, runtime light toggle)
- Zustand 5 client stores
- Radix Primitives (Dropdown, Tabs, Tooltip)
- TanStack Table v8 — heavy operational tables (25+ columns, server-side sort/filter)
- Recharts — metric charts
- `d3-geo` + handcrafted SVG centroids — global intelligence heatmap
- `@xyflow/react` (React Flow v12) — ecosystem dependency graph
- Framer Motion — micro-interactions
- SWR — realtime polling + revalidation (SSE for the dashboard)
- Sonner — toasts
- Material Symbols (Outlined) — system iconography
- Inter (sans), Montserrat (display), Geist Mono (mono)

## Design language

Aligned with [`simsecure-developer`](../simsecure-developer): solid fills, hairline
borders, neutral grayscale palette with a single link blue. No gradients, no
glassmorphism, no glow halos. The brand is the official KEYRA wordmark — there
is no synthesized "K" mark.

- **Theme**: dark is the default operator surface, but the topbar avatar menu
  exposes a Light/Dark toggle that persists per-browser in
  `localStorage["keyra_admin_prefs"].theme`. A pre-hydration script
  (`components/theme-init-script.tsx`) applies the saved value before React
  mounts, eliminating the flash of wrong theme.
- **Buttons**: primary is black-on-white (or white-on-black in dark mode);
  outline is `--ds-surface-card` with a hairline border; danger is outlined
  red.
- **Tokens**: see [`app/keyra-theme.css`](./app/keyra-theme.css) for the full
  CSS-variable surface and [`lib/design-tokens.ts`](./lib/design-tokens.ts)
  for the JS mirror used by chart libraries.
- **Logos**: see [`public/assets/`](./public/assets/) — `keyra_logo_hz_{black,white}.png`
  swap automatically based on `[data-theme]`.

## Project structure

```
keyra-global-developer-admin/
├── app/
│   ├── (admin)/        # all twenty sections — guarded super-admin shell
│   ├── (public)/login  # SSO entry point
│   ├── globals.css     # tailwind + theme imports
│   └── keyra-theme.css # KEYRA design tokens
├── components/
│   ├── layout/         # sidebar, topbar, admin-shell
│   ├── ui/             # primitives (button, panel, metric-card, trust-ring, …)
│   └── providers.tsx
├── features/<domain>/services/  # API service modules per domain
├── hooks/                       # Zustand stores
├── lib/                         # utils, formatting, admin-fetch, nav config
└── types/                       # domain TypeScript types
```

## Backend

All admin data is served by [simsecure-auth-session](../simsecure-auth-session) under `/admin/global/*`,
behind a `requireSuperAdmin` middleware. Authentication is the existing `/auth/session` cookie SSO.

## Local development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

The console runs on **http://localhost:3100** by default. The auth backend should be running on
http://localhost:4000 (start it from `simsecure-auth-session` with `npm run dev`).

## Sidebar — twenty sections

| # | Section | Phase |
|---|---|---|
| 1 | Global dashboard | Phase 1 |
| 2 | Developers | Phase 2 |
| 3 | Organizations | Phase 3 |
| 4 | Applications | Phase 4 |
| 5 | API infrastructure | Phase 5 |
| 6 | SDK management | Phase 5 |
| 7 | AI agent ecosystem | Phase 6 |
| 8 | Trust verification | Phase 6 |
| 9 | Telecom integrations | Phase 7 |
| 10 | Revenue intelligence | Phase 8 |
| 11 | Country intelligence | Phase 7 |
| 12 | Industry intelligence | Phase 7 |
| 13 | Security operations | Phase 8 |
| 14 | Compliance center | Phase 8 |
| 15 | Developer outreach | Phase 9 |
| 16 | Ecosystem dependencies | Phase 9 |
| 17 | Incident command | Phase 9 |
| 18 | Global messaging | Phase 10 |
| 19 | Audit logs | Phase 10 |
| 20 | System configuration | Phase 10 |

## Scripts

```bash
npm run dev    # next dev --webpack --port 3100
npm run build  # next build --webpack
npm run lint   # eslint
```

## Dev runbook

### 1. Start the backend (`simsecure-auth-session`)

```bash
cd ../simsecure-auth-session
npm install
npm run dev               # boots on http://localhost:4000
```

On first boot the schema migration runs automatically and creates every
`keyra_admin_*` table plus an additive `role` column on `auth_users`.
Existing functionality is **unaffected**.

### 2. Seed fixtures

```bash
cd ../simsecure-auth-session
# Promote one or more phone numbers to super_admin so they can sign in here:
KEYRA_ADMIN_PHONES="+353851234567,+15551234567" npm run seed:keyra-admin
```

Re-running the seed is safe — it upserts and tops up developers, organizations,
applications, AI agents, country/industry intelligence rolls and a handful of
seed incidents, escalations and audit entries.

### 3. Start the console

```bash
cd ../keyra-global-developer-admin
npm install               # uses .npmrc legacy-peer-deps for React 19
npm run dev               # boots on http://localhost:3100
```

Open `http://localhost:3100`. You will be redirected through the
`simsecure-auth-session` SSO. After login the guard checks for `role = 'super_admin'`;
if you didn't seed your phone in step 2, the console refuses access with a
403 message.

### 4. Production build

```bash
npm run build  # generates .next via webpack
npm start
```

## Operations

- **Realtime**: the global dashboard uses Server-Sent Events at
  `GET /admin/global/dashboard/stream`. Every panel falls back gracefully if
  the SSE channel disconnects.
- **Audit**: every super-admin action (suspend, revoke, escalation update,
  broadcast send, system-config edit, …) emits a row into
  `keyra_admin_audit_logs` via `writeAuditLog`. The Audit Logs section
  exposes filtering and JSON payload drill-down.
- **System config**: PATCHes are versioned in
  `keyra_admin_system_config_history`. The detail panel renders the diff
  history with author, timestamp, and old/new values.
- **Incidents**: posting an update with a `status` transition automatically
  mutates the incident's status and stamps `resolved_at` when resolved.
