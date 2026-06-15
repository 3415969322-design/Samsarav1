import type { SearchItem } from "@/lib/search/types";
import { prisma } from "@/lib/db/prisma";

export async function searchWorkspace({
  query,
  userId,
}: {
  query: string;
  userId: string;
}): Promise<SearchItem[]> {
  const q = query.trim();

  if (!q) {
    return [];
  }

  const [todos, documents, diaries, files] = await Promise.all([
    prisma.todo.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 20,
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
    }),
    prisma.note.findMany({
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      take: 20,
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { contentText: { contains: q, mode: "insensitive" } },
        ],
      },
    }),
    prisma.diary.findMany({
      orderBy: [{ favorite: "desc" }, { diaryDate: "desc" }],
      take: 20,
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { contentText: { contains: q, mode: "insensitive" } },
          { mood: { contains: q, mode: "insensitive" } },
          { weather: { contains: q, mode: "insensitive" } },
        ],
      },
    }),
    prisma.fileAsset.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      where: {
        userId,
        OR: [
          { filename: { contains: q, mode: "insensitive" } },
          { originalName: { contains: q, mode: "insensitive" } },
          { mimeType: { contains: q, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  return [
    ...todos.map<SearchItem>((todo) => ({
      excerpt: todo.description ?? undefined,
      href: `/todos?q=${encodeURIComponent(q)}`,
      id: todo.id,
      title: todo.title,
      type: "todo",
      updatedAt: todo.updatedAt,
    })),
    ...documents.map<SearchItem>((document) => ({
      excerpt: document.contentText.slice(0, 160),
      href: `/documents?id=${document.id}&q=${encodeURIComponent(q)}`,
      id: document.id,
      title: document.title,
      type: "document",
      updatedAt: document.updatedAt,
    })),
    ...diaries.map<SearchItem>((diary) => ({
      excerpt: diary.contentText.slice(0, 160),
      href: `/diary?id=${diary.id}&q=${encodeURIComponent(q)}`,
      id: diary.id,
      title: diary.title,
      type: "diary",
      updatedAt: diary.updatedAt,
    })),
    ...files.map<SearchItem>((file) => ({
      excerpt: `${file.mimeType} · ${file.originalName}`,
      href: `/files?id=${file.id}&q=${encodeURIComponent(q)}`,
      id: file.id,
      title: file.filename,
      type: "file",
      updatedAt: file.updatedAt,
    })),
  ].sort((a, b) => {
    const aTime = a.updatedAt?.getTime() ?? 0;
    const bTime = b.updatedAt?.getTime() ?? 0;

    return bTime - aTime;
  });
}
