import Link from "next/link";
import {
  Bot,
  CalendarDays,
  CheckSquare,
  FileUp,
  FolderOpen,
  NotebookPen,
  Plus,
  Settings,
  Text,
} from "lucide-react";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";
import { T } from "@/components/i18n/text";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import type { TranslationKey } from "@/lib/i18n/dictionary";

type RecentItem = {
  href: string;
  labelKey: TranslationKey;
  title: string;
  updatedAt: Date;
};

const quickActions = [
  {
    href: "/todos",
    icon: CheckSquare,
    labelKey: "dashboard.quickTodo",
    textKey: "dashboard.quickTodoText",
  },
  {
    href: "/diary",
    icon: NotebookPen,
    labelKey: "dashboard.quickDiary",
    textKey: "dashboard.quickDiaryText",
  },
  {
    href: "/documents",
    icon: Text,
    labelKey: "dashboard.quickDocument",
    textKey: "dashboard.quickDocumentText",
  },
  {
    href: "/files",
    icon: FileUp,
    labelKey: "dashboard.quickFile",
    textKey: "dashboard.quickFileText",
  },
] as const satisfies readonly {
  href: string;
  icon: typeof CheckSquare;
  labelKey: TranslationKey;
  textKey: TranslationKey;
}[];

const moduleEntrances = [
  {
    href: "/todos",
    icon: CheckSquare,
    labelKey: "nav.todo",
    textKey: "dashboard.module.todo",
  },
  {
    href: "/documents",
    icon: Text,
    labelKey: "nav.documents",
    textKey: "dashboard.module.documents",
  },
  {
    href: "/diary",
    icon: CalendarDays,
    labelKey: "nav.diary",
    textKey: "dashboard.module.diary",
  },
  {
    href: "/files",
    icon: FolderOpen,
    labelKey: "nav.files",
    textKey: "dashboard.module.files",
  },
  {
    href: "/ai",
    icon: Bot,
    labelKey: "ai.title",
    textKey: "dashboard.module.ai",
  },
  {
    href: "/settings",
    icon: Settings,
    labelKey: "nav.settings",
    textKey: "dashboard.module.settings",
  },
] as const satisfies readonly {
  href: string;
  icon: typeof CheckSquare;
  labelKey: TranslationKey;
  textKey: TranslationKey;
}[];

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function sortRecentItems(items: RecentItem[]) {
  return items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 8);
}

export default async function DashboardPage() {
  const session = await requireSession();
  const [
    openTodoCount,
    recentDocumentCount,
    fileCount,
    latestDiary,
    recentTodos,
    recentDocuments,
    recentDiaries,
    recentFiles,
  ] = await Promise.all([
    prisma.todo.count({
      where: {
        status: { notIn: ["DONE", "ARCHIVED"] },
        userId: session.userId,
      },
    }),
    prisma.note.count({
      where: {
        userId: session.userId,
      },
    }),
    prisma.fileAsset.count({
      where: {
        userId: session.userId,
      },
    }),
    prisma.diary.findFirst({
      orderBy: [{ diaryDate: "desc" }, { updatedAt: "desc" }],
      select: {
        diaryDate: true,
        title: true,
      },
      where: {
        archived: false,
        userId: session.userId,
      },
    }),
    prisma.todo.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
      take: 4,
      where: {
        userId: session.userId,
      },
    }),
    prisma.note.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
      take: 4,
      where: {
        userId: session.userId,
      },
    }),
    prisma.diary.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
      take: 4,
      where: {
        userId: session.userId,
      },
    }),
    prisma.fileAsset.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        filename: true,
        id: true,
        updatedAt: true,
      },
      take: 4,
      where: {
        userId: session.userId,
      },
    }),
  ]);

  const recentItems = sortRecentItems([
    ...recentTodos.map((todo) => ({
      href: `/todos?q=${encodeURIComponent(todo.title)}`,
      labelKey: "nav.todo" as const,
      title: todo.title,
      updatedAt: todo.updatedAt,
    })),
    ...recentDocuments.map((document) => ({
      href: `/documents?id=${document.id}`,
      labelKey: "nav.documents" as const,
      title: document.title,
      updatedAt: document.updatedAt,
    })),
    ...recentDiaries.map((diary) => ({
      href: `/diary?id=${diary.id}`,
      labelKey: "nav.diary" as const,
      title: diary.title,
      updatedAt: diary.updatedAt,
    })),
    ...recentFiles.map((file) => ({
      href: `/files?id=${file.id}`,
      labelKey: "nav.files" as const,
      title: file.filename,
      updatedAt: file.updatedAt,
    })),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardWelcome displayName={session.displayName} />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              className="group rounded-lg border border-line bg-panel p-4 transition-colors hover:bg-background"
              href={action.href}
              key={action.href}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-line bg-background text-accent transition-colors group-hover:border-accent/40">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-sm font-semibold sm:text-base">
                <T k={action.labelKey} />
              </h2>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted sm:text-sm">
                <T k={action.textKey} />
              </p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-line bg-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              <T k="dashboard.todayOverview" />
            </h2>
            <Badge>
              <T k="dashboard.liveData" />
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <OverviewCard
              labelKey="dashboard.openTodos"
              value={String(openTodoCount)}
            />
            <OverviewCard
              labelKey="dashboard.recentDocuments"
              value={String(recentDocumentCount)}
            />
            <OverviewCard
              labelKey="dashboard.latestDiary"
              value={latestDiary ? formatDate(latestDiary.diaryDate) : "—"}
              detail={latestDiary?.title}
            />
            <OverviewCard labelKey="dashboard.fileCount" value={String(fileCount)} />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              <T k="dashboard.recentUpdates" />
            </h2>
            <Link className="text-sm text-muted underline hover:text-foreground" href="/search">
              <T k="dashboard.viewAll" />
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {recentItems.length === 0 ? (
              <div className="rounded-md border border-line bg-background p-4 text-sm text-muted">
                <T k="dashboard.noContent" />
              </div>
            ) : (
              recentItems.map((item) => (
                <Link
                  className="flex items-center justify-between gap-3 rounded-md border border-line bg-background px-3 py-3 text-sm transition-colors hover:border-accent/40 hover:bg-panel"
                  href={item.href}
                  key={`${item.labelKey}-${item.title}-${item.updatedAt.toISOString()}`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <Badge className="shrink-0">
                    <T k={item.labelKey} />
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">
            <T k="dashboard.modules" />
          </h2>
          <Plus className="h-4 w-4 text-muted" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {moduleEntrances.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                className="group rounded-md border border-line bg-background p-4 transition-colors hover:border-accent/40 hover:bg-panel"
                href={module.href}
                key={module.href}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">
                      <T k={module.labelKey} />
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                      <T k={module.textKey} />
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function OverviewCard({
  detail,
  labelKey,
  value,
}: {
  detail?: string;
  labelKey: TranslationKey;
  value: string;
}) {
  return (
    <div className="rounded-md border border-line bg-background p-3 sm:p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        <T k={labelKey} />
      </p>
      <p className="mt-2 truncate text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 truncate text-xs text-muted">{detail}</p> : null}
    </div>
  );
}
