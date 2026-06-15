import type { AIHistoryModel } from "@/generated/prisma/models/AIHistory";
import { prisma } from "@/lib/db/prisma";

export type AIConversationSummary = {
  conversationId: string;
  lastMessageAt: Date;
  messageCount: number;
  title: string;
};

export type PersistedAIChatMessage = {
  content: string;
  createdAt: Date;
  id: string;
  model?: string;
  role: "user" | "assistant";
  status: "COMPLETED" | "FAILED";
};

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "string" ? value : "";
}

function getConversationId(history: AIHistoryModel) {
  return getString(asRecord(history.inputJson), "conversationId");
}

function getUserMessage(history: AIHistoryModel) {
  return getString(asRecord(history.inputJson), "message");
}

function getAssistantMessage(history: AIHistoryModel) {
  const output = asRecord(history.outputJson);

  return getString(output, "content") || getString(output, "error");
}

export async function getAIChatHistory(userId: string) {
  return prisma.aIHistory.findMany({
    orderBy: { createdAt: "asc" },
    where: {
      intent: "CHAT",
      module: "AI",
      userId,
    },
  });
}

export function getConversationsFromHistory(history: AIHistoryModel[]) {
  const grouped = new Map<string, AIConversationSummary>();

  for (const item of history) {
    const conversationId = getConversationId(item);

    if (!conversationId) {
      continue;
    }

    const userMessage = getUserMessage(item);
    const existing = grouped.get(conversationId);

    grouped.set(conversationId, {
      conversationId,
      lastMessageAt: item.createdAt,
      messageCount: (existing?.messageCount ?? 0) + 2,
      title: existing?.title ?? (userMessage.slice(0, 60) || "New AI conversation"),
    });
  }

  return [...grouped.values()].sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime(),
  );
}

export function getMessagesForConversation(
  history: AIHistoryModel[],
  conversationId: string,
): PersistedAIChatMessage[] {
  return history
    .filter((item) => getConversationId(item) === conversationId)
    .flatMap((item) => {
      const userMessage = getUserMessage(item);
      const assistantMessage = getAssistantMessage(item);
      const messages: PersistedAIChatMessage[] = [];

      if (userMessage) {
        messages.push({
          content: userMessage,
          createdAt: item.createdAt,
          id: `${item.id}-user`,
          role: "user",
          status: item.status,
        });
      }

      if (assistantMessage) {
        messages.push({
          content: assistantMessage,
          createdAt: item.createdAt,
          id: `${item.id}-assistant`,
          model: item.model ?? undefined,
          role: "assistant",
          status: item.status,
        });
      }

      return messages;
    });
}

export function getHistoryIdsForConversation(
  history: AIHistoryModel[],
  conversationId: string,
) {
  return history
    .filter((item) => getConversationId(item) === conversationId)
    .map((item) => item.id);
}
