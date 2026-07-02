import {
  createTagAction,
  deleteTagAction,
  updateTagAction,
} from "@/features/tags/actions";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { T } from "@/components/i18n/text";
import { TranslatedInput, TranslatedSelect } from "@/components/i18n/translated-controls";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/features/tags/tag-chip";

export default async function TagsPage() {
  const session = await requireSession();
  const tags = await prisma.tag.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
      where: {
        userId: session.userId,
        type: { in: ["GLOBAL", "TODO", "NOTE", "DIARY", "FILE"] },
      },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-panel p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">
          <T k="tags.title" />
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          <T k="tags.description" />
        </p>
      </section>

      <section className="rounded-xl border border-line bg-panel p-4 shadow-sm">
        <form action={createTagAction} className="grid gap-3 md:grid-cols-[1fr_10rem_6rem_auto]">
          <TranslatedInput
            className="min-h-11 rounded-md border border-line bg-background px-3 text-base sm:text-sm"
            name="name"
            placeholderKey="tags.name"
            required
          />
          <TranslatedSelect
            className="min-h-11 rounded-md border border-line bg-background px-3 text-base sm:text-sm"
            defaultValue="GLOBAL"
            name="type"
            options={[
              { value: "GLOBAL", labelKey: "tags.global" },
              { value: "TODO", labelKey: "nav.todo" },
              { value: "NOTE", labelKey: "nav.documents" },
              { value: "DIARY", labelKey: "nav.diary" },
              { value: "FILE", labelKey: "nav.files" },
            ]}
          />
          <input
            className="min-h-11 rounded-md border border-line bg-background px-2"
            defaultValue="#2563eb"
            name="color"
            type="color"
          />
          <Button type="submit" variant="primary">
            <T k="tags.create" />
          </Button>
        </form>
      </section>

      <section className="grid gap-3">
        {tags.length === 0 ? (
          <div className="rounded-lg border border-line bg-panel p-6 text-sm text-muted">
            <T k="tags.empty" />
          </div>
        ) : (
          tags.map((tag) => (
            <article
              className="rounded-lg border border-line bg-panel p-4"
              key={tag.id}
            >
              <form action={updateTagAction} className="grid gap-3 md:grid-cols-[1fr_10rem_6rem_auto_auto] md:items-center">
                <input name="id" type="hidden" value={tag.id} />
                <input
                  className="h-10 rounded-md border border-line bg-background px-3 text-sm"
                  defaultValue={tag.name}
                  name="name"
                  required
                />
                <TranslatedSelect
                  className="h-10 rounded-md border border-line bg-background px-3 text-sm"
                  defaultValue={tag.type}
                  name="type"
                  options={[
                    { value: "GLOBAL", labelKey: "tags.global" },
                    { value: "TODO", labelKey: "nav.todo" },
                    { value: "NOTE", labelKey: "nav.documents" },
                    { value: "DIARY", labelKey: "nav.diary" },
                    { value: "FILE", labelKey: "nav.files" },
                  ]}
                />
                <input
                  className="h-10 rounded-md border border-line bg-background px-2"
                  defaultValue={tag.color}
                  name="color"
                  type="color"
                />
                <TagChip color={tag.color} name={tag.name} />
                <Button type="submit">
                  <T k="common.save" />
                </Button>
              </form>
              <form action={deleteTagAction} className="mt-3">
                <input name="id" type="hidden" value={tag.id} />
                <Button type="submit" variant="ghost">
                  <T k="common.delete" />
                </Button>
              </form>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
