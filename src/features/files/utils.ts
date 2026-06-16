import type { EntityType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";

export type EntityFile = {
  createdAt: Date;
  filename: string;
  id: string;
  mimeType: string;
  originalName: string;
  size: bigint;
};

export function normalizeFileIds(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll("fileIds")
        .map((fileId) => String(fileId))
        .filter(Boolean),
    ),
  );
}

export async function getFilesForEntities(
  entityType: EntityType,
  entityIds: string[],
  userId: string,
) {
  if (entityIds.length === 0) {
    return new Map<string, EntityFile[]>();
  }

  const links = await prisma.fileOnEntity.findMany({
    orderBy: { file: { filename: "asc" } },
    where: {
      entityId: { in: entityIds },
      entityType,
      file: {
        userId,
      },
    },
    select: {
      entityId: true,
      file: {
        select: {
          createdAt: true,
          filename: true,
          id: true,
          mimeType: true,
          originalName: true,
          size: true,
        },
      },
    },
  });
  const grouped = new Map<string, EntityFile[]>();

  for (const link of links) {
    grouped.set(link.entityId, [...(grouped.get(link.entityId) ?? []), link.file]);
  }

  return grouped;
}

export async function replaceEntityFiles({
  entityId,
  entityType,
  fileIds,
  userId,
}: {
  entityId: string;
  entityType: EntityType;
  fileIds: string[];
  userId: string;
}) {
  const validFiles = await prisma.fileAsset.findMany({
    select: { id: true },
    where: {
      id: { in: fileIds },
      userId,
    },
  });

  await prisma.fileOnEntity.deleteMany({
    where: {
      entityId,
      entityType,
      file: {
        userId,
      },
    },
  });

  if (validFiles.length === 0) {
    return;
  }

  await prisma.fileOnEntity.createMany({
    data: validFiles.map((file) => ({
      entityId,
      entityType,
      fileId: file.id,
    })),
    skipDuplicates: true,
  });
}

export async function deleteEntityFiles({
  entityId,
  entityType,
  userId,
}: {
  entityId: string;
  entityType: EntityType;
  userId: string;
}) {
  await prisma.fileOnEntity.deleteMany({
    where: {
      entityId,
      entityType,
      file: {
        userId,
      },
    },
  });
}

export async function deleteFileAttachmentLinks({
  fileId,
  userId,
}: {
  fileId: string;
  userId: string;
}) {
  await prisma.fileOnEntity.deleteMany({
    where: {
      fileId,
      file: {
        userId,
      },
    },
  });
}
