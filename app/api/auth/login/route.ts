import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSession,
  editingConfigured,
  passwordsMatch,
  sessionSecret,
  verifySession,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!editingConfigured()) {
    return NextResponse.json(
      { error: "Editing is disabled. Set EDITOR_PASSWORD before editors can sign in." },
      { status: 403 }
    );
  }
  let password = "";
  let displayName = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
    displayName = String(body?.displayName ?? body?.name ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!passwordsMatch(password, process.env.EDITOR_PASSWORD || "")) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  try {
    const token = createSession(displayName, sessionSecret());
    const name = verifySession(token, sessionSecret())?.name ?? displayName;
    const res = NextResponse.json({ name, role: "editor" });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not sign in" }, { status: 400 });
  }
}
