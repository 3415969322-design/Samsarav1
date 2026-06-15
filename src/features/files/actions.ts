"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { storageProvider } from "@/lib/storage";
import { isSupportedFile } from "@/features/files/types";
import { normalizeTagIds, replaceEntityTags } from "@/features/tags/utils";

function getStorageProviderEnum() {
  switch (storageProvider.name) {
    case "local":
      return "LOCAL" as const;
    case "r2":
      return "R2" as const;
    case "s3":
      return "S3" as const;
    case "supabase":
      return "SUPABASE" as const;
  }
}

export async function uploadFileAction(formData: FormData) {
  const session = await requireSession();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/files?error=missing-file");
  }

  if (!isSupportedFile(file.name, file.type)) {
    redirect("/files?error=unsupported-type");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const storedObject = await storageProvider.upload({
    contentType: file.type || "application/octet-stream",
    data: bytes,
    filename: file.name,
    visibility: "private",
  });
  const fileAsset = await prisma.fileAsset.create({
    data: {
      checksum,
      filename: String(formData.get("filename") ?? "").trim() || file.name,
      metadataJson: {
        uploadedVia: "files-module",
      },
      mimeType: file.type || "application/octet-stream",
      originalName: file.name,
      size: BigInt(file.size),
      storageKey: storedObject.key,
      storageProvider: getStorageProviderEnum(),
      userId: session.userId,
      visibility: "PRIVATE",
    },
  });

  await replaceEntityTags({
    entityId: fileAsset.id,
    entityType: "FILE",
    tagIds: normalizeTagIds(formData),
    userId: session.userId,
  });

  revalidatePath("/files");
  redirect(`/files?id=${fileAsset.id}`);
}

export async function renameFileAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const filename = String(formData.get("filename") ?? "").trim();

  if (!id || !filename) {
    redirect("/files?error=invalid");
  }

  await prisma.fileAsset.update({
    data: { filename },
    where: {
      id,
      userId: session.userId,
    },
  });

  revalidatePath("/files");
}

export async function updateFileTagsAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const exists = await prisma.fileAsset.findFirst({
    select: { id: true },
    where: {
      id,
      userId: session.userId,
    },
  });

  if (!exists) {
    return;
  }

  await replaceEntityTags({
    entityId: id,
    entityType: "FILE",
    tagIds: normalizeTagIds(formData),
    userId: session.userId,
  });

  revalidatePath("/files");
}

export async function deleteFileAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const file = await prisma.fileAsset.findFirst({
    where: {
      id,
      userId: session.userId,
    },
  });

  if (!file) {
    return;
  }

  await storageProvider.delete(file.storageKey);
  await prisma.$transaction([
    prisma.tagOnEntity.deleteMany({
      where: {
        entityId: id,
        entityType: "FILE",
      },
    }),
    prisma.fileOnEntity.deleteMany({
      where: {
        fileId: id,
      },
    }),
    prisma.fileAsset.delete({
      where: {
        id,
        userId: session.userId,
      },
    }),
  ]);

  revalidatePath("/files");
  redirect("/files");
}
