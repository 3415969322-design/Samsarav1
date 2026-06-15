import type { EntityType, TagType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";

export type EntityTag = {
  color: string;
  id: string;
  name: string;
  type: TagType;
};

export function normalizeTagIds(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll("tagIds")
        .map((tagId) => String(tagId))
        .filter(Boolean),
    ),
  );
}

export async function getTagsForEntities(
  entityType: EntityType,
  entityIds: string[],
) {
  if (entityIds.length === 0) {
    return new Map<string, EntityTag[]>();
  }

  const links = await prisma.tagOnEntity.findMany({
    orderBy: { tag: { name: "asc" } },
    where: {
      entityId: { in: entityIds },
      entityType,
    },
    select: {
      entityId: true,
      tag: {
        select: {
          color: true,
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });
  const grouped = new Map<string, EntityTag[]>();

  for (const link of links) {
    grouped.set(link.entityId, [...(grouped.get(link.entityId) ?? []), link.tag]);
  }

  return grouped;
}

export async function replaceEntityTags({
  entityId,
  entityType,
  tagIds,
  userId,
}: {
  entityId: string;
  entityType: EntityType;
  tagIds: string[];
  userId: string;
}) {
  const validTags = await prisma.tag.findMany({
    select: { id: true },
    where: {
      id: { in: tagIds },
      userId,
    },
  });

  await prisma.tagOnEntity.deleteMany({
    where: {
      entityId,
      entityType,
    },
  });

  if (validTags.length === 0) {
    return;
  }

  await prisma.tagOnEntity.createMany({
    data: validTags.map((tag) => ({
      entityId,
      entityType,
      tagId: tag.id,
    })),
    skipDuplicates: true,
  });
}
