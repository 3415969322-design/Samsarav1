"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeFileIds, replaceEntityFiles } from "@/features/files/utils";
import { normalizeTagIds, replaceEntityTags } from "@/features/tags/utils";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { markdownToPlainText } from "@/lib/markdown/text";

function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

function parseDiaryDate(value: FormDataEntryValue | null) {
  const input = String(value ?? todayDateInput());

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(`${todayDateInput()}T00:00:00.000Z`);
  }

  return new Date(`${input}T00:00:00.000Z`);
}

export async function createDiaryAction(formData: FormData) {
  const session = await requireSession();
  const diaryDate = parseDiaryDate(formData.get("diaryDate"));
  const existingDiary = await prisma.diary.findUnique({
    select: { id: true },
    where: {
      userId_diaryDate: {
        diaryDate,
        userId: session.userId,
      },
    },
  });

  if (existingDiary) {
    redirect(`/diary?id=${existingDiary.id}`);
  }

  const title =
    String(formData.get("title") ?? "").trim() ||
    `Journal ${diaryDate.toISOString().slice(0, 10)}`;
  const diary = await prisma.diary.create({
    data: {
      contentMarkdown: "",
      contentText: "",
      diaryDate,
      title,
      userId: session.userId,
    },
  });

  revalidatePath("/diary");
  redirect(`/diary?id=${diary.id}`);
}

export async function updateDiaryAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const existingDiary = await prisma.diary.findFirst({
    select: { id: true },
    where: {
      id,
      userId: session.userId,
    },
  });

  if (!existingDiary) {
    return;
  }

  const title = String(formData.get("title") ?? "").trim() || "Untitled journal";
  const contentMarkdown = String(formData.get("contentMarkdown") ?? "");

  await prisma.diary.update({
    data: {
      archived: formData.get("archived") === "true",
      contentMarkdown,
      contentText: markdownToPlainText(contentMarkdown),
      favorite: formData.get("favorite") === "true",
      mood: String(formData.get("mood") ?? "").trim() || null,
      title,
      weather: String(formData.get("weather") ?? "").trim() || null,
    },
    where: {
      id,
      userId: session.userId,
    },
  });

  await replaceEntityTags({
    entityId: id,
    entityType: "DIARY",
    tagIds: normalizeTagIds(formData),
    userId: session.userId,
  });
  await replaceEntityFiles({
    entityId: id,
    entityType: "DIARY",
    fileIds: normalizeFileIds(formData),
    userId: session.userId,
  });

  revalidatePath("/diary");
  revalidatePath("/search");
}

export async function deleteDiaryAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.$transaction([
    prisma.tagOnEntity.deleteMany({
      where: {
        entityId: id,
        entityType: "DIARY",
      },
    }),
    prisma.fileOnEntity.deleteMany({
      where: {
        entityId: id,
        entityType: "DIARY",
      },
    }),
    prisma.diary.delete({
      where: {
        id,
        userId: session.userId,
      },
    }),
  ]);

  revalidatePath("/diary");
  revalidatePath("/search");
  redirect("/diary");
}
