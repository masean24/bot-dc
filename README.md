# Discord Roblox Bot

A feature-rich Discord bot built with **discord.js v14**, **Mongoose 8**, and **Node.js 20+**. Includes Roblox account verification, group rank sync, game status lookup, mini-games, analytics, and full admin configuration.

---

## Features

- **Roblox Verification** — Link Discord accounts to Roblox via bio code verification
- **Group Rank Sync** — Assign/remove roles based on Roblox group rank
- **Game Status** — Look up live Roblox game info by Place ID
- **Mini-Games** — Rock-Paper-Scissors, Guess the Number, Roblox Trivia
- **Analytics** — Track message activity and view leaderboards
- **Admin Config** — Per-guild settings for welcome, verification, Roblox, and logging

---

## Prerequisites

- **Node.js 20+**
- **MongoDB** (local or Atlas)
- **Discord Bot Token** from [Discord Developer Portal](https://discord.com/developers/applications)

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd discord-roblox-bot
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Your Discord bot token |
| `CLIENT_ID` | Your Discord application client ID |
| `MONGO_URI` | MongoDB connection string (e.g. `mongodb://localhost:27017/botdb`) |
| `NODE_ENV` | `development` or `production` |
| `DEV_GUILD_ID` | *(Optional)* Guild ID for faster slash command registration during development |

### 3. Register Slash Commands

```bash
npm run deploy
```

- If `DEV_GUILD_ID` is set, commands register to that guild instantly.
- If not set, commands register globally (may take up to 1 hour to propagate).

### 4. Start the Bot

```bash
npm start
```

For development with auto-restart on file changes:

```bash
npm run dev
```

---

## Commands

### Roblox
| Command | Description |
|---------|-------------|
| `/verify username:<string>` | Start Roblox account verification |
| `/verify-confirm` | Confirm verification after adding code to bio |
| `/sync-roblox` | Sync your Roblox group rank with this server |
| `/roblox-status placeid:<number>` | Get live info about a Roblox game |

### Games
| Command | Description |
|---------|-------------|
| `/rps choice:<rock\|paper\|scissors>` | Play Rock Paper Scissors |
| `/guessnumber` | Guess a number 1-10 (3 attempts) |
| `/roblox-quiz` | Roblox trivia with score tracking |

### Admin (Requires Manage Guild)
| Command | Description |
|---------|-------------|
| `/setup` | Initialize bot config for this server |
| `/config welcome channel:<#channel>` | Set welcome channel |
| `/config welcome message:<string>` | Set welcome message (`{user}` = mention) |
| `/config verification role:<@role>` | Set verified role |
| `/config roblox group:<groupId>` | Link a Roblox group |
| `/config roblox minrank:<number>` | Set minimum group rank |
| `/config roblox role:<@role>` | Set Roblox group verified role |
| `/config logging channel:<#channel>` | Set logging channel |

### Analytics
| Command | Description |
|---------|-------------|
| `/top` | View top 10 most active users |

---

## Project Structure

```
src/
  commands/
    roblox/        — verify, verifyConfirm, syncRoblox, robloxStatus
    games/         — rps, guessNumber, robloxQuiz
    admin/         — setup, config
    analytics/     — top
  events/          — ready, interactionCreate, guildCreate, messageCreate
  models/          — Guild, User, Verification, Analytics, QuizScore
  services/        — robloxService, cooldownService, loggerService
  utils/           — embed, errorHandler, commandLoader
  config/          — constants
  index.js         — Entry point
  deploy-commands.js — Slash command registration
```

---

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **Bot** tab → copy the token → paste in `.env`
4. Enable these **Privileged Gateway Intents**:
   - Server Members Intent
   - Message Content Intent
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Manage Roles`, `Send Messages`, `Embed Links`, `Read Message History`, `Use Slash Commands`
6. Use the generated URL to invite the bot to your server

---

## License

MIT
