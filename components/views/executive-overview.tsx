"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Database, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiGauge } from "@/components/kpi-gauge";
import { AMP_KPIS, AMP_HEADLINES, progressTo2030, KpiTarget } from "@/lib/data/amp-targets";
import { OpenSignal } from "@/lib/data/open-data";
import { signalsForYear, kpiOverridesForYear } from "@/lib/data/wb-hist";
import { BOT_MER } from "@/lib/data/bot-mer";
import type { AnalysisResult } from "@/lib/ai/types";

function KpiCard({ kpi }: { kpi: KpiTarget }) {
  const prog = progressTo2030(kpi);
  const good = kpi.betterDirection === "up";
  const color = prog >= 66 ? "#1EA84C" : prog >= 33 ? "#FCD116" : "#EF4444";
  const live = kpi.actualSource.startsWith("World Bank");
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <KpiGauge value={prog} color={color} label="to 2030" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold">{kpi.label}</p>
            {good ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-tz-green" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 text-tz-green" />
            )}
          </div>
          <p className="mt-0.5 text-lg font-bold">{kpi.currentLabel ?? kpi.baselineLabel}</p>
          <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
            <div className="flex justify-between gap-2">
              <span>Baseline {kpi.baselineYear}</span>
              <span className="font-medium text-foreground">{kpi.baselineLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>2030 Target</span>
              <span className="font-medium text-tz-blue">{kpi.target2030Label}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>2050 Vision</span>
              <span className="font-medium text-tz-green">{kpi.target2050Label}</span>
            </div>
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${live ? "bg-tz-green" : "bg-muted-foreground/50"}`}
            />
            {live ? "Actual" : "Est."} {kpi.actualYear} · {kpi.actualSource}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExecutiveOverview({ year }: { year?: number }) {
  const nowYear = new Date().getFullYear();
  year = year ?? nowYear;
  const [summary, setSummary] = useState<AnalysisResult | null>(null);
  const [signals, setSignals] = useState<OpenSignal[]>(() => signalsForYear(year));
  const [live, setLive] = useState(false);

  // Executive summary (once).
  useEffect(() => {
    fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query:
          "Give an executive summary of AMP 2050 progress toward Ag GDP, exports, income, growth and undernourishment and CAADP alignment.",
      }),
    })
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});
  }, []);

  // Year-driven signals from embedded history; refine the current year live.
  useEffect(() => {
    setSignals(signalsForYear(year));
    setLive(false);
    if (year >= nowYear) {
      fetch("/api/data/metrics")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.signals)) setSignals(d.signals);
          setLive(!!d.live);
        })
        .catch(() => {});
    }
  }, [year, nowYear]);

  // Apply the selected year's actuals to the KPI gauges.
  const overrides = kpiOverridesForYear(year);
  const kpisForYear: KpiTarget[] = AMP_KPIS.map((k) => {
    const o = overrides[k.id];
    return o ? { ...k, current: o.value, currentLabel: o.label, actualYear: o.year } : k;
  });
  const growthActual = overrides["ag-growth"]?.label ?? "3.6%";
  const headline = kpisForYear.filter((k) =>
    ["ag-gdp", "net-exports", "farm-income", "ag-growth", "undernourishment"].includes(k.id)
  );

  return (
    <div className="space-y-6">
      {/* Headline strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-tz-green/15 to-transparent">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">2050 Ag GDP Vision</p>
            <p className="text-2xl font-bold">${AMP_HEADLINES.visionYearTargetGdp}B</p>
            <p className="text-xs text-muted-foreground">~TZS {AMP_HEADLINES.agGdpTzs2050}T</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-tz-blue/15 to-transparent">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Public Investment 2024–30</p>
            <p className="text-2xl font-bold">${AMP_HEADLINES.requiredPublicInvestment}B</p>
            <p className="text-xs text-muted-foreground">unlocks ${AMP_HEADLINES.gdpUnlocked}B GDP</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-tz-gold/20 to-transparent">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Benefit-Cost Ratio</p>
            <p className="text-2xl font-bold">{AMP_HEADLINES.benefitCostRatio}x</p>
            <p className="text-xs text-muted-foreground">GDP return on investment</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/15 to-transparent">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Growth: {growthActual} → 10%</p>
            <p className="flex items-center gap-1 text-2xl font-bold">
              10% <TrendingUp className="h-5 w-5 text-tz-green" />
            </p>
            <p className="text-xs text-muted-foreground">actual {growthActual} vs CAADP ≥6%</p>
          </CardContent>
        </Card>
      </div>

      {/* Live open-data signals */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Database className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm">Live Open-Data Signals — Tanzania · Actual (World Bank)</CardTitle>
          <Badge
            className="ml-auto"
            bg={live ? "#1EA84C22" : undefined}
            color={live ? "#1EA84C" : undefined}
          >
            {live ? `● Actual · World Bank (live · ${year})` : `Actual · World Bank · ${year}`}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {signals.map((s) => (
              <div key={s.code} className="rounded-lg border bg-secondary/30 p-3">
                <p className="truncate text-xs text-muted-foreground" title={s.label}>
                  {s.label}
                </p>
                <p className="text-lg font-bold">{s.valueLabel}</p>
                <p className="text-[10px] text-muted-foreground">
                  {s.year} · {s.source}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Actual open data published by the World Bank (Indicators API, Tanzania · TZA). Falls back
            to a dated snapshot when offline. AMP policy targets remain fixed to the AMP 2050 document.
          </p>
        </CardContent>
      </Card>

      {/* Bank of Tanzania — Monthly Economic Review (Agriculture) */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center gap-2 space-y-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tz-gold/20 text-tz-gold">🏛️</div>
          <div className="flex-1">
            <CardTitle className="text-sm">Bank of Tanzania — Monthly Economic Review · Agriculture</CardTitle>
            <p className="text-[11px] text-muted-foreground">{BOT_MER.period} · crop exports, food prices &amp; agri-credit</p>
          </div>
          <Badge bg="#1EA84C22" color="#1EA84C">● Actual · BoT MER</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Traditional crop exports", `$${BOT_MER.tradExportsUsdM.toLocaleString()}M`, `▲ +${BOT_MER.tradExportsChg}% y/y`, "#1EA84C"],
              ["Food inflation", `${BOT_MER.foodInflation}%`, `▼ from ${BOT_MER.foodInflationPrev}%`, "#1EA84C"],
              ["Agricultural credit growth", `+${BOT_MER.agCreditGrowth}%`, "private-sector lending", "#0F7DB8"],
              ["Top earner · Tobacco", `$${BOT_MER.crops[0].usdM}M`, `from $${BOT_MER.crops[0].prev}M`, "#B8860B"],
            ].map((c) => (
              <div key={c[0]} className="rounded-lg border bg-secondary/30 p-3">
                <p className="text-[11px] text-muted-foreground">{c[0]}</p>
                <p className="text-lg font-bold">{c[1]}</p>
                <p className="text-[11px]" style={{ color: c[3] as string }}>{c[2]}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {BOT_MER.note} Source: {BOT_MER.source} —{" "}
            <a href={BOT_MER.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">bot.go.tz ↗</a>. Published monthly; drop in the latest review to refresh.
          </p>
        </CardContent>
      </Card>

      {/* AI Executive Summary */}
      <Card className="border-primary/30">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm">Auto-Generated Ai Executive Summary</CardTitle>
          <Badge className="ml-auto">
            {summary?.provider === "local-rag"
              ? "Local RAG"
              : summary?.provider
              ? summary.provider
              : "loading…"}
          </Badge>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">{summary.summary}</p>
              {summary.keyPoints?.length > 0 && (
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {summary.keyPoints.map((p, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Generating executive summary…</p>
          )}
        </CardContent>
      </Card>

      {/* KPI gauges */}
      <div>
        <Card className="mb-3">
          <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
            <b className="text-[13px]">Baseline (2022) vs Latest Actual vs 2030 Target vs 2050 Vision</b>
            <span className="ml-auto text-[11px] text-muted-foreground">Gauge = progress to the 2030 target:</span>
            <span className="flex items-center gap-1.5 text-[11px]"><span className="h-2.5 w-2.5 rounded-full bg-tz-green" />On track (≥66%)</span>
            <span className="flex items-center gap-1.5 text-[11px]"><span className="h-2.5 w-2.5 rounded-full bg-tz-gold" />At risk (33–65%)</span>
            <span className="flex items-center gap-1.5 text-[11px]"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Off track (&lt;33%)</span>
            <span className="w-full text-[11px] text-muted-foreground">100% (full ring) = the 2030 milestone reached. For metrics where lower is better (undernourishment, poverty) the gauge still rises toward the goal.</span>
          </CardContent>
        </Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {headline.map((k) => (
            <KpiCard key={k.id} kpi={k} />
          ))}
          {kpisForYear
            .filter((k) => !headline.some((h) => h.id === k.id))
            .map((k) => (
              <KpiCard key={k.id} kpi={k} />
            ))}
        </div>
      </div>
    </div>
  );
}
