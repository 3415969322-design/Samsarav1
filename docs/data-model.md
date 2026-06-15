# Samsara Data Model

Samsara v1.0 uses PostgreSQL through Prisma.

## Core Models

- `User`: single owner account and password hash
- `Setting`: user/system configuration records
- `Tag`: shared labels across modules
- `Todo`: task records
- `Note`: Markdown Documents
- `Diary`: Markdown journal entries
- `FileAsset`: file metadata
- `AIHistory`: durable AI interactions
- `TagOnEntity`: generic tag links
- `FileOnEntity`: generic attachment links

## Design Notes

- `TagOnEntity` allows Todo, Documents, Diary, and Files to share the same tagging layer.
- `FileOnEntity` allows Diary and future modules to attach files without duplicating file storage logic.
- `FileAsset.storageProvider` and `storageKey` separate metadata from object storage.
- `AIHistory.inputJson` and `outputJson` preserve flexible AI interaction records.
- `Diary.favorite` and `Diary.archived` support v1.0 journal workflows.
