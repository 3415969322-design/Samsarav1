import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { T } from "@/components/i18n/text";
import { TranslatedTextarea } from "@/components/i18n/translated-controls";
import {
  createAIConversationAction,
  deleteAIConversationAction,
  sendAIChatMessageAction,
} from "@/features/ai/actions";
import {
  getAIChatHistory,
  getConversationsFromHistory,
  getMessagesForConversation,
} from "@/features/ai/history";
import { MarkdownMessage } from "@/features/ai/markdown-message";
import { promptLibrary } from "@/lib/ai";
import { requireSession } from "@/lib/auth/server";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const workbenchCards = [
  {
    descriptionKey: "ai.generalChatText",
    statusKey: "common.active",
    titleKey: "ai.chat",
  },
  {
    descriptionKey: "ai.dailySummaryText",
    statusKey: "common.reserved",
    titleKey: "ai.dailySummary",
  },
  {
    descriptionKey: "ai.studyAssistantText",
    statusKey: "common.reserved",
    titleKey: "ai.studyAssistant",
  },
  {
    descriptionKey: "ai.fileAssistantText",
    statusKey: "common.reserved",
    titleKey: "ai.fileAssistant",
  },
  {
    descriptionKey: "ai.todoPlannerText",
    statusKey: "common.reserved",
    titleKey: "ai.todoPlanner",
  },
  {
    descriptionKey: "ai.promptLibraryText",
    statusKey: "common.reserved",
    titleKey: "ai.promptLibrary",
  },
] as const satisfies readonly {
  descriptionKey: TranslationKey;
  statusKey: TranslationKey;
  titleKey: TranslationKey;
}[];

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AiPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversation?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const history = await getAIChatHistory(session.userId);
  const conversations = getConversationsFromHistory(history);
  const selectedConversationId =
    params?.conversation ?? conversations[0]?.conversationId ?? "";
  const messages = selectedConversationId
    ? getMessagesForConversation(history, selectedConversationId)
    : [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-panel p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              <T k="ai.title" />
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              <T k="ai.description" />
            </p>
          </div>
          <form action={createAIConversationAction}>
            <Button type="submit" variant="primary">
              <T k="ai.newChat" />
            </Button>
          </form>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workbenchCards.map((card) => (
          <article
            className="rounded-lg border border-line bg-panel p-4"
            key={card.titleKey}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">
                <T k={card.titleKey} />
              </h2>
              <Badge>
                <T k={card.statusKey} />
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              <T k={card.descriptionKey} />
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <aside className="space-y-3 rounded-lg border border-line bg-panel p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              <T k="ai.conversations" />
            </h2>
            <span className="text-xs text-muted">{conversations.length}</span>
          </div>
          {conversations.length === 0 ? (
            <p className="text-sm text-muted">
              <T k="ai.startChat" />
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const active =
                  conversation.conversationId === selectedConversationId;

                return (
                  <a
                    className={`block rounded-md border p-3 text-sm transition-colors ${
                      active
                        ? "border-accent bg-background text-foreground"
                        : "border-line text-muted hover:bg-background hover:text-foreground"
                    }`}
                    href={`/ai?conversation=${conversation.conversationId}`}
                    key={conversation.conversationId}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium">{conversation.title}</span>
                      <span className="text-xs">{conversation.messageCount}</span>
                    </div>
                    <p className="mt-1 text-xs">
                      {formatTime(conversation.lastMessageAt)}
                    </p>
                  </a>
                );
              })}
            </div>
          )}

          {selectedConversationId ? (
            <form action={deleteAIConversationAction} className="border-t border-line pt-3">
              <input
                name="conversationId"
                type="hidden"
                value={selectedConversationId}
              />
              <Button className="w-full" type="submit" variant="ghost">
                <T k="ai.deleteCurrent" />
              </Button>
            </form>
          ) : null}
        </aside>

        <div className="rounded-lg border border-line bg-panel p-4">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <h2 className="font-semibold">
                <T k="ai.chat" />
              </h2>
              <p className="mt-1 text-xs text-muted">
                <T k="ai.historyNote" />
              </p>
            </div>
            <Badge>
              <T k="common.markdown" />
            </Badge>
          </div>

          <div className="mt-4 min-h-[24rem] space-y-4">
            {messages.length === 0 ? (
              <div className="rounded-md border border-line bg-background p-6 text-sm text-muted">
                <T k="ai.chat.empty" />
              </div>
            ) : (
              messages.map((message) => (
                <article
                  className={`rounded-lg border p-4 ${
                    message.role === "user"
                      ? "border-accent/40 bg-background"
                      : "border-line bg-panel"
                  }`}
                  key={message.id}
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted">
                    <span>
                      {message.role === "user" ? <T k="ai.you" /> : "Samsara AI"}
                    </span>
                    <span>
                      {message.status === "FAILED" ? "Failed · " : ""}
                      {message.model ? `${message.model} · ` : ""}
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  {message.role === "assistant" ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>

          <form action={sendAIChatMessageAction} className="mt-4 space-y-3">
            <input
              name="conversationId"
              type="hidden"
              value={selectedConversationId}
            />
            <TranslatedTextarea
              className="min-h-32 w-full resize-y rounded-md border border-line bg-background px-4 py-3 text-sm leading-6 outline-none ring-accent/20 focus:ring-4"
              name="message"
              placeholderKey="ai.chat.placeholder"
              required
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                <T k="common.send" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">
            <T k="ai.promptLibrary" />
          </h2>
          <Badge>
            <T k="common.reserved" />
          </Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Object.values(promptLibrary).map((prompt) => (
            <article
              className="rounded-md border border-line bg-background p-3"
              key={prompt.id}
            >
              <h3 className="text-sm font-medium">{prompt.title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted">
                {prompt.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
