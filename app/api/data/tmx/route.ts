import { NextRequest, NextResponse } from "next/server";
import { TMX_BOARD, TMX_META, tmxTotals, TmxQuote } from "@/lib/data/tmx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Attempt a live TMX feed when configured (data-sharing MOU / OTS gateway).
// Expected to return an array of quotes matching the TmxQuote shape.
async function tryTmxFeed(): Promise<TmxQuote[] | null> {
  const base = process.env.TMX_API_BASE_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/market/board`, {
      headers: {
        ...(process.env.TMX_API_KEY ? { authorization: `Bearer ${process.env.TMX_API_KEY}` } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // A real integration maps the TMX payload into TmxQuote[] here.
    return Array.isArray(data?.board) ? (data.board as TmxQuote[]) : null;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest) {
  const liveBoard = await tryTmxFeed();
  const board = liveBoard ?? TMX_BOARD;
  const live = liveBoard != null;

  return NextResponse.json({
    source: live ? "TMX_LIVE" : "TMX_INDICATIVE",
    live,
    fetchedAt: new Date().toISOString(),
    meta: TMX_META,
    totals: tmxTotals(board),
    board,
  });
}
