# Suzune Dashboard

Web control panel for the [Suzune](https://github.com/HrxshxYT/Suzune) Discord bot.

Two pages built to production depth:

1. **Server Overview** — security posture at a glance: integrity index, protection
   states, metric grid, `/scan` findings and recent security events.
2. **Anti-Nuke** — full configuration of the flagship module.

Moderation, Automod, Logging, Tickets, Leveling, Welcome and Invites appear in the
navigation as disabled "Soon" items. The shell, routing and layout primitives are
already in place, so those pages drop in without refactoring.

## Quick start

```bash
npm install
npm run dev
```

That is all you need. `VITE_USE_MOCKS=true` is the default in `.env`, so the app
runs fully populated and fully interactive with **no backend** — saving,
toggling, whitelisting and panic mode all work against an in-memory store.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server on :5173 |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run preview` | Serve the production build |

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `VITE_USE_MOCKS` | `true` | Swap in the mock adapter; no backend required |
| `VITE_API_BASE_URL` | `''` | Origin of the bot's dashboard API. Ignored while mocking |

Set `VITE_USE_MOCKS=false` and point `VITE_API_BASE_URL` at the API to go live.

## Architecture

```
src/
  api/          types.ts · client.ts (typed, one fn per endpoint) · mock.ts
  components/   ui/ primitives, then shell components
  features/     overview/ · antinuke/
  hooks/        TanStack Query wrappers
  lib/          theme · formatting · antinuke domain constants
  routes/       page components
  styles/       tokens.css
```

**Stack:** React 18 · TypeScript (strict) · Vite · Tailwind · React Router v6 ·
TanStack Query · Recharts · lucide-react · zod.

### Data layer

Every request goes through `src/api/client.ts`. Nothing else calls `fetch`.
Swapping `USE_MOCKS` replaces the whole adapter, so the mock and the real client
satisfy the same interface and cannot drift apart.

### Backend contract

The dashboard reads and writes **the rows the bot owns** — it is a view and
editor over the bot's Prisma models (`Guild`, `AntinukeConfig`, `Whitelist`,
`Case`), never a second source of truth. `src/api/types.ts` mirrors those models.

```
GET    /api/auth/me
GET    /api/guilds                        → guilds where the user has Manage Server
GET    /api/guilds/:id/overview
GET    /api/guilds/:id/scan
GET    /api/guilds/:id/events?limit=10
GET    /api/guilds/:id/antinuke
PATCH  /api/guilds/:id/antinuke
GET    /api/guilds/:id/antinuke/whitelist
POST   /api/guilds/:id/antinuke/whitelist
DELETE /api/guilds/:id/antinuke/whitelist/:entryId
POST   /api/guilds/:id/antinuke/test-alert
GET    /api/guilds/:id/channels
GET    /api/guilds/:id/roles
```

Auth is Discord OAuth2 (`identify` + `guilds`). Only users holding **Manage
Server** on a guild may edit it, and that check is enforced **server-side on
every mutation** — the client's `canManage` flag is presentation only.

## Design tokens

Every colour, space, radius, shadow and duration is a CSS custom property in
`src/styles/tokens.css`, consumed through Tailwind. No component contains a hex
value.

Status and brand colours carry **separate fill and text values per theme**. The
vivid palette fails WCAG AA badly as text — on light, `warning #F59E0B` is
2.04:1 and `lilac #C4B5FD` is 1.75:1. The `--*-text` variants are solved to clear
4.5:1 against the worst-case surface in their theme:

| Token | Fill | Light text | Dark text |
|---|---|---|---|
| primary | `#8B5CF6` | `#7D49F5` | `#9266F7` |
| critical | `#EF4444` | `#DB1313` | `#EF4444` |
| warning | `#F59E0B` | `#986206` | `#F59E0B` |
| success | `#22C55E` | `#167F3D` | `#22C55E` |
| info | `#60A5FA` | `#0769E2` | `#60A5FA` |

`--border-strong` (3:1) is used for interactive boundaries such as input
outlines; the base `--border` is for dividers only.

Status colour is never the sole carrier of meaning — every status pairs with an
icon and a text label.

## Accessibility

- Both themes verified against WCAG 2.1 AA for every text/background pair in use.
- Keyboard complete: visible focus rings, skip-to-content link, modals trap focus
  and restore it on close, `Esc` closes.
- `aria-live` on toasts, `aria-describedby` linking help text to controls,
  semantic landmarks.
- Touch targets ≥ 44×44px.
- Responsive to 360px — sidebar becomes a drawer, no horizontal scroll.
- `prefers-reduced-motion` disables the ring animation and all transitions.

## Interaction rules

- Destructive actions confirm: disabling Anti-Nuke, enabling panic mode (typed
  `PANIC`), and removing a whitelist entry.
- Panic mode saves immediately with optimistic UI and rollback on failure —
  it is a break-glass control, not a draft.
- Everything else is a draft until **Save changes** on the sticky save bar;
  `beforeunload` warns about unsaved edits.
- Loading is skeletons matched to the incoming shape, never spinners.
- Errors state what failed and offer a retry.

## Deployment

```bash
npm run build      # → dist/
```

`dist/` is static. Serve it from any host, with a rewrite so client-side routes
resolve to `index.html`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Serve it same-origin with the API, or set `VITE_API_BASE_URL` and enable CORS
with credentials on the API.
