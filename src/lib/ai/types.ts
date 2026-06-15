export type AIIntent =
  | "chat"
  | "summarizeDiary"
  | "planTodos"
  | "organizeFiles"
  | "studyAssistant"
  | "searchKnowledge";

export type AIModule =
  | "dashboard"
  | "todos"
  | "notes"
  | "diary"
  | "files"
  | "ai";

export type AIContextSource = "diary" | "todo" | "document" | "file" | "system";

export type AIContextItem = {
  id: string;
  source: AIContextSource;
  title: string;
  content: string;
  metadata?: Record<string, string>;
};

export type AIRequestContext = {
  userId: string;
  module: AIModule;
  intent: AIIntent;
  input: Record<string, unknown>;
  contextItems?: AIContextItem[];
  relatedEntity?: {
    type: "todo" | "note" | "diary" | "file";
    id: string;
  };
};

export type AIChatRole = "system" | "user" | "assistant";

export type AIChatMessage = {
  content: string;
  role: AIChatRole;
};

export type AIChatRequest = {
  context?: AIContextItem[];
  messages: AIChatMessage[];
  model?: string;
  temperature?: number;
};

export type AIChatResponse = {
  content: string;
  model: string;
  provider: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

export type AIResponseEnvelope = {
  output: Record<string, unknown>;
  model?: string;
  status: "completed" | "failed";
};

export interface AIProvider {
  readonly name: string;
  chat(request: AIChatRequest): Promise<AIChatResponse>;
}
