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
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              v1.0
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              <T k="todo.title" />
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              <T k="todo.description" />
            </p>
          </div>
          <Link className="text-sm text-muted underline" href="/tags">
            <T k="common.manageTags" />
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-4">
        <form action={createTodoAction} className="grid gap-3">
          <TranslatedInput
            className="h-11 rounded-md border border-line bg-background px-3 text-sm outline-none ring-accent/20 focus:ring-4"
            name="title"
            placeholderKey="todo.new"
            required
          />
          <TranslatedTextarea
            className="min-h-20 rounded-md border border-line bg-background px-3 py-2 text-sm outline-none ring-accent/20 focus:ring-4"
            name="description"
            placeholderKey="todo.descriptionPlaceholder"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TranslatedSelect
              className="h-10 rounded-md border border-line bg-background px-3 text-sm"
              defaultValue="MEDIUM"
              name="priority"
              options={[
                { value: "LOW", labelKey: "todo.low" },
                { value: "MEDIUM", labelKey: "todo.medium" },
                { value: "HIGH", labelKey: "todo.high" },
              ]}
            />
            <input
              className="h-10 rounded-md border border-line bg-background px-3 text-sm"
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
      </section>

      <section className="rounded-lg border border-line bg-panel p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_10rem_10rem_auto]">
          <TranslatedInput
            className="h-10 rounded-md border border-line bg-background px-3 text-sm"
            defaultValue={q}
            name="q"
            placeholderKey="todo.search"
          />
          <TranslatedSelect
            className="h-10 rounded-md border border-line bg-background px-3 text-sm"
            defaultValue={filter}
            name="filter"
            options={[
              { value: "all", labelKey: "todo.viewAll" },
              { value: "open", labelKey: "todo.open" },
              { value: "done", labelKey: "todo.done" },
            ]}
          />
          <TranslatedSelect
            className="h-10 rounded-md border border-line bg-background px-3 text-sm"
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
      </section>

      <TodoList tagOptions={tagOptions} todoTags={todoTags} todos={todos} />
    </div>
  );
}
