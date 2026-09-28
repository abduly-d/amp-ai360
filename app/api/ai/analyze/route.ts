import { NextRequest, NextResponse } from "next/server";
import { localAnalyze, llmAnalyze } from "@/lib/ai/engine";

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

  // Try live LLM (Anthropic/OpenAI) first; fall back to deterministic RAG.
  const llm = await llmAnalyze(query);
  const result = llm ?? localAnalyze(query);
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ error: "Missing 'q'" }, { status: 400 });
  return NextResponse.json(localAnalyze(q));
}
