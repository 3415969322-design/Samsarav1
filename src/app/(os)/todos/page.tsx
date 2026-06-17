import Link from "next/link";
import { createTodoAction } from "@/features/todos/actions";
import { TodoList } from "@/features/todos/todo-list";
import { TagCheckboxes } from "@/features/tags/tag-checkboxes";
import { getTagsForEntities } from "@/features/tags/utils";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { T } from "@/components/i18n/text";
import {
  TranslatedInput,
  TranslatedSelect,
  TranslatedTextarea,
} from "@/components/i18n/translated-controls";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

type TodoFilter = "all" | "open" | "done";
type TodoSort = "updated" | "due" | "priority";

function normalizeFilter(value: string | undefined): TodoFilter {
  return value === "open" || value === "done" ? value : "all";
}

function normalizeSort(value: string | undefined): TodoSort {
  return value === "due" || value === "priority" ? value : "updated";
}

export default async function TodosPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string; q?: string; sort?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const filter = normalizeFilter(params?.filter);
  const sort = normalizeSort(params?.sort);
  const q = (params?.q ?? "").trim();
  const statusWhere =
    filter === "done" ? { status: "DONE" as const } : filter === "open" ? { status: { not: "DONE" as const } } : {};
  const orderBy =
    sort === "due"
      ? [{ dueAt: "asc" as const }, { updatedAt: "desc" as const }]
      : sort === "priority"
        ? [{ priority: "desc" as const }, { updatedAt: "desc" as const }]
        : [{ updatedAt: "desc" as const }];
  const [todos, tagOptions] = await Promise.all([
    prisma.todo.findMany({
      orderBy,
      where: {
        userId: session.userId,
        ...statusWhere,
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    }),
    prisma.tag.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      where: {
        userId: session.userId,
        type: { in: ["GLOBAL", "TODO"] },
      },
    }),
  ]);
  const todoTags = await getTagsForEntities(
    "TODO",
    todos.map((todo) => todo.id),
    session.userId,
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        actions={
          <Link className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground" href="/tags">
            <T k="common.manageTags" />
          </Link>
        }
        descriptionKey="todo.description"
        eyebrow="v1.0"
        titleKey="todo.title"
      />

      <SectionCard>
        <form action={createTodoAction} className="grid gap-3">
          <TranslatedInput
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 focus:ring-4 sm:text-sm"
            name="title"
            placeholderKey="todo.new"
            required
          />
          <TranslatedTextarea
            className="min-h-24 rounded-lg border border-line bg-background px-3 py-2 text-base outline-none ring-accent/20 focus:ring-4 sm:text-sm"
            name="description"
            placeholderKey="todo.descriptionPlaceholder"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TranslatedSelect
              className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              defaultValue="MEDIUM"
              name="priority"
              options={[
                { value: "LOW", labelKey: "todo.low" },
                { value: "MEDIUM", labelKey: "todo.medium" },
                { value: "HIGH", labelKey: "todo.high" },
              ]}
            />
            <input
              className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              name="dueAt"
              type="date"
            />
          </div>
          <TagCheckboxes tags={tagOptions} />
          <div>
            <Button type="submit" variant="primary">
              <T k="todo.create" />
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard>
        <form className="grid gap-3 md:grid-cols-[1fr_10rem_10rem_auto]">
          <TranslatedInput
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue={q}
            name="q"
            placeholderKey="todo.search"
          />
          <TranslatedSelect
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue={filter}
            name="filter"
            options={[
              { value: "all", labelKey: "todo.viewAll" },
              { value: "open", labelKey: "todo.open" },
              { value: "done", labelKey: "todo.done" },
            ]}
          />
          <TranslatedSelect
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue={sort}
            name="sort"
            options={[
              { value: "updated", labelKey: "todo.recent" },
              { value: "due", labelKey: "todo.dueDate" },
              { value: "priority", labelKey: "todo.priority" },
            ]}
          />
          <Button type="submit">
            <T k="common.apply" />
          </Button>
        </form>
      </SectionCard>

      {todos.length === 0 ? (
        <EmptyState textKey="todo.empty" />
      ) : (
        <TodoList tagOptions={tagOptions} todoTags={todoTags} todos={todos} />
      )}
    </div>
  );
}
