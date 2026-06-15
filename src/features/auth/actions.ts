"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/server";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  let user;

  try {
    user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      where: { role: "OWNER" },
    });
  } catch {
    redirect("/login?error=database");
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }

  const token = await createSessionToken({
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    userId: user.id,
  });

  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
