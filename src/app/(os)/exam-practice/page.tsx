import Link from "next/link";
import { redirect } from "next/navigation";
import { startExamPracticeAction, submitExamAnswerAction } from "@/features/exam/actions";
import {
  difficultyLabels,
  effectiveQuestionTypeLabels,
  getErrorMessage,
  parseQuestionOrder,
  renderCorrectAnswer,
} from "@/features/exam/utils";
import { normalizeStoredQuestion } from "@/features/exam/question-processing";
import { getExamProgress } from "@/features/exam/progress";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CardContent, CardFooter, CardHeader, SectionCard } from "@/components/ui/section-card";

function parseIndex(value: string | undefined, total: number) {
  const index = Number(value ?? "0");

  if (!Number.isFinite(index) || index < 0) {
    return 0;
  }

  return Math.min(index, Math.max(total - 1, 0));
}

function renderProgress(current: number, total: number) {
  if (total === 0) {
    return "0 / 0";
  }

  return `${current + 1} / ${total}`;
}

export default async function ExamPracticePage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
    index?: string;
    review?: string;
    session?: string;
    new?: string;
  }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const sessionId = params?.session?.trim() || "";
  const errorMessage = getErrorMessage(params?.error);
  const startNewPractice = params?.new === "1";

  if (!sessionId) {
    const [sources, recentSessions] = await Promise.all([
      prisma.examSource.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          _count: {
            select: {
              questions: true,
            },
          },
          id: true,
          title: true,
        },
        where: {
          userId: session.userId,
        },
      }),
      prisma.examPracticeSession.findMany({
        include: {
          answers: {
            select: {
              questionId: true,
            },
          },
          source: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 10,
        where: {
          userId: session.userId,
        },
      }),
    ]);
    const resumableSessions = recentSessions
      .map((practiceSession) => ({
        practiceSession,
        progress: getExamProgress(
          parseQuestionOrder(practiceSession.questionOrderJson),
          practiceSession.answers.map((answer) => answer.questionId),
        ),
      }))
      .filter(({ progress }) => progress.total > 0 && !progress.completed);
    const latestSession = resumableSessions[0];

    if (latestSession && !startNewPractice) {
      redirect(
        `/exam-practice?session=${latestSession.practiceSession.id}&index=${latestSession.progress.resumeIndex}`,
      );
    }

    return (
      <div className="space-y-5 sm:space-y-6">
        <PageHeader
          actions={
            <Link className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground" href="/exam-wrongbook">
              错题本
            </Link>
          }
          descriptionKey="exam.practiceDescription"
          eyebrow="Exam Review"
          titleKey="exam.practiceTitle"
        />

        <SectionCard>
          <CardHeader>
            <h2 className="text-lg font-semibold">选择练习范围</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              支持顺序刷题、随机刷题和错题练习。
            </p>
          </CardHeader>
          <CardContent>
            {latestSession ? (
              <div className="mb-5 flex flex-col gap-3 rounded-lg border border-line bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">
                    继续上次练习
                    {latestSession.practiceSession.source?.title
                      ? ` · ${latestSession.practiceSession.source.title}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    已完成 {latestSession.progress.answered} / {latestSession.progress.total} 题，进度已同步到账号。
                  </p>
                </div>
                <Link
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground"
                  href={`/exam-practice?session=${latestSession.practiceSession.id}&index=${latestSession.progress.resumeIndex}`}
                >
                  继续作答
                </Link>
              </div>
            ) : null}
            <form action={startExamPracticeAction} className="grid gap-4">
              <select
                className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
                name="sourceId"
              >
                <option value="">全部资料</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.title}（{source._count.questions} 题）
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
                name="mode"
              >
                <option value="SEQUENTIAL">顺序刷题</option>
                <option value="RANDOM">随机刷题</option>
                <option value="WRONG_ONLY">错题练习</option>
              </select>
              {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}
              <div>
                <Button disabled={sources.length === 0} type="submit" variant="primary">
                  开始练习
                </Button>
              </div>
            </form>
          </CardContent>
        </SectionCard>

        {sources.length === 0 ? <EmptyState textKey="exam.emptyPractice" /> : null}
      </div>
    );
  }

  const practiceSession = await prisma.examPracticeSession.findFirst({
    include: {
      source: {
        select: {
          title: true,
        },
      },
    },
    where: {
      id: sessionId,
      userId: session.userId,
    },
  });

  if (!practiceSession) {
    return <EmptyState textKey="exam.practiceNotFound" />;
  }

  const questionOrder = parseQuestionOrder(practiceSession.questionOrderJson);
  const index = parseIndex(params?.index, questionOrder.length);
  const questionId = questionOrder[index];

  if (!questionId) {
    return <EmptyState textKey="exam.emptyPractice" />;
  }

  const [question, existingAnswer] = await Promise.all([
    prisma.examQuestion.findFirst({
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
      where: {
        id: questionId,
        userId: session.userId,
      },
    }),
    prisma.examAnswer.findFirst({
      where: {
        questionId,
        sessionId,
        userId: session.userId,
      },
    }),
  ]);

  if (!question) {
    return <EmptyState textKey="exam.practiceNotFound" />;
  }

  const normalizedQuestion = normalizeStoredQuestion(question);
  const correctAnswer = normalizedQuestion.answer;
  const options = normalizedQuestion.options;
  const showReview = params?.review === "1" || Boolean(existingAnswer);
  const nextIndex = index + 1;
  const hasNext = nextIndex < questionOrder.length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground" href="/exam-practice?new=1">
              新练习
            </Link>
            <Link className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground" href="/exam-bank">
              题库
            </Link>
          </div>
        }
        badge={<Badge>{renderProgress(index, questionOrder.length)}</Badge>}
        descriptionKey="exam.practiceDescription"
        eyebrow={practiceSession.source?.title ?? "Exam Review"}
        titleKey="exam.practiceTitle"
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <SectionCard>
          <CardHeader
            action={
              <div className="flex flex-wrap justify-end gap-2">
                <Badge>{effectiveQuestionTypeLabels[normalizedQuestion.kind]}</Badge>
                <Badge>{difficultyLabels[question.difficulty]}</Badge>
              </div>
            }
          >
            <p className="text-xs text-muted">
              {question.source.title}
              {question.knowledgePoint?.title ? ` · ${question.knowledgePoint.title}` : ""}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-8">
              {normalizedQuestion.stem}
            </h2>
          </CardHeader>
          <CardContent>
            <form action={submitExamAnswerAction} className="space-y-4">
              <input name="index" type="hidden" value={index} />
              <input name="questionId" type="hidden" value={question.id} />
              <input name="sessionId" type="hidden" value={practiceSession.id} />

              {normalizedQuestion.kind === "SINGLE_CHOICE" ? (
                <div className="space-y-2">
                  {options.map((option, optionIndex) => (
                    <label
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-line bg-background px-3 py-3 text-sm transition-colors hover:bg-panel"
                      key={option}
                    >
                      <input
                        className="mt-1"
                        disabled={showReview}
                        name="answer"
                        required
                        type="radio"
                        value={optionIndex}
                      />
                      <span>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}

              {normalizedQuestion.kind === "MULTIPLE_SELECT" ? (
                <fieldset className="space-y-2">
                  <legend className="mb-3 text-sm text-muted">本题可多选，需选中所有正确选项。</legend>
                  {options.map((option, optionIndex) => (
                    <label
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-line bg-background px-3 py-3 text-sm transition-colors hover:bg-panel"
                      key={`${optionIndex}-${option}`}
                    >
                      <input
                        className="mt-1 h-4 w-4"
                        disabled={showReview}
                        name="answer"
                        type="checkbox"
                        value={optionIndex}
                      />
                      <span>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </span>
                    </label>
                  ))}
                </fieldset>
              ) : null}

              {normalizedQuestion.kind === "TRUE_FALSE" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-line bg-background px-3 text-sm transition-colors hover:bg-panel">
                    <input disabled={showReview} name="answer" required type="radio" value="true" />
                    正确
                  </label>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-line bg-background px-3 text-sm transition-colors hover:bg-panel">
                    <input disabled={showReview} name="answer" required type="radio" value="false" />
                    错误
                  </label>
                </div>
              ) : null}

              {normalizedQuestion.kind === "SHORT_ANSWER" ? (
                <textarea
                  className="min-h-32 w-full rounded-lg border border-line bg-background px-3 py-2 text-base outline-none ring-accent/20 focus:ring-4 sm:text-sm"
                  disabled={showReview}
                  name="answer"
                  placeholder="写下你的答案"
                  required
                />
              ) : null}

              {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}

              {!showReview ? (
                <Button type="submit" variant="primary">
                  提交答案
                </Button>
              ) : null}
            </form>
          </CardContent>

          {showReview ? (
            <CardFooter className="space-y-3">
              <p className={existingAnswer?.isCorrect ? "text-accent" : "text-danger"}>
                {existingAnswer?.isCorrect ? "回答正确" : "回答错误"}
              </p>
              <p>
                <span className="font-medium text-foreground">正确答案：</span>
                {renderCorrectAnswer(correctAnswer)}
              </p>
              <p>
                <span className="font-medium text-foreground">解析：</span>
                {question.explanation}
              </p>
              <div className="flex flex-wrap gap-2">
                {hasNext ? (
                  <Link
                    className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                    href={`/exam-practice?session=${practiceSession.id}&index=${nextIndex}`}
                  >
                    下一题
                  </Link>
                ) : (
                  <Link
                    className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                    href="/exam-practice?new=1"
                  >
                    完成，重新开始
                  </Link>
                )}
                <Link
                  className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm text-muted transition-colors hover:bg-background hover:text-foreground"
                  href="/exam-wrongbook"
                >
                  查看错题本
                </Link>
              </div>
            </CardFooter>
          ) : null}
        </SectionCard>

        <SectionCard>
          <CardHeader>
            <h2 className="text-lg font-semibold">本轮统计</h2>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="rounded-lg border border-line bg-background p-3">
              <p className="text-muted">模式</p>
              <p className="mt-1 font-semibold">{practiceSession.mode}</p>
            </div>
            <div className="rounded-lg border border-line bg-background p-3">
              <p className="text-muted">进度</p>
              <p className="mt-1 font-semibold">{renderProgress(index, questionOrder.length)}</p>
            </div>
            <div className="rounded-lg border border-line bg-background p-3">
              <p className="text-muted">正确 / 总题数</p>
              <p className="mt-1 font-semibold">
                {practiceSession.correct} / {practiceSession.total}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-background p-3">
              <p className="text-muted">当前得分</p>
              <p className="mt-1 font-semibold">{Math.round(practiceSession.score)}%</p>
            </div>
          </CardContent>
        </SectionCard>
      </div>
    </div>
  );
}
