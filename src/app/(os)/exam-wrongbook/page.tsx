import Link from "next/link";
import { startExamPracticeAction } from "@/features/exam/actions";
import {
  difficultyLabels,
  parseAnswerPayload,
  questionTypeLabels,
  renderCorrectAnswer,
} from "@/features/exam/utils";
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
        id: true,
        title: true,
      },
      where: {
        userId: session.userId,
      },
    }),
    prisma.examWrongRecord.findMany({
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
        ...(sourceId ? { sourceId } : {}),
      },
    }),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        actions={
          <form action={startExamPracticeAction}>
            <input name="mode" type="hidden" value="WRONG_ONLY" />
            <input name="sourceId" type="hidden" value={sourceId} />
            <Button disabled={wrongRecords.length === 0} type="submit" variant="primary">
              练习错题
            </Button>
          </form>
        }
        badge={<Badge>{wrongRecords.length} 条</Badge>}
        descriptionKey="exam.wrongbookDescription"
        eyebrow="Exam Review"
        titleKey="exam.wrongbookTitle"
      />

      <SectionCard>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
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
          <Button type="submit">筛选</Button>
        </form>
      </SectionCard>

      {wrongRecords.length === 0 ? (
        <EmptyState textKey="exam.emptyWrongbook" />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {wrongRecords.map((record) => {
            const answer = parseAnswerPayload(record.question.answerJson);

            return (
              <SectionCard key={record.id}>
                <CardHeader
                  action={
                    <div className="flex flex-wrap justify-end gap-2">
                      <Badge>{questionTypeLabels[record.question.type]}</Badge>
                      <Badge>{difficultyLabels[record.question.difficulty]}</Badge>
                    </div>
                  }
                >
                  <p className="text-xs text-muted">{record.source.title}</p>
                  <h2 className="mt-2 text-base font-semibold leading-6">
                    {record.question.stem}
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
