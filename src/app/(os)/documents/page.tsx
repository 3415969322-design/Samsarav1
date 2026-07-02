import Link from "next/link";
import { createDocumentAction } from "@/features/documents/actions";
import { DocumentEditor } from "@/features/documents/document-editor";
import { getTagsForEntities } from "@/features/tags/utils";
import { TagChip } from "@/features/tags/tag-chip";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { T } from "@/components/i18n/text";
import { TranslatedInput } from "@/components/i18n/translated-controls";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ archived?: string; id?: string; q?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const q = (params?.q ?? "").trim();
  const showArchived = params?.archived === "true";
  const [documents, tagOptions] = await Promise.all([
    prisma.note.findMany({
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      where: {
        archived: showArchived,
        userId: session.userId,
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                { contentText: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    }),
    prisma.tag.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      where: {
        userId: session.userId,
        type: { in: ["GLOBAL", "NOTE"] },
      },
    }),
  ]);
  const selectedDocument =
    documents.find((document) => document.id === params?.id) ?? documents[0] ?? null;
  const documentTags = await getTagsForEntities(
    "NOTE",
    documents.map((document) => document.id),
    session.userId,
  );
  const selectedTagIds = selectedDocument
    ? (documentTags.get(selectedDocument.id) ?? []).map((tag) => tag.id)
    : [];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        actions={
          <Link className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground" href="/tags">
            <T k="common.manageTags" />
          </Link>
        }
        descriptionKey="documents.description"
        titleKey="documents.title"
      />

      <section className="grid gap-4 xl:grid-cols-[21rem_1fr]">
        <SectionCard className="space-y-4">
          <form action={createDocumentAction} className="space-y-3">
            <TranslatedInput
              className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              name="title"
              placeholderKey="documents.newTitle"
            />
            <Button className="w-full" type="submit" variant="primary">
              <T k="documents.create" />
            </Button>
          </form>

          <form className="space-y-3">
            <TranslatedInput
              className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              defaultValue={q}
              name="q"
              placeholderKey="documents.search"
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                defaultChecked={showArchived}
                name="archived"
                type="checkbox"
                value="true"
              />
              <T k="documents.showArchived" />
            </label>
            <Button className="w-full" type="submit">
              <T k="common.search" />
            </Button>
          </form>

          <div className="space-y-2">
            {documents.length === 0 ? (
              <EmptyState className="py-6" textKey="documents.empty" />
            ) : (
              documents.map((document) => {
                const tags = documentTags.get(document.id) ?? [];
                const active = selectedDocument?.id === document.id;

                return (
                  <Link
                    className={`block rounded-xl border p-3 text-sm transition-colors ${
                      active
                        ? "border-accent bg-background text-foreground"
                        : "border-line text-muted hover:bg-background hover:text-foreground"
                    }`}
                    href={`/documents?id=${document.id}${q ? `&q=${encodeURIComponent(q)}` : ""}${showArchived ? "&archived=true" : ""}`}
                    key={document.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{document.title}</span>
                      {document.pinned ? (
                        <span className="text-xs">
                          <T k="documents.pinned" />
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs">{document.contentText}</p>
                    {tags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <TagChip color={tag.color} key={tag.id} name={tag.name} />
                        ))}
                      </div>
                    ) : null}
                  </Link>
                );
              })
            )}
          </div>
        </SectionCard>

        {selectedDocument ? (
          <DocumentEditor
            document={selectedDocument}
            key={selectedDocument.id}
            selectedTagIds={selectedTagIds}
            tags={tagOptions}
          />
        ) : (
          <SectionCard>
            <EmptyState textKey="documents.createToStart" />
          </SectionCard>
        )}
      </section>
    </div>
  );
}
