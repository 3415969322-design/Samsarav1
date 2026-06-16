import Link from "next/link";
import { uploadFileAction } from "@/features/files/actions";
import { FileList } from "@/features/files/file-list";
import { supportedExtensions } from "@/features/files/types";
import { TagCheckboxes } from "@/features/tags/tag-checkboxes";
import { getTagsForEntities } from "@/features/tags/utils";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { T } from "@/components/i18n/text";
import { TranslatedInput, TranslatedSelect } from "@/components/i18n/translated-controls";
import { Button } from "@/components/ui/button";

export default async function FilesPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string; q?: string; type?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const q = (params?.q ?? "").trim();
  const type = (params?.type ?? "all").trim();
  const typeWhere =
    type === "images"
      ? { mimeType: { startsWith: "image/" } }
      : type === "pdf"
        ? { mimeType: "application/pdf" }
        : type === "documents"
          ? {
              OR: [
                { mimeType: { contains: "word", mode: "insensitive" as const } },
                { mimeType: { contains: "excel", mode: "insensitive" as const } },
                { mimeType: { contains: "spreadsheet", mode: "insensitive" as const } },
                { mimeType: { contains: "powerpoint", mode: "insensitive" as const } },
                { mimeType: { contains: "presentation", mode: "insensitive" as const } },
                { mimeType: { in: ["text/markdown", "text/plain"] } },
              ],
            }
          : type === "archives"
            ? { mimeType: { contains: "zip", mode: "insensitive" as const } }
            : {};
  const [files, tagOptions] = await Promise.all([
    prisma.fileAsset.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        userId: session.userId,
        ...typeWhere,
        ...(q
          ? {
              OR: [
                { filename: { contains: q, mode: "insensitive" as const } },
                { originalName: { contains: q, mode: "insensitive" as const } },
                { mimeType: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    }),
    prisma.tag.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      where: {
        userId: session.userId,
        type: { in: ["GLOBAL", "FILE"] },
      },
    }),
  ]);
  const selectedFile =
    files.find((file) => file.id === params?.id) ?? files[0] ?? null;
  const fileTags = await getTagsForEntities(
    "FILE",
    files.map((file) => file.id),
    session.userId,
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
              <T k="files.title" />
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              <T k="files.description" />
            </p>
          </div>
          <Link className="text-sm text-muted underline" href="/tags">
            <T k="common.manageTags" />
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-4">
        <form action={uploadFileAction} className="grid gap-3" encType="multipart/form-data">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
            <input
              className="h-11 rounded-md border border-line bg-background px-3 py-2 text-sm"
              name="file"
              required
              type="file"
              accept={supportedExtensions.join(",")}
            />
            <TranslatedInput
              className="h-11 rounded-md border border-line bg-background px-3 text-sm"
              name="filename"
              placeholderKey="files.optionalName"
            />
          </div>
          <TagCheckboxes tags={tagOptions} />
          <div>
            <Button type="submit" variant="primary">
              <T k="files.upload" />
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-line bg-panel p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_12rem_auto]">
          <TranslatedInput
            className="h-10 rounded-md border border-line bg-background px-3 text-sm"
            defaultValue={q}
            name="q"
            placeholderKey="files.search"
          />
          <TranslatedSelect
            className="h-10 rounded-md border border-line bg-background px-3 text-sm"
            defaultValue={type}
            name="type"
            options={[
              { value: "all", labelKey: "files.all" },
              { value: "images", labelKey: "files.images" },
              { value: "pdf", labelKey: "files.pdf" },
              { value: "documents", labelKey: "files.documents" },
              { value: "archives", labelKey: "files.archives" },
            ]}
          />
          <Button type="submit">
            <T k="common.apply" />
          </Button>
        </form>
      </section>

      <FileList
        fileTags={fileTags}
        files={files}
        selectedFile={selectedFile}
        tagOptions={tagOptions}
      />
    </div>
  );
}
