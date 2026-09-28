import { NextRequest, NextResponse } from "next/server";
import { retrieve } from "@/lib/ai/retrieval";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hybrid document search over AMP 2050 + CAADP indexed chunks.
function handle(query: string, k: number) {
  const results = retrieve(query, k).map((c) => ({
    id: c.id,
    source: c.source,
    section: c.section,
    title: c.title,
    snippet: c.text,
    tags: c.tags,
    score: Number(c.score.toFixed(2)),
  }));
  return { query, count: results.length, results };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const k = Number(req.nextUrl.searchParams.get("k") ?? 5);
  if (!q) return NextResponse.json({ error: "Missing 'q'" }, { status: 400 });
  return NextResponse.json(handle(q, k));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const q = (body?.query ?? body?.q ?? "").toString().trim();
    const k = Number(body?.k ?? 5);
    if (!q) return NextResponse.json({ error: "Missing 'query'" }, { status: 400 });
    return NextResponse.json(handle(q, k));
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
