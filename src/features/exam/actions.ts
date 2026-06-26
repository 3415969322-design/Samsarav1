"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  examPracticeModes,
  type ExamAnswerPayload,
  type ExamPracticeMode,
} from "@/features/exam/types";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getExamFile(formData: FormData) {
  const file = formData.get("file");

  return file instanceof File && file.size > 0 ? file : null;
}

function normalizeMode(value: FormDataEntryValue | null): ExamPracticeMode {
  const mode = String(value ?? "SEQUENTIAL") as ExamPracticeMode;

  return examPracticeModes.includes(mode) ? mode : "SEQUENTIAL";
}

function shuffle<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

function normalizeTextAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseAnswerPayload(value: unknown): ExamAnswerPayload | null {
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

function evaluateAnswer({
  correctAnswer,
  options,
  rawAnswer,
}: {
  correctAnswer: ExamAnswerPayload;
  options: string[];
  rawAnswer: string;
}) {
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
      answerJson: {
        type: "TRUE_FALSE",
        value,
      },
      isCorrect: value === correctAnswer.value,
    };
  }

  const answerText = normalizeTextAnswer(rawAnswer);
  const expectedText = normalizeTextAnswer(correctAnswer.text);
  const keywords = correctAnswer.keywords
    .map((keyword) => normalizeTextAnswer(keyword))
    .filter(Boolean);
  const matchedKeywords = keywords.filter((keyword) => answerText.includes(keyword));
  const isCorrect =
    answerText.length >= 6 &&
    (matchedKeywords.length >= Math.min(2, Math.max(1, keywords.length)) ||
      expectedText.includes(answerText));

  return {
    answerJson: {
      text: rawAnswer,
      type: "SHORT_ANSWER",
    },
    isCorrect,
  };
}

export async function uploadExamSourceAction(formData: FormData) {
  const session = await requireSession();
  const file = getExamFile(formData);

  if (!file) {
    redirect("/exam-upload?error=missing-file");
  }

  let sourceId = "";

  try {
    const [{ createContentHash, parseExamFile }, { generateExamFromText }] =
      await Promise.all([
        import("@/features/exam/parsers"),
        import("@/features/exam/generator"),
      ]);
    const parsedFile = await parseExamFile(file);
    const generatedExam = await generateExamFromText(parsedFile.contentText);
    const title =
      formString(formData, "title") ||
      parsedFile.filename.replace(/\.(pdf|docx|txt)$/i, "");

    sourceId = await prisma.$transaction(async (transaction) => {
      const source = await transaction.examSource.create({
        data: {
          contentHash: createContentHash(parsedFile.contentText),
          contentText: parsedFile.contentText,
          filename: parsedFile.filename,
          mimeType: parsedFile.mimeType,
          size: BigInt(parsedFile.size),
          status: "READY",
          title,
          userId: session.userId,
        },
      });
      const knowledgePoints: { id: string }[] = [];

      for (const point of generatedExam.knowledgePoints) {
        knowledgePoints.push(
          await transaction.examKnowledgePoint.create({
            data: {
              difficulty: point.difficulty,
              orderIndex: point.orderIndex,
              sourceId: source.id,
              summary: point.summary,
              title: point.title,
              userId: session.userId,
            },
          }),
        );
      }

      await transaction.examQuestion.createMany({
        data: generatedExam.questions.map((question) => {
          const knowledgePoint =
            knowledgePoints[question.knowledgePointIndex] ?? knowledgePoints[0];

          return {
            answerJson: question.answer,
            difficulty: question.difficulty,
            explanation: question.explanation,
            knowledgePointId: knowledgePoint?.id ?? null,
            optionsJson: question.options,
            sourceId: source.id,
            stem: question.stem,
            type: question.type,
            userId: session.userId,
          };
        }),
      });

      return source.id;
    });
  } catch (error) {
    const message = encodeURIComponent(
      error instanceof Error ? error.message : "资料解析失败。",
    );

    redirect(`/exam-upload?error=${message}`);
  }

  revalidatePath("/exam-upload");
  revalidatePath("/exam-bank");
  redirect(`/exam-bank?source=${sourceId}`);
}

export async function startExamPracticeAction(formData: FormData) {
  const session = await requireSession();
  const mode = normalizeMode(formData.get("mode"));
  const sourceId = formString(formData, "sourceId");
  let questionIds: string[] = [];

  if (mode === "WRONG_ONLY") {
    const wrongRecords = await prisma.examWrongRecord.findMany({
      include: {
        question: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        lastWrongAt: "desc",
      },
      where: {
        userId: session.userId,
        ...(sourceId ? { sourceId } : {}),
      },
    });

    questionIds = wrongRecords.map((record) => record.question.id);
  } else {
    const questions = await prisma.examQuestion.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
      where: {
        userId: session.userId,
        ...(sourceId ? { sourceId } : {}),
      },
    });

    questionIds = questions.map((question) => question.id);
  }

  if (mode === "RANDOM" || mode === "WRONG_ONLY") {
    questionIds = shuffle(questionIds);
  }

  if (questionIds.length === 0) {
    redirect("/exam-practice?error=no-questions");
  }

  const sessionRecord = await prisma.examPracticeSession.create({
    data: {
      mode,
      questionOrderJson: questionIds,
      sourceId: sourceId || null,
      total: questionIds.length,
      userId: session.userId,
    },
  });

  redirect(`/exam-practice?session=${sessionRecord.id}&index=0`);
}

export async function submitExamAnswerAction(formData: FormData) {
  const session = await requireSession();
  const sessionId = formString(formData, "sessionId");
  const questionId = formString(formData, "questionId");
  const rawAnswer = formString(formData, "answer");
  const index = Number(formString(formData, "index") || "0");

  if (!sessionId || !questionId || !rawAnswer) {
    redirect(`/exam-practice?session=${sessionId}&index=${index}&error=missing-answer`);
  }

  const [practiceSession, question] = await Promise.all([
    prisma.examPracticeSession.findFirst({
      where: {
        id: sessionId,
        userId: session.userId,
      },
    }),
    prisma.examQuestion.findFirst({
      where: {
        id: questionId,
        userId: session.userId,
      },
    }),
  ]);

  if (!practiceSession || !question) {
    redirect("/exam-practice?error=not-found");
  }

  const correctAnswer = parseAnswerPayload(question.answerJson);
  const options = Array.isArray(question.optionsJson)
    ? question.optionsJson.filter((option): option is string => typeof option === "string")
    : [];

  if (!correctAnswer) {
    redirect(`/exam-practice?session=${sessionId}&index=${index}&error=invalid-answer`);
  }

  const result = evaluateAnswer({
    correctAnswer,
    options,
    rawAnswer,
  });

  await prisma.examAnswer.upsert({
    create: {
      answerJson: result.answerJson,
      isCorrect: result.isCorrect,
      knowledgePointId: question.knowledgePointId,
      questionId: question.id,
      sessionId: practiceSession.id,
      sourceId: question.sourceId,
      userId: session.userId,
    },
    update: {
      answerJson: result.answerJson,
      isCorrect: result.isCorrect,
    },
    where: {
      sessionId_questionId: {
        questionId: question.id,
        sessionId: practiceSession.id,
      },
    },
  });

  if (!result.isCorrect) {
    await prisma.examWrongRecord.upsert({
      create: {
        knowledgePointId: question.knowledgePointId,
        lastAnswerJson: result.answerJson,
        questionId: question.id,
        sourceId: question.sourceId,
        userId: session.userId,
      },
      update: {
        knowledgePointId: question.knowledgePointId,
        lastAnswerJson: result.answerJson,
        lastWrongAt: new Date(),
        sourceId: question.sourceId,
        wrongCount: {
          increment: 1,
        },
      },
      where: {
        userId_questionId: {
          questionId: question.id,
          userId: session.userId,
        },
      },
    });
  }

  const [answered, correct] = await Promise.all([
    prisma.examAnswer.count({
      where: {
        sessionId: practiceSession.id,
        userId: session.userId,
      },
    }),
    prisma.examAnswer.count({
      where: {
        isCorrect: true,
        sessionId: practiceSession.id,
        userId: session.userId,
      },
    }),
  ]);

  await prisma.examPracticeSession.update({
    data: {
      correct,
      score: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    },
    where: {
      id: practiceSession.id,
      userId: session.userId,
    },
  });

  revalidatePath("/exam-practice");
  revalidatePath("/exam-wrongbook");
  redirect(`/exam-practice?session=${sessionId}&index=${index}&review=1`);
}
