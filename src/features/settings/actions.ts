"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

function settingRedirect(status: string) {
  redirect(`/settings?status=${encodeURIComponent(status)}`);
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireSession();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!displayName || !email) {
    settingRedirect("profile-invalid");
  }

  await prisma.user.update({
    data: {
      displayName,
      email,
    },
    where: {
      id: session.userId,
    },
  });

  revalidatePath("/settings");
  settingRedirect("profile-saved");
}

export async function updatePasswordAction(formData: FormData) {
  const session = await requireSession();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const nextPassword = String(formData.get("nextPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (nextPassword.length < 8 || nextPassword !== confirmPassword) {
    settingRedirect("password-invalid");
  }

  const user = await prisma.user.findUnique({
    select: { passwordHash: true },
    where: { id: session.userId },
  });

  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    settingRedirect("password-current-invalid");
  }

  await prisma.user.update({
    data: {
      passwordHash: await hashPassword(nextPassword),
    },
    where: {
      id: session.userId,
    },
  });

  settingRedirect("password-saved");
}

export async function updateThemeSettingAction(formData: FormData) {
  const session = await requireSession();
  const mode = String(formData.get("themeMode") ?? "light");
  const themeMode = mode === "dark" ? "dark" : "light";

  await prisma.setting.upsert({
    create: {
      key: "theme.mode",
      scope: "USER",
      userId: session.userId,
      valueJson: { mode: themeMode },
    },
    update: {
      valueJson: { mode: themeMode },
    },
    where: {
      userId_key: {
        key: "theme.mode",
        userId: session.userId,
      },
    },
  });

  revalidatePath("/settings");
  settingRedirect("theme-saved");
}
