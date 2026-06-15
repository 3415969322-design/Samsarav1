import type { AIChatRequest, AIChatResponse, AIProvider } from "@/lib/ai/types";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  model?: string;
  usage?: {
    completion_tokens?: number;
    prompt_tokens?: number;
  };
};

export class OpenAICompatibleProvider implements AIProvider {
  readonly name = "openai-compatible";

  constructor(
    private readonly options: {
      apiKey: string;
      baseUrl: string;
      model: string;
    },
  ) {}

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const response = await fetch(`${this.options.baseUrl}/chat/completions`, {
      body: JSON.stringify({
        messages: request.messages,
        model: request.model ?? this.options.model,
        temperature: request.temperature ?? 0.4,
      }),
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`AI provider request failed with ${response.status}.`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI provider returned an empty message.");
    }

    return {
      content,
      model: data.model ?? request.model ?? this.options.model,
      provider: this.name,
      usage: {
        inputTokens: data.usage?.prompt_tokens,
        outputTokens: data.usage?.completion_tokens,
      },
    };
  }
}
