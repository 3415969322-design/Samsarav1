export const sessionCookieName = "samsara_session";
export const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export type SessionPayload = {
  userId: string;
  email: string;
  displayName: string;
  role: "OWNER" | "VIEWER";
  expiresAt: number;
};

function getSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }

  return "samsara-development-session-secret-change-before-production";
}

function encodeBase64Url(input: string | ArrayBuffer) {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeBase64Url(input: string) {
  const base64 = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );

  return encodeBase64Url(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );
}

export async function createSessionToken(
  payload: Omit<SessionPayload, "expiresAt">,
) {
  const sessionPayload: SessionPayload = {
    ...payload,
    expiresAt: Date.now() + sessionMaxAgeSeconds * 1000,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(sessionPayload));
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || signature !== (await sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;

    if (!payload.userId || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
