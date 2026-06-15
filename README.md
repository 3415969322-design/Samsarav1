# Samsara

Samsara is a long-term Personal OS and second brain built for one owner. It is a private dashboard for daily planning, writing, files, journal records, search, settings, and AI workflows.

## v1.0 Features

- Public profile and product introduction
- Password-protected private workspace
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

Start PostgreSQL using the connection in `.env`, then run:

```bash
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open:

```text
http://localhost:3000
```

Default local password from `.env.example`:

```text
change-this-local-password
```

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
- `pnpm db:up` uses Docker Compose. If Docker is not installed, start PostgreSQL manually with the same credentials from `.env`.
- `storage/local` is ignored by Git and used by the local storage provider.
- AI defaults to `AI_PROVIDER="local"`, which returns deterministic local Markdown responses. Set `AI_PROVIDER="openai-compatible"` and configure `AI_API_KEY` for external model calls.

## Documentation

- [Product](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Data Model](docs/data-model.md)
- [AI Roadmap](docs/ai-roadmap.md)
- [Changelog](docs/CHANGELOG.md)
