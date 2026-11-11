import { NextRequest, NextResponse } from "next/server";
import { localAnalyze, llmAnalyze, type AnalysisContext } from "@/lib/ai/engine";
import { liveFacts } from "@/lib/domain/snapshot";
import { loadSnapshot } from "@/lib/store";

async function contextFor(): Promise<AnalysisContext> {
  try {
    const snapshot = await loadSnapshot();
    return {
      preferLive: true,
      flagships: snapshot.flagships,
      kpis: snapshot.kpis,
      caadp: snapshot.caadp,
      liveFacts: liveFacts(snapshot),
    };
  } catch {
    return { preferLive: false };
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let query = "";
  try {
    const body = await req.json();
    query = (body?.query ?? body?.q ?? "").toString().trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ error: "Missing 'query'" }, { status: 400 });
  }

  const ctx = await contextFor();
  const llm = await llmAnalyze(query, ctx);
  const result = llm ?? localAnalyze(query, ctx);
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ error: "Missing 'q'" }, { status: 400 });
  const ctx = await contextFor();
  return NextResponse.json(localAnalyze(q, ctx));
}
