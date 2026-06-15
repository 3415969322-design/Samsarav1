"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAIChatHistory,
  getHistoryIdsForConversation,
  getMessagesForConversation,
} from "@/features/ai/history";
import { requireSession } from "@/lib/auth/server";
import { aiService } from "@/lib/ai";
import { prisma } from "@/lib/db/prisma";
import type { AIChatMessage } from "@/lib/ai/types";

function normalizeConversationId(value: FormDataEntryValue | null) {
  const conversationId = String(value ?? "").trim();

  return conversationId || randomUUID();
}

export async function createAIConversationAction() {
  redirect(`/ai?conversation=${randomUUID()}`);
}

export async function sendAIChatMessageAction(formData: FormData) {
  const session = await requireSession();
  const message = String(formData.get("message") ?? "").trim();
  const conversationId = normalizeConversationId(formData.get("conversationId"));

  if (!message) {
    redirect(`/ai?conversation=${conversationId}`);
  }

  const history = await getAIChatHistory(session.userId);
  const previousMessages = getMessagesForConversation(history, conversationId).map(
    (item): AIChatMessage => ({
      content: item.content,
      role: item.role,
    }),
  );

  try {
    const response = await aiService.chat({
      messages: [
        ...previousMessages,
        {
          content: message,
          role: "user",
        },
      ],
    });

    await prisma.aIHistory.create({
      data: {
        inputJson: {
          conversationId,
          message,
        },
        intent: "CHAT",
        model: response.model,
        module: "AI",
        outputJson: {
          content: response.content,
          conversationId,
          provider: response.provider,
          usage: response.usage ?? {},
        },
        status: "COMPLETED",
        userId: session.userId,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "AI provider request failed.";

    await prisma.aIHistory.create({
      data: {
        inputJson: {
          conversationId,
          message,
        },
        intent: "CHAT",
        module: "AI",
        outputJson: {
          content:
            "AI request failed. Check the provider configuration and try again.",
          conversationId,
          error: errorMessage,
        },
        status: "FAILED",
        userId: session.userId,
      },
    });
  }

  revalidatePath("/ai");
  redirect(`/ai?conversation=${conversationId}`);
}

export async function deleteAIConversationAction(formData: FormData) {
  const session = await requireSession();
  const conversationId = String(formData.get("conversationId") ?? "").trim();

  if (!conversationId) {
    return;
  }

  const history = await getAIChatHistory(session.userId);
  const ids = getHistoryIdsForConversation(history, conversationId);

  if (ids.length > 0) {
    await prisma.aIHistory.deleteMany({
      where: {
        id: { in: ids },
        userId: session.userId,
      },
    });
  }

  revalidatePath("/ai");
  redirect("/ai");
}
