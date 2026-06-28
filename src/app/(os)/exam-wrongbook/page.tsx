import Link from "next/link";
import { startExamPracticeAction } from "@/features/exam/actions";
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

export default async function ExamWrongbookPage({
  searchParams,
}: {
  searchParams?: Promise<{ source?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const sourceId = params?.source?.trim() || "";
  const [sources, wrongRecords] = await Promise.all([
    prisma.examSource.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        _count: {
          select: {
            wrongRecords: true,
          },
        },
        filename: true,
        id: true,
        title: true,
      },
      where: {
        userId: session.userId,
      },
    }),
    sourceId
      ? prisma.examWrongRecord.findMany({
      include: {
        knowledgePoint: {
          select: {
            title: true,
          },
        },
        question: true,
        source: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        lastWrongAt: "desc",
      },
      where: {
        userId: session.userId,
        sourceId,
      },
      })
      : Promise.resolve([]),
  ]);
  const selectedSource = sources.find((source) => source.id === sourceId) ?? null;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        actions={
          selectedSource ? (
            <form action={startExamPracticeAction}>
              <input name="mode" type="hidden" value="WRONG_ONLY" />
              <input name="sourceId" type="hidden" value={selectedSource.id} />
              <Button disabled={wrongRecords.length === 0} type="submit" variant="primary">
                练习这份资料的错题
              </Button>
            </form>
          ) : null
        }
        badge={
          <Badge>
            {selectedSource ? `${wrongRecords.length} 道错题` : `${sources.length} 个资料库`}
          </Badge>
        }
        descriptionKey="exam.wrongbookDescription"
        eyebrow="Exam Review"
        titleKey="exam.wrongbookTitle"
      />

      {selectedSource ? (
        <SectionCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{selectedSource.title}</p>
              <p className="mt-1 text-xs text-muted">{selectedSource.filename}</p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-4 text-sm text-muted transition-colors hover:bg-background hover:text-foreground"
              href="/exam-wrongbook"
            >
              返回资料错题库
            </Link>
          </div>
        </SectionCard>
      ) : null}

      {!selectedSource ? (
        sources.length === 0 ? (
          <EmptyState textKey="exam.emptyWrongbook" />
        ) : (
          <SectionCard>
            <CardHeader>
              <h2 className="text-lg font-semibold">按资料分开的错题库</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                每份上传资料都有独立错题记录，不会与其他文件混合。
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sources.map((source) => (
                <Link
                  className="rounded-lg border border-line bg-background p-4 transition-colors hover:border-accent/40 hover:bg-panel"
                  href={`/exam-wrongbook?source=${source.id}`}
                  key={source.id}
                >
                  <p className="font-medium">{source.title}</p>
                  <p className="mt-1 truncate text-xs text-muted">{source.filename}</p>
                  <p className="mt-4 text-sm">
                    <span className="font-semibold">{source._count.wrongRecords}</span> 道错题
                  </p>
                </Link>
              ))}
            </CardContent>
          </SectionCard>
        )
      ) : wrongRecords.length === 0 ? (
        <EmptyState textKey="exam.emptyWrongbook" />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {wrongRecords.map((record) => {
            const normalizedQuestion = normalizeStoredQuestion(record.question);
            const answer = normalizedQuestion.answer;

            return (
              <SectionCard key={record.id}>
                <CardHeader
                  action={
                    <div className="flex flex-wrap justify-end gap-2">
                      <Badge>{effectiveQuestionTypeLabels[normalizedQuestion.kind]}</Badge>
                      <Badge>{difficultyLabels[record.question.difficulty]}</Badge>
                    </div>
                  }
                >
                  <p className="text-xs text-muted">{selectedSource.title}</p>
                  <h2 className="mt-2 text-base font-semibold leading-6">
                    {normalizedQuestion.stem}
                  </h2>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-lg border border-line bg-background p-3">
                    <p className="text-muted">错误次数</p>
                    <p className="mt-1 text-lg font-semibold">{record.wrongCount}</p>
                  </div>
                  <div className="rounded-lg border border-line bg-background p-3 sm:col-span-2">
                    <p className="text-muted">知识点</p>
                    <p className="mt-1 font-medium">
                      {record.knowledgePoint?.title ?? "未分类"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="space-y-2">
                  <p>
                    <span className="font-medium text-foreground">正确答案：</span>
                    {renderCorrectAnswer(answer)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">解析：</span>
                    {record.question.explanation}
                  </p>
                  <Link className="text-foreground underline" href={`/exam-bank?source=${record.sourceId}`}>
                    查看同资料题库
                  </Link>
                </CardFooter>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
