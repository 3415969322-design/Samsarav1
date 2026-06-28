import type {
  ExamAnswerPayload,
  GeneratedExam,
  GeneratedKnowledgePoint,
  GeneratedQuestion,
} from "@/features/exam/types";

type StoredQuestion = {
  answerJson: unknown;
  optionsJson: unknown;
  stem: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
};

export type EffectiveQuestionKind =
  | "SINGLE_CHOICE"
  | "MULTIPLE_SELECT"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";

const optionLinePattern = /^\s*([A-H])\s*[.\uff0e\u3001)\uff09]\s*(.*?)\s*$/;
const questionMarkerPattern = /(?:^|\n)\s*(\d{1,4})\s*[.\uff0e\u3001]\s*[\uff08(](\u5355\u9009\u9898|\u591a\u9009\u9898|\u5224\u65ad\u9898|\u7b80\u7b54\u9898)[\uff09)]\s*/g;

function parseStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function cleanImportedLine(line: string) {
  const value = line
    .replace(/[\ue000-\uf8ff]/g, "")
    .replace(/\s+(?:\d{1,3}\s+){2,}\d{1,3}\s*$/, "")
    .trim();

  if (
    !value ||
    /^(?:\d{1,3}\s+){2,}\d{1,3}$/.test(value) ||
    /^https?:\/\//i.test(value) ||
    /^\u4f5c\u4e1a\u8be6\u60c5\s+\d{4}[/-]/.test(value) ||
    /^\u7b2c\s*\d+\s*\/\s*\d+\s*\u9875$/.test(value) ||
    /^\u6211\u7684\u7b54\u6848\s*[:\uff1a]/.test(value)
  ) {
    return "";
  }

  return value;
}

function compactImportedText(value: string) {
  return value
    .split("\n")
    .map(cleanImportedLine)
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAnswerLetters(value: string) {
  const compact = value.toUpperCase().replace(/[^A-H]/g, "");

  if (!compact || !/^[A-H]+$/.test(compact)) {
    return [];
  }

  return Array.from(new Set(compact.split("")));
}

export function extractOptionsFromStem(stem: string) {
  const lines = stem.replace(/\r/g, "").split("\n");
  const stemLines: string[] = [];
  const optionEntries: { letter: string; text: string }[] = [];
  let currentOption: { letter: string; text: string } | null = null;

  for (const rawLine of lines) {
    const line = cleanImportedLine(rawLine);

    if (!line) {
      continue;
    }

    const optionMatch = line.match(optionLinePattern);

    if (optionMatch) {
      if (currentOption) {
        optionEntries.push(currentOption);
      }

      currentOption = {
        letter: optionMatch[1],
        text: optionMatch[2].trim(),
      };
      continue;
    }

    if (currentOption) {
      currentOption.text = `${currentOption.text} ${line}`.trim();
    } else {
      stemLines.push(line);
    }
  }

  if (currentOption) {
    optionEntries.push(currentOption);
  }

  const sequentialOptions = optionEntries.filter(
    (entry, index) => entry.letter.charCodeAt(0) === 65 + index,
  );

  if (sequentialOptions.length < 2) {
    return {
      options: [] as string[],
      stem: compactImportedText(stem),
    };
  }

  return {
    options: sequentialOptions.map((entry) => entry.text),
    stem: compactImportedText(stemLines.join("\n")),
  };
}

export function parseAnswerPayload(value: unknown): ExamAnswerPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as ExamAnswerPayload;

  if (
    payload.type === "MULTIPLE_CHOICE" ||
    payload.type === "MULTIPLE_SELECT" ||
    payload.type === "TRUE_FALSE" ||
    payload.type === "SHORT_ANSWER"
  ) {
    return payload;
  }

  return null;
}

export function normalizeStoredQuestion(question: StoredQuestion) {
  const storedAnswer = parseAnswerPayload(question.answerJson);
  const storedOptions = parseStringArray(question.optionsJson);
  const extracted = extractOptionsFromStem(question.stem);
  const options = storedOptions.length >= 2 ? storedOptions : extracted.options;
  const stem = storedOptions.length >= 2 ? question.stem : extracted.stem;

  if (storedAnswer?.type === "SHORT_ANSWER" && options.length >= 2) {
    const letters = normalizeAnswerLetters(storedAnswer.text);
    const indices = letters
      .map((letter) => letter.charCodeAt(0) - 65)
      .filter((index) => index >= 0 && index < options.length);

    if (indices.length > 1) {
      return {
        answer: {
          correctIndices: indices,
          correctTexts: indices.map((index) => options[index]),
          type: "MULTIPLE_SELECT" as const,
        },
        kind: "MULTIPLE_SELECT" as const,
        options,
        stem,
      };
    }

    if (indices.length === 1) {
      return {
        answer: {
          correctIndex: indices[0],
          correctText: options[indices[0]],
          type: "MULTIPLE_CHOICE" as const,
        },
        kind: "SINGLE_CHOICE" as const,
        options,
        stem,
      };
    }
  }

  const kind: EffectiveQuestionKind =
    storedAnswer?.type === "MULTIPLE_SELECT"
      ? "MULTIPLE_SELECT"
      : storedAnswer?.type === "MULTIPLE_CHOICE"
        ? "SINGLE_CHOICE"
        : storedAnswer?.type === "TRUE_FALSE"
          ? "TRUE_FALSE"
          : "SHORT_ANSWER";

  return {
    answer: storedAnswer,
    kind,
    options,
    stem,
  };
}

function getQuestionBlocks(text: string) {
  const matches = Array.from(text.replace(/\r/g, "").matchAll(questionMarkerPattern));

  return matches.map((match, index) => ({
    body: text.slice(match.index! + match[0].length, matches[index + 1]?.index ?? text.length),
    number: Number(match[1]),
    type: match[2],
  }));
}

function findMarkedAnswer(body: string) {
  const answerMatch = body.match(/\u6b63\u786e\u7b54\u6848\s*[:\uff1a]\s*([^\n]+)/);

  return answerMatch?.[1]?.trim() ?? "";
}

function stripAnswerSection(body: string) {
  const markers = [body.search(/\ue902/), body.search(/\u6211\u7684\u7b54\u6848\s*[:\uff1a]/), body.search(/\u6b63\u786e\u7b54\u6848\s*[:\uff1a]/)]
    .filter((index) => index >= 0);
  const end = markers.length > 0 ? Math.min(...markers) : body.length;

  return body.slice(0, end).trim();
}

export function parseStructuredQuestionBank(text: string): GeneratedExam | null {
  const blocks = getQuestionBlocks(text);

  if (blocks.length === 0) {
    return null;
  }

  const categories = Array.from(new Set(blocks.map((block) => block.type)));
  const knowledgePoints: GeneratedKnowledgePoint[] = categories.map((category, index) => ({
    difficulty: "MEDIUM",
    orderIndex: index,
    summary: `\u4ece\u539f\u59cb\u8d44\u6599\u4e2d\u8bc6\u522b\u7684${category}\uff0c\u4fdd\u7559\u539f\u9898\u548c\u6807\u6ce8\u7b54\u6848\u3002`,
    title: category,
  }));
  const categoryIndex = new Map(categories.map((category, index) => [category, index]));
  const questions: GeneratedQuestion[] = [];

  for (const block of blocks) {
    const markedAnswer = findMarkedAnswer(block.body);
    const questionText = stripAnswerSection(block.body);
    const extracted = extractOptionsFromStem(questionText);
    const knowledgePointIndex = categoryIndex.get(block.type) ?? 0;

    if ((block.type === "\u5355\u9009\u9898" || block.type === "\u591a\u9009\u9898") && extracted.options.length >= 2) {
      const letters = normalizeAnswerLetters(markedAnswer);
      const indices = letters
        .map((letter) => letter.charCodeAt(0) - 65)
        .filter((index) => index >= 0 && index < extracted.options.length);

      if (indices.length === 0) {
        continue;
      }

      questions.push({
        answer:
          block.type === "\u591a\u9009\u9898" || indices.length > 1
            ? {
                correctIndices: indices,
                correctTexts: indices.map((index) => extracted.options[index]),
                type: "MULTIPLE_SELECT",
              }
            : {
                correctIndex: indices[0],
                correctText: extracted.options[indices[0]],
                type: "MULTIPLE_CHOICE",
              },
        difficulty: "MEDIUM",
        explanation: "\u6b63\u786e\u7b54\u6848\u6765\u81ea\u539f\u59cb\u8d44\u6599\u6807\u6ce8\u3002",
        knowledgePointIndex,
        options: extracted.options,
        stem: extracted.stem,
        type: "MULTIPLE_CHOICE",
      });
      continue;
    }

    if (block.type === "\u5224\u65ad\u9898") {
      const value = /^(\u6b63\u786e|\u5bf9|true|\u221a)$/i.test(markedAnswer);

      questions.push({
        answer: { type: "TRUE_FALSE", value },
        difficulty: "MEDIUM",
        explanation: "\u6b63\u786e\u7b54\u6848\u6765\u81ea\u539f\u59cb\u8d44\u6599\u6807\u6ce8\u3002",
        knowledgePointIndex,
        stem: compactImportedText(questionText),
        type: "TRUE_FALSE",
      });
      continue;
    }

    if (block.type === "\u7b80\u7b54\u9898" && markedAnswer) {
      questions.push({
        answer: {
          keywords: markedAnswer.split(/[\s\uff0c\u3001,;\uff1b]+/).filter(Boolean).slice(0, 8),
          text: markedAnswer,
          type: "SHORT_ANSWER",
        },
        difficulty: "MEDIUM",
        explanation: "\u6b63\u786e\u7b54\u6848\u6765\u81ea\u539f\u59cb\u8d44\u6599\u6807\u6ce8\u3002",
        knowledgePointIndex,
        stem: compactImportedText(questionText),
        type: "SHORT_ANSWER",
      });
    }
  }

  if (questions.length === 0) {
    return null;
  }

  return { knowledgePoints, questions };
}

function normalizeIndices(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0),
    ),
  ).sort((a, b) => a - b);
}

function normalizeTextAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function evaluateExamAnswer({
  correctAnswer,
  options,
  rawAnswers,
}: {
  correctAnswer: ExamAnswerPayload;
  options: string[];
  rawAnswers: string[];
}) {
  if (correctAnswer.type === "MULTIPLE_SELECT") {
    const selectedIndices = normalizeIndices(rawAnswers);
    const correctIndices = [...correctAnswer.correctIndices].sort((a, b) => a - b);

    return {
      answerJson: {
        selectedIndices,
        selectedTexts: selectedIndices.map((index) => options[index] ?? ""),
        type: "MULTIPLE_SELECT",
      },
      isCorrect:
        selectedIndices.length === correctIndices.length &&
        selectedIndices.every((value, index) => value === correctIndices[index]),
    };
  }

  const rawAnswer = rawAnswers[0] ?? "";

  if (correctAnswer.type === "MULTIPLE_CHOICE") {
    const selectedIndex = Number(rawAnswer);

    return {
      answerJson: {
        selectedIndex,
        selectedText: options[selectedIndex] ?? "",
        type: "MULTIPLE_CHOICE",
      },
      isCorrect: selectedIndex === correctAnswer.correctIndex,
    };
  }

  if (correctAnswer.type === "TRUE_FALSE") {
    const value = rawAnswer === "true";

    return {
      answerJson: { type: "TRUE_FALSE", value },
      isCorrect: value === correctAnswer.value,
    };
  }

  const answerText = normalizeTextAnswer(rawAnswer);
  const expectedText = normalizeTextAnswer(correctAnswer.text);
  const keywords = correctAnswer.keywords
    .map((keyword) => normalizeTextAnswer(keyword))
    .filter(Boolean);
  const matchedKeywords = keywords.filter((keyword) => answerText.includes(keyword));

  return {
    answerJson: { text: rawAnswer, type: "SHORT_ANSWER" },
    isCorrect:
      answerText.length >= 6 &&
      (matchedKeywords.length >= Math.min(2, Math.max(1, keywords.length)) ||
        expectedText.includes(answerText)),
  };
}
