"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TagType } from "@/generated/prisma/enums";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

const allowedTagTypes: TagType[] = ["GLOBAL", "TODO", "NOTE", "DIARY", "FILE"];

function parseTagType(value: FormDataEntryValue | null): TagType {
  const type = String(value ?? "GLOBAL") as TagType;

  return allowedTagTypes.includes(type) ? type : "GLOBAL";
}

function normalizeColor(value: FormDataEntryValue | null) {
  const color = String(value ?? "#2563eb");

  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#2563eb";
}

export async function createTagAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect("/tags?error=missing-name");
  }

  await prisma.tag.upsert({
    create: {
      color: normalizeColor(formData.get("color")),
      name,
      type: parseTagType(formData.get("type")),
      userId: session.userId,
    },
    update: {
      color: normalizeColor(formData.get("color")),
    },
    where: {
      userId_name_type: {
        name,
        type: parseTagType(formData.get("type")),
        userId: session.userId,
      },
    },
  });

  revalidatePath("/tags");
  revalidatePath("/todos");
  revalidatePath("/documents");
  revalidatePath("/diary");
  revalidatePath("/files");
}

export async function updateTagAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!id || !name) {
    redirect("/tags?error=invalid");
  }

  await prisma.tag.update({
    data: {
      color: normalizeColor(formData.get("color")),
      name,
      type: parseTagType(formData.get("type")),
    },
    where: {
      id,
      userId: session.userId,
    },
  });

  revalidatePath("/tags");
  revalidatePath("/todos");
  revalidatePath("/documents");
  revalidatePath("/diary");
  revalidatePath("/files");
}

export async function deleteTagAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.tag.delete({
    where: {
      id,
      userId: session.userId,
    },
  });

  revalidatePath("/tags");
  revalidatePath("/todos");
  revalidatePath("/documents");
  revalidatePath("/diary");
  revalidatePath("/files");
}
