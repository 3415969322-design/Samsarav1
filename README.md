# Samsara

Samsara is a long-term Personal OS and second brain with private multi-user accounts. It is a dashboard for daily planning, writing, files, journal records, search, settings, and AI workflows, with each user's workspace isolated by `userId`.

## v1.0 Features

- Public profile and product introduction
- Email/password accounts with invite-code registration
- Password-protected private workspaces
- Dashboard-first OS layout
- Todo CRUD with priority, due date, tags, filters, sorting, and search
- Markdown Documents with auto-save, preview, tags, pinning, archive, and search
- Unified Tags across Todo, Documents, Diary, and Files
- Files module with upload, preview, download, rename, delete, metadata, search, and tags
- Diary module with Markdown, date/month/year browsing, mood, weather, favorite, archive, tags, search, and attachments
- AI Workbench with AI Chat, Markdown replies, conversation history, prompt library boundary, provider boundary, and context interfaces
- Settings for theme, profile, password, and reserved AI/Storage configuration

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma 7
- PostgreSQL
- Server Actions
- Local StorageProvider abstraction
- AIProvider abstraction with local fallback and OpenAI-compatible provider

## Local Development

Install dependencies:

```bash
pnpm install
```

Configure environment:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to the Supabase PostgreSQL connection string. Do not commit `.env`.

Initialize or update the database only after confirming the target database:

```bash
pnpm db:generate
pnpm db:seed
pnpm dev
```

Open:

```text
http://localhost:3000
```

Required private environment variables:

- `DATABASE_URL`
- `SESSION_SECRET`
- `INVITE_CODE`
- `SEED_USER_EMAIL`
- `SEED_USER_NAME`
- `SEED_USER_PASSWORD`

## Release Checks

```bash
pnpm db:validate
pnpm typecheck
pnpm lint
pnpm build
pnpm release:check
```

## Important Notes

- A running PostgreSQL database is required for login and all private modules.
- Production uses Supabase PostgreSQL on Vercel. Do not run destructive Prisma commands such as `prisma migrate reset` against production.
- `storage/local` is ignored by Git and used by the local storage provider.
- AI defaults to `AI_PROVIDER="local"`, which returns deterministic local Markdown responses. Set `AI_PROVIDER="openai-compatible"` and configure `AI_API_KEY` for external model calls.

## Documentation

- [Product](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Data Model](docs/data-model.md)
- [AI Roadmap](docs/ai-roadmap.md)
- [Changelog](docs/CHANGELOG.md)
