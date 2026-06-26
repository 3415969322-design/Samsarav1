import type { ExamAnswerPayload, ExamDifficulty, ExamQuestionType } from "@/features/exam/types";

export const questionTypeLabels: Record<ExamQuestionType, string> = {
  MULTIPLE_CHOICE: "选择题",
  SHORT_ANSWER: "简答题",
  TRUE_FALSE: "判断题",
};

export const difficultyLabels: Record<ExamDifficulty, string> = {
  EASY: "简单",
  HARD: "难",
  MEDIUM: "中等",
};

export function formatFileSize(size: bigint | number) {
  const value = typeof size === "bigint" ? Number(size) : size;

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function parseStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function parseQuestionOrder(value: unknown) {
  return parseStringArray(value);
}

export function parseAnswerPayload(value: unknown): ExamAnswerPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as ExamAnswerPayload;

  if (
    payload.type === "MULTIPLE_CHOICE" ||
    payload.type === "TRUE_FALSE" ||
    payload.type === "SHORT_ANSWER"
  ) {
    return payload;
  }

  return null;
}

export function renderCorrectAnswer(answer: ExamAnswerPayload | null) {
  if (!answer) {
    return "暂无答案";
  }

  if (answer.type === "MULTIPLE_CHOICE") {
    return answer.correctText;
  }

  if (answer.type === "TRUE_FALSE") {
    return answer.value ? "正确" : "错误";
  }

  return answer.text;
}

export function getErrorMessage(error?: string) {
  if (!error) {
    return "";
  }

  const messages: Record<string, string> = {
    "invalid-answer": "题目答案格式异常，请重新进入刷题。",
    "missing-answer": "请先作答再提交。",
    "missing-file": "请上传 PDF、DOCX 或 TXT 文件。",
    "no-questions": "当前范围还没有可练习题目。",
    "not-found": "没有找到对应题目或练习记录。",
  };

  return messages[error] ?? decodeURIComponent(error);
}
