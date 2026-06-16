"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/server";
import { env } from "@/lib/config/env";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function getSafeNextPath(value: FormDataEntryValue | null) {
  const next = String(value ?? "").trim();

  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

async function createUserSession(user: {
  displayName: string;
  email: string;
  id: string;
  role: "OWNER" | "VIEWER";
}) {
  const token = await createSessionToken({
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    userId: user.id,
  });

  await setSessionCookie(token);
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(formData.get("next"));
  let user;

  if (!email || !password) {
    redirect("/login?error=invalid");
  }

  try {
    user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
  } catch {
    redirect("/login?error=database");
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }

  await createUserSession(user);
  redirect(nextPath);
}

export async function registerAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();

  if (!env.INVITE_CODE) {
    redirect("/register?error=invite-unconfigured");
  }

  if (inviteCode !== env.INVITE_CODE) {
    redirect("/register?error=invite-invalid");
  }

  if (!email || !displayName) {
    redirect("/register?error=missing-fields");
  }

  if (password.length < 8) {
    redirect("/register?error=password-short");
  }

  if (password !== confirmPassword) {
    redirect("/register?error=password-mismatch");
  }

  const existingUser = await prisma.user.findFirst({
    select: { id: true },
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });

  if (existingUser) {
    redirect("/register?error=email-exists");
  }

  const user = await prisma.user.create({
    data: {
      displayName,
      email,
      passwordHash: await hashPassword(password),
      role: "VIEWER",
    },
  });

  await createUserSession(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
