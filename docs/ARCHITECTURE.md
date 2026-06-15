# Samsara Architecture

Samsara is a modular monolith built with Next.js App Router, TypeScript, Prisma, and PostgreSQL.

## Application Layers

- `src/app`: App Router pages, route groups, and API routes
- `src/components`: shared UI, layout, theme, and command palette components
- `src/features`: product feature modules and server actions
- `src/lib`: shared infrastructure for auth, database, storage, AI, search, config, and Markdown helpers
- `prisma`: schema, migrations, and seed data
- `storage/local`: local file object storage for development
- `docs`: product and engineering documentation

## Route Groups

- `(public)`: public profile pages
- `(auth)`: login
- `(os)`: protected Personal OS workspace
- `api`: protected file content and download APIs

## Data Boundaries

The database stores durable metadata and content. Files are stored through `StorageProvider`, with metadata in `FileAsset`. AI calls are routed through `AIService`, with durable history in `AIHistory`.

## Provider Boundaries

- `StorageProvider`: Local is implemented. R2, S3, and Supabase Storage are reserved.
- `AIProvider`: Local fallback and OpenAI-compatible provider boundary are implemented.
- `AIContextProvider`: Context interfaces exist for Diary, Todo, Documents, Files, and system context. v1.0 does not implement knowledge retrieval or RAG.

## Security Model

v1.0 uses a single owner account, password hash with scrypt, HTTP-only session cookies, protected OS routes, and user-scoped database queries.

## Release Standard

Before release:

- Prisma schema validates
- TypeScript passes
- ESLint passes
- Production build passes
- Route protection smoke tests pass
- Documentation is current
