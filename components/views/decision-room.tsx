"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALERTS, ALERT_META, AlertLevel } from "@/lib/data/alerts";
import { FORECASTS } from "@/lib/data/forecast";
import { BOT_MER } from "@/lib/data/bot-mer";

const ICON: Record<AlertLevel, JSX.Element> = {
  red: <ShieldAlert className="h-5 w-5" />,
  amber: <AlertTriangle className="h-5 w-5" />,
  green: <CheckCircle2 className="h-5 w-5" />,
};

const REC_COLOR: Record<string, string> = {
  BUY: "#1EA84C",
  "STRENGTHEN RESERVES": "#EF4444",
  "EXPORT PUSH": "#00A3DD",
  HOLD: "#64748B",
  DIVERSIFY: "#F59E0B",
  MONITOR: "#64748B",
};

const PRIORITY_EXPORTS = [
  { id: "cashew", name: "Cashew", emoji: "🥜", orient: "Export earner", note: "Top nut export; localise processing" },
  { id: "coffee", name: "Coffee", emoji: "☕", orient: "Export earner", note: "$399M (BoT); washed-arabica premium" },
  { id: "tobacco", name: "Tobacco", emoji: "🍂", orient: "Export earner", note: "$605M (BoT); leading traditional export" },
  { id: "cotton", name: "Cotton", emoji: "🧵", orient: "Export earner", note: "Textiles linkage; revive contract farming" },
  { id: "avocado", name: "Avocado", emoji: "🥑", orient: "Rising export", note: "Fastest-growing horticulture export" },
  { id: "sesame", name: "Sesame", emoji: "🌰", orient: "Export earner", note: "$79B TZS WRS season sales (COPRA)" },
  { id: "tea", name: "Tea", emoji: "🍵", orient: "Export earner", note: "Smallholder factory linkages" },
  { id: "maize", name: "Maize", emoji: "🌽", orient: "Food security", note: "Strengthen NFRA reserves; export surplus" },
];

function PriorityExportWatch() {
  return (
    <Card className="border-tz-gold/30">
      <CardHeader className="flex-row flex-wrap items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tz-gold/20 text-tz-gold">🌍</div>
        <div className="flex-1">
          <CardTitle className="text-sm">Priority Commodities &amp; Export Watch</CardTitle>
          <p className="text-[11px] text-muted-foreground">AMP priority commodities · trade orientation &amp; Ai signal</p>
        </div>
        <span className="text-xs text-muted-foreground">
          Traditional exports <span className="font-semibold text-foreground">${BOT_MER.tradExportsUsdM.toLocaleString()}M</span> ▲{BOT_MER.tradExportsChg}%
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 pr-2">Commodity</th>
                <th className="px-2 py-2">Trade orientation</th>
                <th className="px-2 py-2">Decision note</th>
                <th className="px-2 py-2">Ai signal</th>
              </tr>
            </thead>
            <tbody>
              {PRIORITY_EXPORTS.map((p) => {
                const rec = FORECASTS.find((f) => f.commodityId === p.id)?.recommendation ?? "MONITOR";
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-2"><span className="mr-1.5">{p.emoji}</span><b>{p.name}</b></td>
                    <td className="px-2 py-2.5"><Badge>{p.orient}</Badge></td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground">{p.note}</td>
                    <td className="px-2 py-2.5"><Badge color={REC_COLOR[rec]}>{rec}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a href="https://www.macmap.org/" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-xs font-medium text-accent-foreground">🌐 ITC Market Access Map ↗</a>
          <a href="https://www.trademap.org/" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium hover:bg-secondary">📊 ITC Trade Map ↗</a>
          <span className="min-w-[200px] flex-1 text-[11px] text-muted-foreground">
            ITC (macmap.org) publishes Tanzania&apos;s tariffs, market-access conditions and export opportunities against global markets — use it to decide where to push each priority commodity.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DecisionRoom() {
  const [filter, setFilter] = useState<AlertLevel | "all">("all");
  const counts = {
    red: ALERTS.filter((a) => a.level === "red").length,
    amber: ALERTS.filter((a) => a.level === "amber").length,
    green: ALERTS.filter((a) => a.level === "green").length,
  };
  const shown = ALERTS.filter((a) => filter === "all" || a.level === filter);

  return (
    <div className="space-y-4">
      <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <h2 className="text-sm font-semibold">Executive Decision Room</h2>
            <p className="text-sm text-muted-foreground">
              Daily critical-alert console for the Minister&apos;s briefing —{" "}
              {new Date().toLocaleDateString("en-GB", { dateStyle: "full" })}
            </p>
          </div>
          <div className="flex gap-2">
            {(["red", "amber", "green"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setFilter(filter === l ? "all" : l)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  filter === l ? "ring-2 ring-primary" : "hover:bg-secondary"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: ALERT_META[l].color }}
                />
                <span className="text-sm font-bold">{counts[l]}</span>
                <span className="text-xs text-muted-foreground">{ALERT_META[l].label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <PriorityExportWatch />

      <div className="space-y-3">
        {shown.map((a) => {
          const meta = ALERT_META[a.level];
          return (
            <Card key={a.id} style={{ borderLeft: `4px solid ${meta.color}` }}>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: meta.bg, color: meta.color }}
                >
                  {ICON[a.level]}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-sm">{a.title}</CardTitle>
                    <Badge bg={meta.bg} color={meta.color}>
                      {meta.label}
                    </Badge>
                    <Badge>{a.category}</Badge>
                    {a.flagship && <Badge>Flagship {a.flagship}</Badge>}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(a.timestamp).toLocaleString("en-GB")}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pl-16">
                <p className="text-sm">{a.detail}</p>
                <div
                  className="rounded-lg p-2.5 text-sm"
                  style={{ backgroundColor: meta.bg }}
                >
                  <span className="font-semibold" style={{ color: meta.color }}>
                    Recommended action:{" "}
                  </span>
                  <span>{a.recommendation}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
