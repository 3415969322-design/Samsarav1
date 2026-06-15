# Samsara AI Roadmap

AI is treated as a system capability, not a single chat page.

Planned AI intents:

- Chat
- Diary summarization
- Todo planning
- File organization
- Study assistant
- Knowledge search

Phase 5 establishes the runtime AI boundary:

- `src/lib/ai/service.ts` is the single entry point for model calls.
- `src/lib/ai/providers/*` contains provider implementations.
- `src/lib/ai/context.ts` defines context providers for Diary, Todo, Documents, Files, and system context. These return empty context in Phase 5.
- `src/lib/ai/prompts.ts` is the central prompt library.
- `src/features/ai/*` owns AI Workbench UI, chat actions, and AIHistory parsing.

The default provider is `local`, which returns a deterministic Markdown response so the UI remains usable without API keys. Set `AI_PROVIDER="openai-compatible"` and configure `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` to route chat through an external model provider.

Future phases can add real context providers and specialized assistants without calling model APIs directly from Todo, Diary, Documents, or Files.
