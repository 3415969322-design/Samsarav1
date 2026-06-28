import Link from "next/link";
import {
  difficultyLabels,
  effectiveQuestionTypeLabels,
  renderCorrectAnswer,
} from "@/features/exam/utils";
import { normalizeStoredQuestion } from "@/features/exam/question-processing";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CardContent, CardFooter, CardHeader, SectionCard } from "@/components/ui/section-card";

function getFilter(value: string | undefined) {
  return value?.trim() || "";
}

export default async function ExamBankPage({
  searchParams,
}: {
  searchParams?: Promise<{
    difficulty?: string;
    knowledgePoint?: string;
    q?: string;
    source?: string;
    type?: string;
  }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const sourceId = getFilter(params?.source);
  const knowledgePointId = getFilter(params?.knowledgePoint);
  const type = getFilter(params?.type);
  const difficulty = getFilter(params?.difficulty);
  const q = getFilter(params?.q);
  const [sources, knowledgePoints, questionRows] = await Promise.all([
    prisma.examSource.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
      },
      where: {
        userId: session.userId,
      },
    }),
    prisma.examKnowledgePoint.findMany({
      orderBy: {
        orderIndex: "asc",
      },
      select: {
        id: true,
        sourceId: true,
        title: true,
      },
      where: {
        userId: session.userId,
        ...(sourceId ? { sourceId } : {}),
      },
    }),
    prisma.examQuestion.findMany({
      include: {
        knowledgePoint: {
          select: {
            title: true,
          },
        },
        source: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId: session.userId,
        ...(sourceId ? { sourceId } : {}),
        ...(knowledgePointId ? { knowledgePointId } : {}),
        ...(difficulty ? { difficulty: difficulty as never } : {}),
        ...(q
          ? {
              OR: [
                { stem: { contains: q, mode: "insensitive" as const } },
                { explanation: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    }),
  ]);
  const questions = questionRows.filter((question) => {
    if (!type) {
      return true;
    }

    return normalizeStoredQuestion(question).kind === type;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        actions={
          <Link className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground" href="/exam-practice">
            开始刷题
          </Link>
        }
        badge={<Badge>{questions.length} 题</Badge>}
        descriptionKey="exam.bankDescription"
        eyebrow="Exam Review"
        titleKey="exam.bankTitle"
      />

      <SectionCard>
        <form className="grid gap-3 lg:grid-cols-[1fr_12rem_10rem_10rem_12rem_auto]">
          <input
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue={q}
            name="q"
            placeholder="搜索题干或解析"
          />
          <select
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue={sourceId}
            name="source"
          >
            <option value="">全部资料</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.title}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue={type}
            name="type"
          >
            <option value="">全部题型</option>
            <option value="SINGLE_CHOICE">单选题</option>
            <option value="MULTIPLE_SELECT">多选题</option>
            <option value="TRUE_FALSE">判断题</option>
            <option value="SHORT_ANSWER">简答题</option>
          </select>
          <select
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue={difficulty}
            name="difficulty"
          >
            <option value="">全部难度</option>
            <option value="EASY">简单</option>
            <option value="MEDIUM">中等</option>
            <option value="HARD">难</option>
          </select>
          <select
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue={knowledgePointId}
            name="knowledgePoint"
          >
            <option value="">全部知识点</option>
            {knowledgePoints.map((point) => (
              <option key={point.id} value={point.id}>
                {point.title}
              </option>
            ))}
          </select>
          <Button type="submit">筛选</Button>
        </form>
      </SectionCard>

      {questions.length === 0 ? (
        <EmptyState textKey="exam.emptyQuestions" />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {questions.map((question) => {
            const normalizedQuestion = normalizeStoredQuestion(question);
            const answer = normalizedQuestion.answer;
            const options = normalizedQuestion.options;

            return (
              <SectionCard key={question.id}>
                <CardHeader
                  action={
                    <div className="flex flex-wrap justify-end gap-2">
                      <Badge>{effectiveQuestionTypeLabels[normalizedQuestion.kind]}</Badge>
                      <Badge>{difficultyLabels[question.difficulty]}</Badge>
                    </div>
                  }
                >
                  <p className="text-xs text-muted">{question.source.title}</p>
                  <h2 className="mt-2 text-base font-semibold leading-6">
                    {normalizedQuestion.stem}
                  </h2>
                </CardHeader>
                {options.length > 0 ? (
                  <CardContent>
                    <ol className="space-y-2 text-sm text-muted">
                      {options.map((option, index) => (
                        <li className="rounded-lg border border-line bg-background px-3 py-2" key={option}>
                          {String.fromCharCode(65 + index)}. {option}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                ) : null}
                <CardFooter className="space-y-2">
                  <p>
                    <span className="font-medium text-foreground">答案：</span>
                    {renderCorrectAnswer(answer)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">解析：</span>
                    {question.explanation}
                  </p>
                  {question.knowledgePoint?.title ? (
                    <p>知识点：{question.knowledgePoint.title}</p>
                  ) : null}
                </CardFooter>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
