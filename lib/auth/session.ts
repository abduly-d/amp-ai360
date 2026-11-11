import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "amp_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  name: string;
  exp: number;
}

export function editingConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.EDITOR_PASSWORD);
}

export function sessionSecret(env: NodeJS.ProcessEnv = process.env): string {
  return env.SESSION_SECRET || env.EDITOR_PASSWORD || "";
}

export function signSession(payload: SessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function createSession(name: string, secret: string, now = Date.now()): string {
  const clean = name.replace(/[\r\n\t]/g, " ").trim().slice(0, 80);
  if (!clean) throw new Error("Display name is required");
  if (!secret) throw new Error("Editing is disabled");
  return signSession({ name: clean, exp: now + MAX_AGE_MS }, secret);
}

export function verifySession(token: string | undefined | null, secret: string, now = Date.now()): SessionPayload | null {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload?.name || typeof payload.exp !== "number") return null;
    if (payload.exp < now) return null;
    return { name: String(payload.name).slice(0, 80), exp: payload.exp };
  } catch {
    return null;
  }
}

export function passwordsMatch(input: string, expected: string): boolean {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (!expected || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
