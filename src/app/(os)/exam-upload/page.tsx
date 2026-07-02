import Link from "next/link";
import { uploadExamSourceAction } from "@/features/exam/actions";
import { formatFileSize, getErrorMessage } from "@/features/exam/utils";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CardContent, CardFooter, CardHeader, SectionCard } from "@/components/ui/section-card";

export default async function ExamUploadPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);
  const sources = await prisma.examSource.findMany({
    include: {
      _count: {
        select: {
          knowledgePoints: true,
          questions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: {
      userId: session.userId,
    },
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        descriptionKey="exam.uploadDescription"
        titleKey="exam.uploadTitle"
      />

      <SectionCard>
        <CardHeader
          action={
            <Link className="text-sm text-muted underline hover:text-foreground" href="/exam-bank">
              查看题库
            </Link>
          }
        >
          <h2 className="text-lg font-semibold">上传学习资料</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            支持 PDF、DOCX、TXT。文件会在后端解析，生成知识点和题目。
          </p>
        </CardHeader>
        <CardContent>
          <form action={uploadExamSourceAction} className="grid gap-4">
            <input
              className="min-h-11 rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 focus:ring-4 sm:text-sm"
              name="title"
              placeholder="资料标题（可选）"
            />
            <input
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="min-h-11 rounded-lg border border-line bg-background px-3 py-2 text-base file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-foreground sm:text-sm"
              name="file"
              required
              type="file"
            />
            {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}
            <div>
              <Button type="submit" variant="primary">
                上传并生成题库
              </Button>
            </div>
          </form>
        </CardContent>
      </SectionCard>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">历史资料</h2>
          <Link className="text-sm text-muted underline hover:text-foreground" href="/exam-practice">
            开始刷题
          </Link>
        </div>
        {sources.length === 0 ? (
          <EmptyState textKey="exam.emptySources" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sources.map((source) => (
              <SectionCard key={source.id}>
                <CardHeader
                  action={<Badge>{source.status}</Badge>}
                >
                  <h3 className="line-clamp-2 font-semibold">{source.title}</h3>
                  <p className="mt-1 text-xs text-muted">{source.filename}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted">知识点</p>
                    <p className="font-semibold">{source._count.knowledgePoints}</p>
                  </div>
                  <div>
                    <p className="text-muted">题目</p>
                    <p className="font-semibold">{source._count.questions}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-3">
                  <span>{formatFileSize(source.size)}</span>
                  <Link className="text-foreground underline" href={`/exam-bank?source=${source.id}`}>
                    打开题库
                  </Link>
                </CardFooter>
              </SectionCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
