import type { AIContextItem, AIContextSource } from "@/lib/ai/types";

export type AIContextRequest = {
  entityIds?: string[];
  limit?: number;
  query?: string;
  source: AIContextSource;
  userId: string;
};

export interface AIContextProvider {
  readonly source: AIContextSource;
  getContext(request: AIContextRequest): Promise<AIContextItem[]>;
}

export class EmptyContextProvider implements AIContextProvider {
  constructor(readonly source: AIContextSource) {}

  async getContext() {
    return [];
  }
}

export const aiContextProviders: Record<AIContextSource, AIContextProvider> = {
  diary: new EmptyContextProvider("diary"),
  document: new EmptyContextProvider("document"),
  file: new EmptyContextProvider("file"),
  system: new EmptyContextProvider("system"),
  todo: new EmptyContextProvider("todo"),
};

export async function collectAIContext(requests: AIContextRequest[]) {
  const contextGroups = await Promise.all(
    requests.map((request) => aiContextProviders[request.source].getContext(request)),
  );

  return contextGroups.flat();
}
