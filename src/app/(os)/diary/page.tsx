import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createDiaryAction } from "@/features/diary/actions";
import { DiaryEditor } from "@/features/diary/diary-editor";
import { getFilesForEntities } from "@/features/files/utils";
import { getTagsForEntities } from "@/features/tags/utils";
import { TagChip } from "@/features/tags/tag-chip";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { T } from "@/components/i18n/text";
import { TranslatedInput } from "@/components/i18n/translated-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getDateRange({
  date,
  month,
  year,
}: {
  date?: string;
  month?: string;
  year?: string;
}) {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { gte: start, lt: end };
  }

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    return { gte: start, lt: end };
  }

  if (year && /^\d{4}$/.test(year)) {
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCFullYear(end.getUTCFullYear() + 1);

    return { gte: start, lt: end };
  }

  return undefined;
}

function formatDiaryDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(value);
}

function buildDiaryHref({
  archived,
  date,
  id,
  month,
  q,
  year,
}: {
  archived: boolean;
  date?: string;
  id?: string;
  month?: string;
  q?: string;
  year?: string;
}) {
  const params = new URLSearchParams();

  if (id) {
    params.set("id", id);
  }
  if (q) {
    params.set("q", q);
  }
  if (date) {
    params.set("date", date);
  }
  if (month) {
    params.set("month", month);
  }
  if (year) {
    params.set("year", year);
  }
  if (archived) {
    params.set("archived", "true");
  }

  const query = params.toString();

  return query ? `/diary?${query}` : "/diary";
}

export default async function DiaryPage({
  searchParams,
}: {
  searchParams?: Promise<{
    archived?: string;
    date?: string;
    id?: string;
    month?: string;
    q?: string;
    year?: string;
  }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const q = (params?.q ?? "").trim();
  const showArchived = params?.archived === "true";
  const dateRange = getDateRange({
    date: params?.date,
    month: params?.month,
    year: params?.year,
  });
  const today = formatDateInput(new Date());

  const [diaries, timelineEntries, tagOptions, fileOptions] = await Promise.all([
    prisma.diary.findMany({
      orderBy: [{ favorite: "desc" }, { diaryDate: "desc" }, { updatedAt: "desc" }],
      where: {
        archived: showArchived,
        userId: session.userId,
        ...(dateRange ? { diaryDate: dateRange } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                { contentText: { contains: q, mode: "insensitive" as const } },
                { mood: { contains: q, mode: "insensitive" as const } },
                { weather: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    }),
    prisma.diary.findMany({
      orderBy: { diaryDate: "desc" },
      select: {
        archived: true,
        diaryDate: true,
        favorite: true,
        id: true,
      },
      where: {
        userId: session.userId,
      },
    }),
    prisma.tag.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      where: {
        type: { in: ["GLOBAL", "DIARY"] },
        userId: session.userId,
      },
    }),
    prisma.fileAsset.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        createdAt: true,
        filename: true,
        id: true,
        mimeType: true,
        originalName: true,
        size: true,
      },
      take: 100,
      where: {
        userId: session.userId,
      },
    }),
  ]);
  const selectedDiary =
    diaries.find((diary) => diary.id === params?.id) ?? diaries[0] ?? null;
  const diaryIds = diaries.map((diary) => diary.id);
  const [diaryTags, diaryFiles] = await Promise.all([
    getTagsForEntities("DIARY", diaryIds, session.userId),
    getFilesForEntities("DIARY", diaryIds, session.userId),
  ]);
  const selectedTagIds = selectedDiary
    ? (diaryTags.get(selectedDiary.id) ?? []).map((tag) => tag.id)
    : [];
  const selectedFileIds = selectedDiary
    ? (diaryFiles.get(selectedDiary.id) ?? []).map((file) => file.id)
    : [];

  const yearOptions = Array.from(
    new Set(timelineEntries.map((entry) => String(entry.diaryDate.getUTCFullYear()))),
  );
  const monthOptions = Array.from(
    new Set(
      timelineEntries.map((entry) =>
        `${entry.diaryDate.getUTCFullYear()}-${String(entry.diaryDate.getUTCMonth() + 1).padStart(2, "0")}`,
      ),
    ),
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground" href="/files">
              <T k="common.files" />
            </Link>
            <Link className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground" href="/tags">
              <T k="common.tags" />
            </Link>
          </div>
        }
        descriptionKey="diary.description"
        eyebrow="v1.0"
        titleKey="diary.title"
      />

      <section className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <SectionCard className="space-y-4">
          <form action={createDiaryAction} className="space-y-3">
            <input
              className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              defaultValue={today}
              name="diaryDate"
              type="date"
            />
            <TranslatedInput
              className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              name="title"
              placeholderKey="diary.newTitle"
            />
            <Button className="w-full" type="submit" variant="primary">
              <T k="diary.create" />
            </Button>
          </form>

          <form className="space-y-3">
            <TranslatedInput
              className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              defaultValue={q}
              name="q"
              placeholderKey="diary.search"
            />
            <input
              className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              defaultValue={params?.date ?? ""}
              name="date"
              type="date"
            />
            <input
              className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              defaultValue={params?.month ?? ""}
              name="month"
              type="month"
            />
            <TranslatedInput
              className="min-h-11 w-full rounded-lg border border-line bg-background px-3 text-base sm:text-sm"
              defaultValue={params?.year ?? ""}
              max="9999"
              min="1900"
              name="year"
              placeholderKey="diary.year"
              type="number"
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
            <div className="grid grid-cols-2 gap-2">
              <Button type="submit">
                <T k="common.filter" />
              </Button>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-panel px-4 text-sm font-medium text-foreground transition-colors hover:bg-background"
                href="/diary"
              >
                <T k="common.reset" />
              </Link>
            </div>
          </form>

          {yearOptions.length > 0 ? (
            <div className="space-y-3 border-t border-line pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                <T k="diary.browseYears" />
              </p>
              <div className="flex flex-wrap gap-2">
                {yearOptions.map((year) => (
                  <Link
                    className="rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:bg-background hover:text-foreground"
                    href={buildDiaryHref({ archived: showArchived, q, year })}
                    key={year}
                  >
                    {year}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {monthOptions.length > 0 ? (
            <div className="space-y-3 border-t border-line pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                <T k="diary.browseMonths" />
              </p>
              <div className="flex flex-wrap gap-2">
                {monthOptions.slice(0, 12).map((month) => (
                  <Link
                    className="rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:bg-background hover:text-foreground"
                    href={buildDiaryHref({ archived: showArchived, month, q })}
                    key={month}
                  >
                    {month}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2 border-t border-line pt-4">
            {diaries.length === 0 ? (
              <EmptyState className="py-6" textKey="diary.empty" />
            ) : (
              diaries.map((diary) => {
                const tags = diaryTags.get(diary.id) ?? [];
                const files = diaryFiles.get(diary.id) ?? [];
                const active = selectedDiary?.id === diary.id;

                return (
                  <Link
                    className={`block rounded-xl border p-3 text-sm transition-colors ${
                      active
                        ? "border-accent bg-background text-foreground"
                        : "border-line text-muted hover:bg-background hover:text-foreground"
                    }`}
                    href={buildDiaryHref({
                      archived: showArchived,
                      date: params?.date,
                      id: diary.id,
                      month: params?.month,
                      q,
                      year: params?.year,
                    })}
                    key={diary.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{diary.title}</p>
                        <p className="mt-1 text-xs">{formatDiaryDate(diary.diaryDate)}</p>
                      </div>
                      {diary.favorite ? (
                        <span className="text-xs">
                          <T k="common.favorite" />
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs">{diary.contentText}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {diary.mood ? <TagChip color="#8b5cf6" name={diary.mood} /> : null}
                      {diary.weather ? <TagChip color="#0ea5e9" name={diary.weather} /> : null}
                      {files.length > 0 ? (
                        <span className="rounded-full border border-line px-2 py-0.5 text-[10px]">
                          {files.length} files
                        </span>
                      ) : null}
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
          </div>
        </SectionCard>

        {selectedDiary ? (
          <DiaryEditor
            attachedFiles={diaryFiles.get(selectedDiary.id) ?? []}
            diary={selectedDiary}
            fileOptions={fileOptions}
            key={selectedDiary.id}
            selectedFileIds={selectedFileIds}
            selectedTagIds={selectedTagIds}
            tags={tagOptions}
          />
        ) : (
          <SectionCard>
            <EmptyState textKey="diary.createToStart" />
          </SectionCard>
        )}
      </section>
    </div>
  );
}
