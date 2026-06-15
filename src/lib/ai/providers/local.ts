import type { AIChatRequest, AIChatResponse, AIProvider } from "@/lib/ai/types";

function latestUserMessage(request: AIChatRequest) {
  return [...request.messages].reverse().find((message) => message.role === "user");
}

export class LocalAIProvider implements AIProvider {
  readonly name = "local";

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const message = latestUserMessage(request)?.content.trim() ?? "";
    const contextCount = request.context?.length ?? 0;
    const content = [
      "### Local AI Response",
      "",
      message
        ? `I received your message:\n\n> ${message}`
        : "I did not receive a user message.",
      "",
      "This local provider keeps Samsara usable before a model API key is configured.",
      "",
      "- Conversation history is persisted in `AIHistory`.",
      "- Provider calls stay behind `lib/ai`.",
      `- Context slots available in this request: ${contextCount}.`,
      "",
      "```ts",
      "type NextStep = \"configure-provider\" | \"continue-chat\";",
      "```",
    ].join("\n");

    return {
      content,
      model: "samsara-local",
      provider: this.name,
    };
  }
}
