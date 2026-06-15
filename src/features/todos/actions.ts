"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Priority, TodoStatus } from "@/generated/prisma/enums";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { normalizeTagIds, replaceEntityTags } from "@/features/tags/utils";

const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];

function parsePriority(value: FormDataEntryValue | null): Priority {
  const priority = String(value ?? "MEDIUM") as Priority;

  return priorities.includes(priority) ? priority : "MEDIUM";
}

function parseDueAt(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "");

  return rawValue ? new Date(`${rawValue}T12:00:00`) : null;
}

function getTodoPath(formData: FormData) {
  return String(formData.get("returnTo") ?? "/todos");
}

export async function createTodoAction(formData: FormData) {
  const session = await requireSession();
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    redirect("/todos?error=missing-title");
  }

  const todo = await prisma.todo.create({
    data: {
      description: String(formData.get("description") ?? "").trim() || null,
      dueAt: parseDueAt(formData.get("dueAt")),
      priority: parsePriority(formData.get("priority")),
      title,
      userId: session.userId,
    },
  });

  await replaceEntityTags({
    entityId: todo.id,
    entityType: "TODO",
    tagIds: normalizeTagIds(formData),
    userId: session.userId,
  });

  revalidatePath("/todos");
}

export async function updateTodoAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!id || !title) {
    redirect("/todos?error=invalid");
  }

  await prisma.todo.update({
    data: {
      description: String(formData.get("description") ?? "").trim() || null,
      dueAt: parseDueAt(formData.get("dueAt")),
      priority: parsePriority(formData.get("priority")),
      title,
    },
    where: {
      id,
      userId: session.userId,
    },
  });

  await replaceEntityTags({
    entityId: id,
    entityType: "TODO",
    tagIds: normalizeTagIds(formData),
    userId: session.userId,
  });

  revalidatePath("/todos");
}

export async function toggleTodoAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "OPEN") as TodoStatus;
  const nextDone = status !== "DONE";

  if (!id) {
    return;
  }

  await prisma.todo.update({
    data: {
      completedAt: nextDone ? new Date() : null,
      status: nextDone ? "DONE" : "OPEN",
    },
    where: {
      id,
      userId: session.userId,
    },
  });

  revalidatePath("/todos");
}

export async function deleteTodoAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.$transaction([
    prisma.tagOnEntity.deleteMany({
      where: {
        entityId: id,
        entityType: "TODO",
      },
    }),
    prisma.todo.delete({
      where: {
        id,
        userId: session.userId,
      },
    }),
  ]);

  revalidatePath(getTodoPath(formData));
}
