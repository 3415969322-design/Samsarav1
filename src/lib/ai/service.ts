import { env } from "@/lib/config/env";
import { getPrompt } from "@/lib/ai/prompts";
import { LocalAIProvider } from "@/lib/ai/providers/local";
import { OpenAICompatibleProvider } from "@/lib/ai/providers/openai-compatible";
import type {
  AIChatMessage,
  AIChatRequest,
  AIChatResponse,
  AIContextItem,
  AIProvider,
} from "@/lib/ai/types";

function createAIProvider(): AIProvider {
  if (env.AI_PROVIDER === "openai-compatible" && env.AI_API_KEY) {
    return new OpenAICompatibleProvider({
      apiKey: env.AI_API_KEY,
      baseUrl: env.AI_BASE_URL,
      model: env.AI_MODEL,
    });
  }

  return new LocalAIProvider();
}

export class AIService {
  constructor(private readonly provider: AIProvider) {}

  async chat({
    context = [],
    messages,
  }: {
    context?: AIContextItem[];
    messages: AIChatMessage[];
  }): Promise<AIChatResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    const request: AIChatRequest = {
      context,
      messages: [
        {
          content: systemPrompt,
          role: "system",
        },
        ...messages,
      ],
      model: env.AI_MODEL,
    };

    return this.provider.chat(request);
  }

  private buildSystemPrompt(context: AIContextItem[]) {
    const prompt = getPrompt("chat").systemPrompt;

    if (context.length === 0) {
      return prompt;
    }

    const contextText = context
      .map((item) => `Source: ${item.source}\nTitle: ${item.title}\n${item.content}`)
      .join("\n\n---\n\n");

    return `${prompt}\n\nUse this optional context only when relevant:\n\n${contextText}`;
  }
}

export const aiService = new AIService(createAIProvider());
