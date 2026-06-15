"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { markdownToPlainText } from "@/lib/markdown/text";
import { normalizeTagIds, replaceEntityTags } from "@/features/tags/utils";

export async function createDocumentAction(formData: FormData) {
  const session = await requireSession();
  const title = String(formData.get("title") ?? "Untitled").trim() || "Untitled";
  const contentMarkdown = String(formData.get("contentMarkdown") ?? "");
  const document = await prisma.note.create({
    data: {
      contentMarkdown,
      contentText: markdownToPlainText(contentMarkdown),
      title,
      userId: session.userId,
    },
  });

  revalidatePath("/documents");
  redirect(`/documents?id=${document.id}`);
}

export async function updateDocumentAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim() || "Untitled";
  const contentMarkdown = String(formData.get("contentMarkdown") ?? "");

  if (!id) {
    return;
  }

  await prisma.note.update({
    data: {
      archived: formData.get("archived") === "true",
      contentMarkdown,
      contentText: markdownToPlainText(contentMarkdown),
      pinned: formData.get("pinned") === "true",
      title,
    },
    where: {
      id,
      userId: session.userId,
    },
  });

  await replaceEntityTags({
    entityId: id,
    entityType: "NOTE",
    tagIds: normalizeTagIds(formData),
    userId: session.userId,
  });

  revalidatePath("/documents");
}

export async function deleteDocumentAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.$transaction([
    prisma.tagOnEntity.deleteMany({
      where: {
        entityId: id,
        entityType: "NOTE",
      },
    }),
    prisma.note.delete({
      where: {
        id,
        userId: session.userId,
      },
    }),
  ]);

  revalidatePath("/documents");
  redirect("/documents");
}
