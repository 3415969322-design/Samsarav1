"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { deleteDocumentAction, updateDocumentAction } from "@/features/documents/actions";
import { TagChip } from "@/features/tags/tag-chip";

type DocumentTag = {
  color: string;
  id: string;
  name: string;
};

type DocumentEditorProps = {
  document: {
    archived: boolean;
    contentMarkdown: string;
    id: string;
    pinned: boolean;
    title: string;
    updatedAt: Date;
  };
  selectedTagIds: string[];
  tags: DocumentTag[];
};

export function DocumentEditor({
  document,
  selectedTagIds,
  tags,
}: DocumentEditorProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(document.title);
  const [contentMarkdown, setContentMarkdown] = useState(document.contentMarkdown);
  const [pinned, setPinned] = useState(document.pinned);
  const [archived, setArchived] = useState(document.archived);
  const [tagIds, setTagIds] = useState(selectedTagIds);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTags = useMemo(
    () => tags.filter((tag) => tagIds.includes(tag.id)),
    [tagIds, tags],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const formData = new FormData();
      formData.set("id", document.id);
      formData.set("title", title);
      formData.set("contentMarkdown", contentMarkdown);
      formData.set("pinned", String(pinned));
      formData.set("archived", String(archived));

      for (const tagId of tagIds) {
        formData.append("tagIds", tagId);
      }

      startTransition(async () => {
        await updateDocumentAction(formData);
        setSavedAt(new Date());
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [archived, contentMarkdown, document.id, pinned, tagIds, title]);

  return (
    <section className="grid min-h-[calc(100vh-8rem)] gap-4 xl:grid-cols-[1fr_1fr]">
      <div className="rounded-lg border border-line bg-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
                type="checkbox"
              />
              {t("documents.pinned")}
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                checked={archived}
                onChange={(event) => setArchived(event.target.checked)}
                type="checkbox"
              />
              {t("common.archived")}
            </label>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>
              {isPending
                ? t("common.saving")
                : savedAt
                  ? t("common.saved")
                  : t("common.autoSave")}
            </span>
            <form action={deleteDocumentAction}>
              <input name="id" type="hidden" value={document.id} />
              <Button type="submit" variant="ghost">
                {t("common.delete")}
              </Button>
            </form>
          </div>
        </div>

        <input
          className="mt-4 w-full bg-transparent text-3xl font-semibold outline-none placeholder:text-muted"
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("documents.untitled")}
          value={title}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <Link className="text-sm text-muted underline" href="/tags">
              {t("documents.createTags")}
            </Link>
          ) : (
            tags.map((tag) => {
              const selected = tagIds.includes(tag.id);

              return (
                <button
                  className="rounded-full"
                  key={tag.id}
                  onClick={() =>
                    setTagIds((current) =>
                      selected
                        ? current.filter((tagId) => tagId !== tag.id)
                        : [...current, tag.id],
                    )
                  }
                  type="button"
                >
                  <TagChip color={tag.color} name={tag.name} selected={selected} />
                </button>
              );
            })
          )}
        </div>

        <textarea
          className="mt-4 min-h-[30rem] w-full resize-none rounded-md border border-line bg-background px-4 py-3 font-mono text-sm leading-7 outline-none ring-accent/20 focus:ring-4"
          onChange={(event) => setContentMarkdown(event.target.value)}
          placeholder={t("documents.startWriting")}
          value={contentMarkdown}
        />
      </div>

      <div className="rounded-lg border border-line bg-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-muted">{t("common.preview")}</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <TagChip color={tag.color} key={tag.id} name={tag.name} />
            ))}
          </div>
        </div>
        <article className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted prose-strong:text-foreground prose-code:text-foreground prose-a:text-accent">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentMarkdown || t("documents.nothingPreview")}
          </ReactMarkdown>
        </article>
      </div>
    </section>
  );
}
