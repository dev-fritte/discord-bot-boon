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

This is a **Next.js-based Discord bot** using Discord's HTTP interactions API (serverless, no persistent WebSocket connection). Designed to deploy on Vercel.

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

### Key Files

| File | Role |
|------|------|
| `config.ts` | Validates and exports all env vars |
| `types/index.ts` | `executeCommand` type — the interface every command must implement |
| `utils/getCommands.ts` | Dynamic command loader with in-memory cache |
| `utils/discord-api.ts` | Axios instance pre-configured for Discord REST API |
| `utils/verify-discord-request.ts` | Ed25519 signature verification (TweetNaCl) |
| `src/app/api/discord-bot/interactions/route.ts` | Main interaction handler |
| `src/app/api/discord-bot/register-commands/route.ts` | Command registration endpoint |

### Path Aliases (tsconfig)

- `@/*` → project root
- `@@/*` → `/src/*`

### Required Environment Variables

```
NEXT_PUBLIC_APPLICATION_ID=
PUBLIC_KEY=
BOT_TOKEN=
REGISTER_COMMANDS_KEY=
```
