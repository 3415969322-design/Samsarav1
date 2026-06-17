import type { Priority, TodoStatus } from "@/generated/prisma/enums";
import { T } from "@/components/i18n/text";
import { TranslatedSelect } from "@/components/i18n/translated-controls";
import { Button } from "@/components/ui/button";
import { TagCheckboxes } from "@/features/tags/tag-checkboxes";
import { TagChip } from "@/features/tags/tag-chip";
import {
  deleteTodoAction,
  toggleTodoAction,
  updateTodoAction,
} from "@/features/todos/actions";
import type { EntityTag } from "@/features/tags/utils";
import { cn } from "@/lib/utils";

type TodoItem = {
  completedAt: Date | null;
  description: string | null;
  dueAt: Date | null;
  id: string;
  priority: Priority;
  status: TodoStatus;
  title: string;
  updatedAt: Date;
};

type TagOption = {
  color: string;
  id: string;
  name: string;
  type: "GLOBAL" | "TODO" | "NOTE" | "DIARY" | "FILE";
};

function formatDate(value: Date | null) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}

export function TodoList({
  tagOptions,
  todoTags,
  todos,
}: {
  tagOptions: TagOption[];
  todoTags: Map<string, EntityTag[]>;
  todos: TodoItem[];
}) {
  if (todos.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-panel p-6 text-sm text-muted shadow-sm">
        <T k="todo.empty" />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {todos.map((todo) => {
        const tags = todoTags.get(todo.id) ?? [];

        return (
          <article
            className="rounded-xl border border-line bg-panel p-4 shadow-sm transition-colors hover:border-accent/30 sm:p-5"
            key={todo.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <form action={toggleTodoAction}>
                    <input name="id" type="hidden" value={todo.id} />
                    <input name="status" type="hidden" value={todo.status} />
                    <button
                      aria-label="Toggle todo completion"
                      className={cn(
                        "h-6 w-6 rounded-md border border-line transition-colors hover:border-accent",
                        todo.status === "DONE" && "bg-accent",
                      )}
                      type="submit"
                    />
                  </form>
                  <h2
                    className={cn(
                      "text-base font-semibold",
                      todo.status === "DONE" && "text-muted line-through",
                    )}
                  >
                    {todo.title}
                  </h2>
                  <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                    {todo.priority.toLowerCase()}
                  </span>
                  {todo.dueAt ? (
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                      <T k="todo.due" /> {formatDate(todo.dueAt)}
                    </span>
                  ) : null}
                </div>
                {todo.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted">{todo.description}</p>
                ) : null}
                {tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <TagChip color={tag.color} key={tag.id} name={tag.name} />
                    ))}
                  </div>
                ) : null}
              </div>

              <form action={deleteTodoAction} className="sm:shrink-0">
                <input name="id" type="hidden" value={todo.id} />
                <Button className="w-full sm:w-auto" type="submit" variant="ghost">
                  <T k="common.delete" />
                </Button>
              </form>
            </div>

            <details className="mt-4">
              <summary className="min-h-11 cursor-pointer rounded-lg px-1 py-3 text-sm font-medium text-muted hover:text-foreground">
                <T k="common.edit" />
              </summary>
              <form action={updateTodoAction} className="mt-4 grid gap-3">
                <input name="id" type="hidden" value={todo.id} />
                <input
                  className="min-h-11 rounded-lg border border-line bg-background px-3 text-base outline-none ring-accent/20 focus:ring-4 sm:text-sm"
                  name="title"
                  required
                  defaultValue={todo.title}
                />
                <textarea
                  className="min-h-24 rounded-lg border border-line bg-background px-3 py-2 text-base outline-none ring-accent/20 focus:ring-4 sm:text-sm"
                  name="description"
                  defaultValue={todo.description ?? ""}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TranslatedSelect
                    className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
                    defaultValue={todo.priority}
                    name="priority"
                    options={[
                      { value: "LOW", labelKey: "todo.low" },
                      { value: "MEDIUM", labelKey: "todo.medium" },
                      { value: "HIGH", labelKey: "todo.high" },
                    ]}
                  />
                  <input
                    className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
                    defaultValue={formatDate(todo.dueAt)}
                    name="dueAt"
                    type="date"
                  />
                </div>
                <TagCheckboxes
                  selectedIds={tags.map((tag) => tag.id)}
                  tags={tagOptions}
                />
                <div>
                  <Button className="w-full sm:w-auto" type="submit" variant="primary">
                    <T k="todo.save" />
                  </Button>
                </div>
              </form>
            </details>
          </article>
        );
      })}
    </section>
  );
}
