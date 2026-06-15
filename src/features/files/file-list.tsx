import Link from "next/link";
import { T } from "@/components/i18n/text";
import { Button } from "@/components/ui/button";
import { TagCheckboxes } from "@/features/tags/tag-checkboxes";
import { TagChip } from "@/features/tags/tag-chip";
import { deleteFileAction, renameFileAction, updateFileTagsAction } from "@/features/files/actions";
import { FilePreview } from "@/features/files/file-preview";
import { formatFileSize } from "@/features/files/types";
import type { EntityTag } from "@/features/tags/utils";
import { cn } from "@/lib/utils";

type FileItem = {
  createdAt: Date;
  filename: string;
  id: string;
  mimeType: string;
  originalName: string;
  size: bigint;
  updatedAt: Date;
};

type TagOption = {
  color: string;
  id: string;
  name: string;
  type: "GLOBAL" | "TODO" | "NOTE" | "DIARY" | "FILE";
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function FileList({
  fileTags,
  files,
  selectedFile,
  tagOptions,
}: {
  fileTags: Map<string, EntityTag[]>;
  files: FileItem[];
  selectedFile: FileItem | null;
  tagOptions: TagOption[];
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[22rem_1fr]">
      <aside className="space-y-2 rounded-lg border border-line bg-panel p-3">
        {files.length === 0 ? (
          <p className="p-3 text-sm text-muted">
            <T k="files.empty" />
          </p>
        ) : (
          files.map((file) => {
            const active = selectedFile?.id === file.id;
            const tags = fileTags.get(file.id) ?? [];

            return (
              <Link
                className={cn(
                  "block rounded-md border p-3 text-sm transition-colors",
                  active
                    ? "border-accent bg-background text-foreground"
                    : "border-line text-muted hover:bg-background hover:text-foreground",
                )}
                href={`/files?id=${file.id}`}
                key={file.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.filename}</p>
                    <p className="mt-1 text-xs">{formatFileSize(file.size)}</p>
                  </div>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px]">
                    {file.mimeType.split("/").at(-1)}
                  </span>
                </div>
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
      </aside>

      {selectedFile ? (
        <article className="space-y-4 rounded-lg border border-line bg-panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold">{selectedFile.filename}</h2>
              <p className="mt-2 text-sm text-muted">
                {formatFileSize(selectedFile.size)} · {selectedFile.mimeType} ·{" "}
                <T k="common.uploaded" />{" "}
                {formatDate(selectedFile.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-panel px-4 text-sm font-medium text-foreground transition-colors hover:bg-background"
                href={`/api/files/${selectedFile.id}/download`}
              >
                <T k="common.download" />
              </a>
              <form action={deleteFileAction}>
                <input name="id" type="hidden" value={selectedFile.id} />
                <Button type="submit" variant="ghost">
                  <T k="common.delete" />
                </Button>
              </form>
            </div>
          </div>

          <FilePreview file={selectedFile} />

          <div className="grid gap-4 lg:grid-cols-2">
            <form action={renameFileAction} className="rounded-md border border-line p-4">
              <input name="id" type="hidden" value={selectedFile.id} />
              <label className="text-sm font-medium" htmlFor="filename">
                <T k="files.rename" />
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  className="h-10 min-w-0 flex-1 rounded-md border border-line bg-background px-3 text-sm"
                  defaultValue={selectedFile.filename}
                  id="filename"
                  name="filename"
                  required
                />
                <Button type="submit">
                  <T k="common.save" />
                </Button>
              </div>
            </form>

            <form action={updateFileTagsAction} className="rounded-md border border-line p-4">
              <input name="id" type="hidden" value={selectedFile.id} />
              <p className="text-sm font-medium">
                <T k="common.tags" />
              </p>
              <div className="mt-3">
                <TagCheckboxes
                  selectedIds={(fileTags.get(selectedFile.id) ?? []).map((tag) => tag.id)}
                  tags={tagOptions}
                />
              </div>
              <div className="mt-3">
                <Button type="submit">
                  <T k="files.saveTags" />
                </Button>
              </div>
            </form>
          </div>
        </article>
      ) : (
        <section className="rounded-lg border border-line bg-panel p-6 text-sm text-muted">
          <T k="files.select" />
        </section>
      )}
    </section>
  );
}
