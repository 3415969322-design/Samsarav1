import Link from "next/link";
import {
  Bot,
  CalendarDays,
  CheckSquare,
  FilePlus2,
  FolderOpen,
  PenLine,
  Settings,
  Sparkles,
  Text,
  UploadCloud,
} from "lucide-react";
import { T } from "@/components/i18n/text";
import { TranslatedInput } from "@/components/i18n/translated-controls";
import { Button } from "@/components/ui/button";
import { QuickActionCard } from "@/components/ui/quick-action-card";
import {
  CardContent,
  CardFooter,
  CardHeader,
  SectionCard,
} from "@/components/ui/section-card";
import { createTodoAction } from "@/features/todos/actions";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const quickActions = [
  {
    href: "/todos",
    icon: CheckSquare,
    textKey: "dashboard.quickTodoText",
    titleKey: "dashboard.quickTodo",
  },
  {
    href: "/diary",
    icon: PenLine,
    textKey: "dashboard.quickDiaryText",
    titleKey: "dashboard.quickDiary",
  },
  {
    href: "/documents",
    icon: FilePlus2,
    textKey: "dashboard.quickDocumentText",
    titleKey: "dashboard.quickDocument",
  },
  {
    href: "/files",
    icon: UploadCloud,
    textKey: "dashboard.quickFileText",
    titleKey: "dashboard.quickFile",
  },
] as const satisfies readonly {
  href: string;
  icon: typeof CheckSquare;
  textKey: TranslationKey;
  titleKey: TranslationKey;
}[];

const activityCards = [
  {
    href: "/diary",
    icon: CalendarDays,
    textKey: "dashboard.activityDiaryText",
    titleKey: "dashboard.activityDiary",
  },
  {
    href: "/documents",
    icon: Text,
    textKey: "dashboard.activityDocumentsText",
    titleKey: "dashboard.activityDocuments",
  },
  {
    href: "/files",
    icon: FolderOpen,
    textKey: "dashboard.activityFilesText",
    titleKey: "dashboard.activityFiles",
  },
] as const satisfies readonly {
  href: string;
  icon: typeof CheckSquare;
  textKey: TranslationKey;
  titleKey: TranslationKey;
}[];

const moduleCards = [
  { href: "/todos", icon: CheckSquare, textKey: "dashboard.module.todo", titleKey: "nav.todo" },
  { href: "/documents", icon: Text, textKey: "dashboard.module.documents", titleKey: "nav.documents" },
  { href: "/diary", icon: CalendarDays, textKey: "dashboard.module.diary", titleKey: "nav.diary" },
  { href: "/files", icon: FolderOpen, textKey: "dashboard.module.files", titleKey: "nav.files" },
  { href: "/ai", icon: Bot, textKey: "dashboard.module.ai", titleKey: "nav.ai" },
  { href: "/settings", icon: Settings, textKey: "dashboard.module.settings", titleKey: "nav.settings" },
] as const satisfies readonly {
  href: string;
  icon: typeof CheckSquare;
  textKey: TranslationKey;
  titleKey: TranslationKey;
}[];

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
  }).format(new Date());

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <SectionCard className="p-5 sm:p-6 lg:p-8" interactive>
          <CardHeader
            action={
              <span className="hidden rounded-full border border-line bg-background px-3 py-1 text-xs font-medium text-muted sm:inline-flex">
                <T k="dashboard.actionFirst" />
              </span>
            }
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-background px-3 py-1 text-xs font-medium text-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>{today}</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">
              <T k="dashboard.hero" />
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              <T k="dashboard.heroText" />
            </p>
          </CardHeader>

          <CardContent>
            <form action={createTodoAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input name="priority" type="hidden" value="MEDIUM" />
              <TranslatedInput
                className="min-h-11 rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 transition-all duration-200 focus:ring-4 sm:text-sm"
                name="title"
                placeholderKey="dashboard.quickAddPlaceholder"
                required
              />
              <Button className="w-full sm:w-auto" type="submit" variant="primary">
                <T k="dashboard.quickAddButton" />
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <T k="dashboard.quickAddHint" />
          </CardFooter>
        </SectionCard>

        <SectionCard className="p-5 sm:p-6" interactive>
          <CardHeader>
            <h2 className="font-semibold">
              <T k="dashboard.today" />
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              <T k="dashboard.ready" />
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-line bg-background p-4">
              <p className="text-sm font-medium">
                <T k="dashboard.incompleteTodos" />
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                <T k="dashboard.incompleteTodosText" />
              </p>
            </div>
            <div className="rounded-xl border border-line bg-background p-4">
              <p className="text-sm font-medium">
                <T k="dashboard.recentTasks" />
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                <T k="dashboard.recentTasksText" />
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link className="font-medium text-accent" href="/todos">
              <T k="dashboard.viewTodos" />
            </Link>
          </CardFooter>
        </SectionCard>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">
            <T k="dashboard.quickActions" />
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard
              href={action.href}
              icon={action.icon}
              key={action.href}
              textKey={action.textKey}
              titleKey={action.titleKey}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <SectionCard interactive>
          <CardHeader>
            <h2 className="font-semibold">
              <T k="dashboard.recentActivity" />
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              <T k="dashboard.recentWorkText" />
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {activityCards.map((activity) => {
              const Icon = activity.icon;

              return (
                <Link
                  className="group rounded-xl border border-line bg-background p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-md active:translate-y-0 active:shadow-none"
                  href={activity.href}
                  key={activity.href}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-200 group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        <T k={activity.titleKey} />
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted">
                        <T k={activity.textKey} />
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </SectionCard>

        <SectionCard interactive>
          <CardHeader>
            <h2 className="font-semibold">
              <T k="dashboard.workspace" />
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              <T k="dashboard.workspaceText" />
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {moduleCards.slice(0, 4).map((module) => (
              <QuickActionCard
                className="min-h-20"
                href={module.href}
                icon={module.icon}
                key={module.href}
                textKey={module.textKey}
                titleKey={module.titleKey}
              />
            ))}
          </CardContent>
        </SectionCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {moduleCards.slice(4).map((module) => (
          <QuickActionCard
            className="min-h-24"
            href={module.href}
            icon={module.icon}
            key={module.href}
            textKey={module.textKey}
            titleKey={module.titleKey}
          />
        ))}
      </section>
    </div>
  );
}
