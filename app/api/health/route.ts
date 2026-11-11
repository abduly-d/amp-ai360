import { NextResponse } from "next/server";
import { editingConfigured } from "@/lib/auth/session";
import { providerChain } from "@/lib/ai/providers";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await getStore();
  let counts: Record<string, number> | null = null;
  try {
    counts = await store.counts();
  } catch (error) {
    console.error(error);
    counts = null;
  }
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    db: {
      mode: store.mode,
      ok: store.dbOk && counts !== null,
      warning: store.warning,
      counts,
    },
    ai: {
      requested: process.env.AI_PROVIDER || null,
      chain: providerChain(),
      configured: {
        pawa: Boolean(process.env.PAWA_AI_API_KEY),
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
      },
      pawaModel: process.env.PAWA_MODEL || "pawa-v1-blaze-20250318",
      fallback: "local-rag",
    },
    editing: { enabled: editingConfigured() },
  });
}
