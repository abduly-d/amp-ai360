import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 100);
  try {
    const entries = await (await getStore()).audit(Number.isFinite(limit) ? limit : 100);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ entries: [], warning: "The audit log could not be read." });
  }
}
