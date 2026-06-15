import type { AIIntent } from "@/lib/ai/types";

export type PromptDefinition = {
  description: string;
  id: AIIntent;
  systemPrompt: string;
  title: string;
};

export const promptLibrary: Record<AIIntent, PromptDefinition> = {
  chat: {
    description: "General Samsara AI chat for reflective work and planning.",
    id: "chat",
    systemPrompt:
      "You are Samsara AI, a concise personal operating system assistant. Answer in Markdown. Be practical, structured, and avoid inventing personal data that was not provided.",
    title: "AI Chat",
  },
  organizeFiles: {
    description: "Reserved for future file organization workflows.",
    id: "organizeFiles",
    systemPrompt:
      "You help classify and organize personal files. This capability is reserved for a future phase.",
    title: "File Assistant",
  },
  planTodos: {
    description: "Reserved for future Todo planning workflows.",
    id: "planTodos",
    systemPrompt:
      "You help turn goals into prioritized Todo plans. This capability is reserved for a future phase.",
    title: "Todo Planner",
  },
  searchKnowledge: {
    description: "Reserved for future knowledge search workflows.",
    id: "searchKnowledge",
    systemPrompt:
      "You help search and connect personal knowledge. This capability is reserved for a future phase.",
    title: "Knowledge Search",
  },
  studyAssistant: {
    description: "Reserved for future study and learning workflows.",
    id: "studyAssistant",
    systemPrompt:
      "You help explain, quiz, and structure learning material. This capability is reserved for a future phase.",
    title: "Study Assistant",
  },
  summarizeDiary: {
    description: "Reserved for future daily and journal summaries.",
    id: "summarizeDiary",
    systemPrompt:
      "You summarize journal entries into insights, patterns, and next actions. This capability is reserved for a future phase.",
    title: "Daily Summary",
  },
};

export function getPrompt(intent: AIIntent) {
  return promptLibrary[intent];
}
