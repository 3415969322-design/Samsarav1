# Changelog

## 2026-06-15 - Bilingual UI

- Added a lightweight English/Chinese language provider with local browser persistence.
- Added an in-app language toggle for public, auth, and protected OS surfaces.
- Localized primary navigation, command palette, public profile, login, Dashboard, Settings, and core module UI text.
- Added translated form controls for placeholders and select options without changing existing server actions or database models.

## 2026-06-15 - Release Readiness Follow-up

- Added Docker Compose PostgreSQL setup for local development and release validation.
- Added a `release:check` script that runs schema validation, type checks, linting, production build, and optional database migration/seed checks.
- Documented database startup requirements in `README.md`.

## 2026-06-15 - v1.0 Release

- Added the public profile and product introduction pages.
- Completed Settings for profile, password, theme preference, and reserved AI/Storage configuration surfaces.
- Updated Dashboard, navigation, login, and module labels for v1.0.
- Consolidated Markdown plain-text conversion into `src/lib/markdown/text.ts`.
- Replaced default README content and added v1.0 product, architecture, roadmap, and data model documentation.
- Improved login behavior when PostgreSQL is unreachable by showing a user-facing database error.

## 2026-06-15 - Phase 5: AI Workbench

- Added the AI Workbench homepage with AI Chat active and reserved cards for Daily Summary, Study Assistant, File Assistant, Todo Planner, and Prompt Library.
- Added continuous AI Chat with Markdown replies, code block styling, conversation history, new conversations, and conversation deletion.
- Persisted chat turns through `AIHistory` without adding module-specific AI calls to Todo, Diary, Documents, or Files.
- Added a centralized `AIService`, provider interface, local fallback provider, OpenAI-compatible provider boundary, context provider interface, and prompt library.

## 2026-06-15 - Phase 4: Diary

- Added the Diary workspace with create, edit, delete, auto-save, Markdown editing, live preview, date/month/year browsing, full-text search, mood, weather, favorite, and archive.
- Reused the shared Tag system for Diary tags and extended workspace search to include Diary entries.
- Reused Files through `FileOnEntity` attachment links so journal entries can attach existing `FileAsset` records without duplicating file upload logic.
- Added `favorite` and `archived` fields to the `Diary` model with a supporting migration.

## 2026-06-15 - Phase 3: Files

- Added the Files workspace with upload, list, detail, rename, delete, download, search, type filtering, and tag association.
- Implemented local file persistence through the existing `StorageProvider` boundary, including metadata reads and protected object retrieval.
- Added protected file content and download API routes for previews and downloads.
- Added inline previews for images and PDF files, with download fallback for Office, Markdown, text, ZIP, and other supported types.
- Extended workspace search and tag management to include Files without changing the Phase 1 database schema.

## 2026-06-15 - Milestone Review: Phase 0-2

- Verified the Samsara foundation through TypeScript, ESLint, Prisma schema validation, production build, and runtime smoke tests.
- Added `prisma/migrations/migration_lock.toml` so Prisma recognizes the migrations directory as PostgreSQL-backed.
- Added `SHADOW_DATABASE_URL` to `.env.example` and `prisma.config.ts` for future migration drift checks.
- Updated the local ignored `.env` from Prisma's default `johndoe/mydb` sample to Samsara local development values.
- Confirmed Phase 3 can build on existing `FileAsset`, `FileOnEntity`, and `StorageProvider` boundaries without a schema redesign.

## 2026-06-15 - Phase 2: Todo, Documents, Tags, Search

- Added Todo CRUD, completion toggles, priority, due dates, filters, sorting, search, and tag association.
- Added Documents as the Markdown writing module with create, edit, delete, auto-save, live preview, pinning, archive, tags, and search.
- Added unified Tag management for global, Todo, and Document tags.
- Added basic workspace search across Todo and Documents.
- Updated Command Palette to route searches to `/search`.
- Kept `/notes` as a compatibility redirect to `/documents`.

## 2026-06-15 - Phase 1: Core Data And OS Shell

- Added the core Prisma schema and initial migration for User, Setting, Tag, Todo, Note, Diary, FileAsset, AIHistory, and generic entity association tables.
- Added User-backed password login, session cookies, route middleware, and the protected OS layout.
- Added Dashboard, Sidebar, Top Bar, Theme Provider, and Command Palette shell.
- Added placeholder shells for future Files, Diary, AI, and Settings work.

## 2026-06-15 - Phase 0: Project Foundation

- Initialized Samsara as a Next.js App Router project with TypeScript, Tailwind CSS, ESLint, Prisma, and PostgreSQL adapter support.
- Added the modular `src/app`, `src/components`, `src/features`, and `src/lib` structure.
- Added initial StorageProvider and AI type boundaries.
- Added architecture, data model, and AI roadmap docs.
