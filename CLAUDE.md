# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Next.js dev server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

No test runner is configured.

## Architecture

This is a **Next.js-based Discord bot dashboard** using Discord's HTTP interactions API (serverless, no persistent WebSocket connection). Designed to deploy on Vercel.

It has two distinct parts:
1. **Bot API** — handles Discord slash command interactions
2. **Dashboard** — a web UI for managing the bot, protected by Clerk auth

---

## Bot: Slash Commands

### Request Flow

1. Discord sends a POST to `/api/discord-bot/interactions` on every slash command
2. `route.ts` verifies the Ed25519 signature, then matches the command name to a file in `/commands/`
3. The matching command's `execute` function is called and returns a Discord interaction response

### Adding a New Command

Create `/commands/<name>.ts` exporting:
- `register` — a `SlashCommandBuilder` instance defining the command
- `execute` — an async function matching the `executeCommand` type from `/types/index.ts`

Commands are auto-discovered by `utils/getCommands.ts` which scans the `/commands/` directory at runtime (results are cached in-memory).

After adding a command, hit the `/api/discord-bot/register-commands` endpoint (requires `REGISTER_COMMANDS_KEY` header) or use the home page UI to register commands with Discord.

---

## Dashboard

### Auth & Server Selection

- Auth is handled by **Clerk** (Discord OAuth)
- There are no Clerk Organizations — server access is managed entirely via the Discord token
- On login, the user picks a Discord server they admin from the **server switcher** in the sidebar
- The selected server is stored in a `selectedGuildId` cookie (httpOnly, 1 year)
- `src/app/dashboard/layout.tsx` reads the cookie, looks up the server in SQLite, and passes it to the Sidebar
- Access control: any API route that reads/writes server data must verify the user's Discord token has `MANAGE_GUILD` (bit `0x20`) or owner status for that guild

### Server Switcher

The sidebar embeds a `ServerSwitcher` component (`src/components/dashboard/server-switcher.tsx`):
- Lazily fetches the user's admin guilds from `/api/discord/guilds` on first open
- Selecting a guild calls POST `/api/discord/select-server`, which verifies admin perms via Discord API, upserts the server into SQLite, and sets the cookie
- `router.refresh()` re-runs the layout to reflect the new selection

### Database (SQLite)

`better-sqlite3` is used as an embedded SQLite database. The DB file is `data.db` in the project root.

- Connection and schema init: `src/lib/db.ts`
- Schema is created automatically on first run (`CREATE TABLE IF NOT EXISTS`)
- Current tables:
  - `servers` — `guild_id` (PK), `guild_name`, `guild_icon`, `created_at`

To add a new table: add a `CREATE TABLE IF NOT EXISTS` statement to the `db.exec()` call in `src/lib/db.ts`.

### Discord OAuth Token

Clerk stores the user's Discord OAuth token. Retrieve it with:
```ts
const client = await clerkClient();
const tokens = await client.users.getUserOauthAccessToken(userId, 'discord'); // NOT 'oauth_discord'
const token = tokens.data?.[0]?.token;
```

Use `Authorization: Bearer ${token}` for Discord API calls on behalf of the user (not the bot token).

---

## Key Files

| File | Role |
|------|------|
| `config.ts` | Validates and exports all env vars |
| `types/index.ts` | `executeCommand` type — the interface every command must implement |
| `utils/getCommands.ts` | Dynamic command loader with in-memory cache |
| `utils/discord-api.ts` | Axios instance pre-configured for Discord REST API (Bot token) |
| `utils/verify-discord-request.ts` | Ed25519 signature verification (TweetNaCl) |
| `src/lib/db.ts` | SQLite connection, schema init, `ServerRow` type |
| `src/lib/utils.ts` | `cn()` Tailwind class merge helper |
| `src/app/api/discord-bot/interactions/route.ts` | Main slash command interaction handler |
| `src/app/api/discord-bot/register-commands/route.ts` | Command registration endpoint |
| `src/app/api/discord/guilds/route.ts` | GET — returns user's admin guilds via Discord OAuth token |
| `src/app/api/discord/select-server/route.ts` | POST — verifies admin, upserts server to SQLite, sets cookie |
| `src/app/dashboard/layout.tsx` | Server layout — reads cookie, fetches server from DB, passes to Sidebar |
| `src/components/dashboard/sidebar.tsx` | Client sidebar — renders ServerSwitcher + nav |
| `src/components/dashboard/server-switcher.tsx` | Client dropdown for switching Discord servers |

---

## Path Aliases (tsconfig)

- `@/*` → project root
- `@@/*` → `/src/*`

---

## Required Environment Variables

```
NEXT_PUBLIC_APPLICATION_ID=
PUBLIC_KEY=
BOT_TOKEN=
REGISTER_COMMANDS_KEY=
```

Clerk environment variables are injected automatically by the Clerk Next.js SDK (via `.env.local`).

## Clerk Setup Requirements

- Discord OAuth must be enabled with scopes: `identify`, `email`, `guilds`
- Do **not** add `guilds.channels.read` — it requires Discord app verification and will break the OAuth flow
- Organizations feature must be enabled in the Clerk dashboard (used internally, even though the app doesn't create orgs)
- The Discord app's OAuth2 redirect URIs must include the Clerk callback URL (e.g. `https://<your-clerk-domain>/v1/oauth_callback`)
