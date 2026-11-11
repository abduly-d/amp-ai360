import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, editingConfigured, sessionSecret, verifySession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = verifySession(req.cookies.get(SESSION_COOKIE)?.value, sessionSecret());
  return NextResponse.json({
    editingEnabled: editingConfigured(),
    name: session?.name ?? null,
    role: session ? "editor" : "viewer",
  });
}
