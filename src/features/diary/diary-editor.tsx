"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { deleteDiaryAction, updateDiaryAction } from "@/features/diary/actions";
import { formatFileSize } from "@/features/files/types";
import type { EntityFile } from "@/features/files/utils";
import { TagChip } from "@/features/tags/tag-chip";

type DiaryTag = {
  color: string;
  id: string;
  name: string;
};

type FileOption = {
  createdAt: Date;
  filename: string;
  id: string;
  mimeType: string;
  originalName: string;
  size: bigint;
};

type DiaryEditorProps = {
  attachedFiles: EntityFile[];
  diary: {
    archived: boolean;
    contentMarkdown: string;
    diaryDate: Date;
    favorite: boolean;
    id: string;
    mood: string | null;
    title: string;
    updatedAt: Date;
    weather: string | null;
  };
  fileOptions: FileOption[];
  selectedFileIds: string[];
  selectedTagIds: string[];
  tags: DiaryTag[];
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
  }).format(value);
}

export function DiaryEditor({
  attachedFiles,
  diary,
  fileOptions,
  selectedFileIds,
  selectedTagIds,
  tags,
}: DiaryEditorProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(diary.title);
  const [contentMarkdown, setContentMarkdown] = useState(diary.contentMarkdown);
  const [mood, setMood] = useState(diary.mood ?? "");
  const [weather, setWeather] = useState(diary.weather ?? "");
  const [favorite, setFavorite] = useState(diary.favorite);
  const [archived, setArchived] = useState(diary.archived);
  const [tagIds, setTagIds] = useState(selectedTagIds);
  const [fileIds, setFileIds] = useState(selectedFileIds);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTags = useMemo(
    () => tags.filter((tag) => tagIds.includes(tag.id)),
    [tagIds, tags],
  );
  const selectedFiles = useMemo(
    () => fileOptions.filter((file) => fileIds.includes(file.id)),
    [fileIds, fileOptions],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const formData = new FormData();
      formData.set("id", diary.id);
      formData.set("title", title);
      formData.set("contentMarkdown", contentMarkdown);
      formData.set("mood", mood);
      formData.set("weather", weather);
      formData.set("favorite", String(favorite));
      formData.set("archived", String(archived));

      for (const tagId of tagIds) {
        formData.append("tagIds", tagId);
      }
      for (const fileId of fileIds) {
        formData.append("fileIds", fileId);
      }

      startTransition(async () => {
        await updateDiaryAction(formData);
        setSavedAt(new Date());
      });
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [
    archived,
    contentMarkdown,
    diary.id,
    favorite,
    fileIds,
    mood,
    tagIds,
    title,
    weather,
  ]);

  return (
    <section className="grid min-h-[calc(100vh-8rem)] min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 rounded-xl border border-line bg-panel p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted">{formatDate(diary.diaryDate)}</p>
            <p className="mt-1 text-xs text-muted">
              {isPending
                ? t("common.saving")
                : savedAt
                  ? t("common.saved")
                  : t("common.autoSave")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                checked={favorite}
                onChange={(event) => setFavorite(event.target.checked)}
                type="checkbox"
              />
              {t("common.favorite")}
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                checked={archived}
                onChange={(event) => setArchived(event.target.checked)}
                type="checkbox"
              />
              {t("common.archived")}
            </label>
            <form action={deleteDiaryAction}>
              <input name="id" type="hidden" value={diary.id} />
              <Button type="submit" variant="ghost">
                {t("common.delete")}
              </Button>
            </form>
          </div>
        </div>

        <input
          className="mt-4 w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted sm:text-3xl"
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("diary.untitled")}
          value={title}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            onChange={(event) => setMood(event.target.value)}
            placeholder={t("diary.mood")}
            value={mood}
          />
          <input
            className="min-h-11 rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
            onChange={(event) => setWeather(event.target.value)}
            placeholder={t("diary.weather")}
            value={weather}
          />
        </div>

        <div className="mt-4 space-y-3 rounded-xl border border-line bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{t("common.tags")}</p>
            <Link className="text-xs text-muted underline" href="/tags">
              {t("common.manage")}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-xs text-muted">{t("diary.tagsEmpty")}</p>
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
        </div>

        <div className="mt-4 space-y-3 rounded-xl border border-line bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{t("common.files")}</p>
            <Link className="text-xs text-muted underline" href="/files">
              {t("common.manageFiles")}
            </Link>
          </div>
          {fileOptions.length === 0 ? (
            <p className="text-xs text-muted">{t("diary.uploadFilesHint")}</p>
          ) : (
            <div className="grid max-h-40 gap-2 overflow-y-auto pr-1">
              {fileOptions.map((file) => {
                const selected = fileIds.includes(file.id);

                return (
                  <label
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-2.5 py-2 text-xs"
                    key={file.id}
                  >
                    <input
                      checked={selected}
                      onChange={() =>
                        setFileIds((current) =>
                          selected
                            ? current.filter((fileId) => fileId !== file.id)
                            : [...current, file.id],
                        )
                      }
                      type="checkbox"
                    />
                    <span className="min-w-0 flex-1 truncate">{file.filename}</span>
                    <span className="text-muted">{formatFileSize(file.size)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <textarea
          className="mt-4 min-h-[22rem] w-full resize-none rounded-lg border border-line bg-background px-4 py-3 font-mono text-base leading-7 outline-none ring-accent/20 focus:ring-4 sm:min-h-[28rem] sm:text-sm"
          onChange={(event) => setContentMarkdown(event.target.value)}
          placeholder={t("diary.writePlaceholder")}
          value={contentMarkdown}
        />
      </div>

      <div className="min-w-0 space-y-4 rounded-xl border border-line bg-panel p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted">{t("common.preview")}</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <TagChip color={tag.color} key={tag.id} name={tag.name} />
            ))}
          </div>
        </div>

        <article className="prose prose-sm max-w-none overflow-hidden text-foreground prose-headings:text-foreground prose-p:text-muted prose-strong:text-foreground prose-code:text-foreground prose-a:text-accent">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentMarkdown || t("documents.nothingPreview")}
          </ReactMarkdown>
        </article>

        {selectedFiles.length > 0 || attachedFiles.length > 0 ? (
          <section className="border-t border-line pt-4">
            <p className="text-sm font-medium">{t("common.files")}</p>
            <div className="mt-3 grid gap-2">
              {(selectedFiles.length > 0 ? selectedFiles : attachedFiles).map((file) => (
                <a
                  className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-line bg-background px-3 py-2 text-sm hover:bg-panel"
                  href={`/api/files/${file.id}/download`}
                  key={file.id}
                >
                  <span className="min-w-0 truncate">{file.filename}</span>
                  <span className="shrink-0 text-xs text-muted">{formatFileSize(file.size)}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
