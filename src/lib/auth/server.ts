import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  sessionCookieName,
  sessionMaxAgeSeconds,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session";

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
