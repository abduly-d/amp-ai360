import { NextRequest, NextResponse } from "next/server";
import { AMP_KPIS, AMP_HEADLINES } from "@/lib/data/amp-targets";
import {
  OPEN_DATA_SNAPSHOT,
  WB_INDICATORS,
  formatWbValue,
  OpenSignal,
} from "@/lib/data/open-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SourceTier = "GOV_API" | "WORLD_BANK" | "AMP_GROUND_TRUTH";

// Tier-1: live government APIs (NBS / TMX / TRA). Requires GOV_API_BASE_URL.
async function tryGovApi(): Promise<boolean> {
  const base = process.env.GOV_API_BASE_URL;
  if (!base) return false;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/agriculture/metrics`, {
      headers: {
        ...(process.env.NBS_API_KEY ? { "x-nbs-key": process.env.NBS_API_KEY } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return false;
    await res.json();
    return true;
  } catch {
    return false;
  }
}

// Tier-2: World Bank open-data. Fetch the most-recent value for each indicator.
async function fetchWorldBank(): Promise<OpenSignal[] | null> {
  try {
    const results = await Promise.all(
      WB_INDICATORS.map(async (code) => {
        const url = `https://api.worldbank.org/v2/country/TZA/indicator/${code}?format=json&mrnev=1`;
        const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(4500) });
        if (!res.ok) return null;
        const data = await res.json();
        const row = Array.isArray(data?.[1])
          ? data[1].find((d: any) => d?.value != null)
          : null;
        if (!row) return null;
        const snap = OPEN_DATA_SNAPSHOT.find((s) => s.code === code)!;
        const value = Number(row.value);
        return {
          ...snap,
          value,
          valueLabel: formatWbValue(code, value),
          year: Number(row.date),
        } as OpenSignal;
      })
    );
    const ok = results.filter((r): r is OpenSignal => r !== null);
    // Require a solid majority of indicators to consider the live feed healthy.
    return ok.length >= Math.ceil(WB_INDICATORS.length * 0.6) ? mergeWithSnapshot(ok) : null;
  } catch {
    return null;
  }
}

// Fill any indicator the live call missed from the snapshot, preserving order.
function mergeWithSnapshot(live: OpenSignal[]): OpenSignal[] {
  return OPEN_DATA_SNAPSHOT.map((s) => live.find((l) => l.code === s.code) ?? s);
}

export async function GET(_req: NextRequest) {
  // Priority hierarchy: Gov API → World Bank open data → AMP ground-truth.
  let source: SourceTier = "AMP_GROUND_TRUTH";
  let signals: OpenSignal[] = OPEN_DATA_SNAPSHOT;
  let live = false;

  if (await tryGovApi()) {
    source = "GOV_API";
  } else {
    const wb = await fetchWorldBank();
    if (wb) {
      source = "WORLD_BANK";
      signals = wb;
      live = true;
    }
  }

  return NextResponse.json({
    source,
    live,
    fetchedAt: new Date().toISOString(),
    signals,
    headlines: AMP_HEADLINES,
    kpis: AMP_KPIS,
    tiers: [
      { tier: 1, name: "GOV_API", detail: "NBS / TMX / TRA live endpoints", active: source === "GOV_API" },
      { tier: 2, name: "WORLD_BANK", detail: "World Bank Indicators API · FAOSTAT · WFP VAM", active: source === "WORLD_BANK" },
      { tier: 3, name: "AMP_GROUND_TRUTH", detail: "AMP 2050 static baseline + open-data snapshot", active: source === "AMP_GROUND_TRUTH" },
    ],
  });
}
