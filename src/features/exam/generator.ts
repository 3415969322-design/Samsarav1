import { z } from "zod";
import { aiService } from "@/lib/ai";
import { env } from "@/lib/config/env";
import type {
  ExamDifficulty,
  GeneratedExam,
  GeneratedKnowledgePoint,
  GeneratedQuestion,
} from "@/features/exam/types";
import { parseStructuredQuestionBank } from "@/features/exam/question-processing";

const aiExamSchema = z.object({
  knowledgePoints: z
    .array(
      z.object({
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
        summary: z.string().min(12),
        title: z.string().min(2),
      }),
    )
    .min(1)
    .max(12),
  questions: z
    .array(
      z.object({
        answer: z.union([
          z.object({
            correctIndex: z.number().int().min(0).max(3),
            correctText: z.string().min(1),
            type: z.literal("MULTIPLE_CHOICE"),
          }),
          z.object({
            correctIndices: z.array(z.number().int().min(0).max(7)).min(2),
            correctTexts: z.array(z.string().min(1)).min(2),
            type: z.literal("MULTIPLE_SELECT"),
          }),
          z.object({
            type: z.literal("TRUE_FALSE"),
            value: z.boolean(),
          }),
          z.object({
            keywords: z.array(z.string().min(1)).default([]),
            text: z.string().min(1),
            type: z.literal("SHORT_ANSWER"),
          }),
        ]),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
        explanation: z.string().min(1),
        knowledgePointIndex: z.number().int().min(0),
        options: z.array(z.string()).length(4).optional(),
        stem: z.string().min(6),
        type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
      }),
    )
    .min(1)
    .max(36),
});

function compact(value: string, maxLength: number) {
  const clean = value.replace(/\s+/g, " ").trim();

  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}...` : clean;
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[。！？.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 24);
}

function splitParagraphs(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item.length >= 80);

  if (paragraphs.length > 0) {
    return paragraphs;
  }

  const sentences = splitSentences(text);
  const chunks: string[] = [];

  for (let index = 0; index < sentences.length; index += 3) {
    chunks.push(sentences.slice(index, index + 3).join(" "));
  }

  return chunks.filter((item) => item.length >= 80);
}

function extractTitle(paragraph: string, fallback: string) {
  const heading = paragraph
    .split(/[:：。.!?\n]/)
    .map((item) => item.trim())
    .find((item) => item.length >= 3 && item.length <= 36);

  if (heading) {
    return heading;
  }

  const keywords = paragraph
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}\s]/gu, " ")
    .split(/\s+/)
    .filter((item) => item.length >= 2)
    .slice(0, 6)
    .join(" ");

  return keywords || fallback;
}

function getDifficulty(index: number): ExamDifficulty {
  if (index % 3 === 0) {
    return "EASY";
  }

  if (index % 3 === 1) {
    return "MEDIUM";
  }

  return "HARD";
}

function extractKeywords(text: string) {
  const words = text
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
  const unique = Array.from(new Set(words));

  return unique.slice(0, 8);
}

function buildFallbackExam(text: string): GeneratedExam {
  const sourceParagraphs = splitParagraphs(text)
    .sort((a, b) => b.length - a.length)
    .slice(0, 12);
  const paragraphs =
    sourceParagraphs.length > 0 ? sourceParagraphs : [compact(text, 700)];
  const knowledgePoints: GeneratedKnowledgePoint[] = paragraphs.map(
    (paragraph, index) => ({
      difficulty: getDifficulty(index),
      orderIndex: index,
      summary: compact(paragraph, 260),
      title: extractTitle(paragraph, `知识点 ${index + 1}`),
    }),
  );
  const questions: GeneratedQuestion[] = [];

  knowledgePoints.forEach((point, index) => {
    const otherSummaries = knowledgePoints
      .filter((_, otherIndex) => otherIndex !== index)
      .map((item) => compact(item.summary, 90));
    const fallbackOptions = [
      compact(point.summary, 90),
      ...otherSummaries,
      `与「${point.title}」无直接关系的背景信息`,
      `只涉及「${point.title}」的次要表述`,
    ];
    const options = Array.from(new Set(fallbackOptions)).slice(0, 4);

    while (options.length < 4) {
      options.push(`选项 ${options.length + 1}：资料未支持该说法`);
    }

    questions.push({
      answer: {
        correctIndex: 0,
        correctText: options[0],
        type: "MULTIPLE_CHOICE",
      },
      difficulty: point.difficulty,
      explanation: `答案来自资料中的知识点「${point.title}」：${point.summary}`,
      knowledgePointIndex: index,
      options,
      stem: `以下哪一项最能概括「${point.title}」？`,
      type: "MULTIPLE_CHOICE",
    });

    questions.push({
      answer: {
        type: "TRUE_FALSE",
        value: true,
      },
      difficulty: point.difficulty,
      explanation: `该判断来自原始资料：${point.summary}`,
      knowledgePointIndex: index,
      stem: `判断：${compact(point.summary, 120)}`,
      type: "TRUE_FALSE",
    });

    questions.push({
      answer: {
        keywords: extractKeywords(point.summary),
        text: point.summary,
        type: "SHORT_ANSWER",
      },
      difficulty: point.difficulty,
      explanation: `作答应覆盖「${point.title}」的核心含义。`,
      knowledgePointIndex: index,
      stem: `请简要说明「${point.title}」的核心内容。`,
      type: "SHORT_ANSWER",
    });
  });

  return {
    knowledgePoints,
    questions,
  };
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not include JSON.");
  }

  return JSON.parse(text.slice(start, end + 1)) as unknown;
}

async function buildAIExam(text: string): Promise<GeneratedExam | null> {
  if (env.AI_PROVIDER !== "openai-compatible" || !env.AI_API_KEY) {
    return null;
  }

  try {
    const response = await aiService.chat({
      messages: [
        {
          content: [
            "你是期末复习出题助手。请只输出 JSON，不要 Markdown。",
            "从资料中提取最多 12 个知识点，并生成单选题、多选题、判断题、简答题。",
            "如果资料本身是题库，必须保留原题的题型、选项和正确答案，不得把多选题转成简答题。",
            "JSON schema: { knowledgePoints: [{ title, summary, difficulty }], questions: [{ type, difficulty, stem, options?, answer, explanation, knowledgePointIndex }] }。",
            "单选题 type 为 MULTIPLE_CHOICE，options 必须 4 项，answer 为 { type:'MULTIPLE_CHOICE', correctIndex, correctText }。",
            "多选题 type 仍为 MULTIPLE_CHOICE，options 必须 4 项，answer 为 { type:'MULTIPLE_SELECT', correctIndices, correctTexts }。",
            "判断题 answer 为 { type:'TRUE_FALSE', value }。",
            "简答题 answer 为 { type:'SHORT_ANSWER', text, keywords }。",
            `资料：\n${text.slice(0, 12000)}`,
          ].join("\n\n"),
          role: "user",
        },
      ],
    });
    const parsed = aiExamSchema.parse(extractJsonObject(response.content));

    return {
      knowledgePoints: parsed.knowledgePoints.map((point, index) => ({
        ...point,
        orderIndex: index,
      })),
      questions: parsed.questions.map((question) => ({
        ...question,
        knowledgePointIndex: Math.min(
          question.knowledgePointIndex,
          parsed.knowledgePoints.length - 1,
        ),
      })),
    };
  } catch {
    return null;
  }
}

export async function generateExamFromText(text: string): Promise<GeneratedExam> {
  return parseStructuredQuestionBank(text) ?? (await buildAIExam(text)) ?? buildFallbackExam(text);
}
