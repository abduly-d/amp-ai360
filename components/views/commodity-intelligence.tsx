"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Activity } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMMODITIES, Commodity } from "@/lib/data/commodities";
import { TMX_BOARD, TMX_META, tmxTotals, PRESSURE_META, TmxQuote } from "@/lib/data/tmx";
import { BULLETIN, chgLabel } from "@/lib/data/bulletin";

const STATUS_COLOR: Record<Commodity["status"], string> = {
  growing: "#1EA84C",
  stable: "#00A3DD",
  declining: "#EF4444",
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

function MarketBulletin() {
  const totVal = BULLETIN.season.reduce((s, x) => s + x.valueTzs, 0);
  const totKg = BULLETIN.season.reduce((s, x) => s + x.kg, 0);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center gap-2 space-y-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">🧾</div>
          <div className="flex-1">
            <CardTitle className="text-sm">Weekly Market Bulletin — National Wholesale Prices</CardTitle>
            <p className="text-[11px] text-muted-foreground">Current week {BULLETIN.week} vs previous week {BULLETIN.prevWeek} · TZS/kg</p>
          </div>
          <Badge bg="#1EA84C22" color="#1EA84C">● MoA live bulletin</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-2">Commodity</th>
                  <th className="px-2 py-2 text-right">This week</th>
                  <th className="px-2 py-2 text-right">Previous week</th>
                  <th className="px-2 py-2 text-right">Δ change</th>
                </tr>
              </thead>
              <tbody>
                {BULLETIN.national.map((n) => (
                  <tr key={n.crop} className="border-b last:border-0">
                    <td className="py-2.5 pr-2"><span className="mr-1.5">{n.emoji}</span><span className="font-medium">{n.crop}</span></td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums">{n.price.toLocaleString()}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">{n.prev.toLocaleString()}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums" style={{ color: n.chg > 0 ? "#1EA84C" : n.chg < 0 ? "#EF4444" : "hsl(var(--muted-foreground))" }}>{chgLabel(n.chg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Source: {BULLETIN.source} —{" "}
            <a href={BULLETIN.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">kilimo.go.tz ↗</a>. Published every Friday; drop in the latest bulletin to refresh.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center gap-2 space-y-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">📦</div>
          <div className="flex-1">
            <CardTitle className="text-sm">Warehouse Receipt System — 2026/27 Season Sales</CardTitle>
            <p className="text-[11px] text-muted-foreground">Cumulative cooperative-union sales via COPRA</p>
          </div>
          <span className="text-xs text-muted-foreground">Total <span className="font-semibold text-foreground">TZS {(totVal / 1e9).toFixed(0)}B</span></span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BULLETIN.season.map((s) => (
              <div key={s.name} className="rounded-lg border bg-secondary/30 p-3">
                <p className="text-xs font-medium">{s.emoji} {s.name}</p>
                <p className="text-lg font-bold">TZS {(s.valueTzs / 1e9).toFixed(1)}B</p>
                <p className="text-[10px] text-muted-foreground">{(s.kg / 1e6).toFixed(2)}M kg · ~{s.avg.toLocaleString()} TZS/kg</p>
                <p className="text-[10px] text-muted-foreground">{s.source} · 2026/27</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">{(totKg / 1e6).toFixed(1)}M kg traded across cooperative unions. Source: COPRA.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TmxBoard({ onPick }: { onPick: (id: string) => void }) {
  const [board, setBoard] = useState<TmxQuote[]>(TMX_BOARD);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch("/api/data/tmx")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.board)) setBoard(d.board);
        setLive(!!d.live);
      })
      .catch(() => {});
  }, []);

  const totals = tmxTotals(board);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tz-gold/20 text-tz-gold">
          <Activity className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm">TMX Market Board — Live Commodity Trading</CardTitle>
          <p className="text-[11px] text-muted-foreground">
            {TMX_META.exchange} · {TMX_META.mechanism}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            Vol <span className="font-semibold text-foreground">{totals.volumeTons.toLocaleString()} t</span>
          </span>
          <span className="text-muted-foreground">
            Trades <span className="font-semibold text-foreground">{totals.trades}</span>
          </span>
          <Badge
            bg={live ? "#1EA84C22" : "#E6A70022"}
            color={live ? "#1EA84C" : "#B8860B"}
          >
            {live ? "● TMX live" : "Indicative · awaiting TMX feed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 pr-2">Commodity</th>
                <th className="px-2 py-2">Warehouse</th>
                <th className="px-2 py-2 text-right">Price (TZS/kg)</th>
                <th className="px-2 py-2 text-right">Δ session</th>
                <th className="px-2 py-2 text-right">Bid / Offer</th>
                <th className="px-2 py-2 text-right">Volume (t)</th>
                <th className="px-2 py-2 text-right">Trades</th>
                <th className="px-2 py-2">Behaviour</th>
              </tr>
            </thead>
            <tbody>
              {board.map((q) => {
                const up = q.changePct >= 0;
                const p = PRESSURE_META[q.pressure];
                return (
                  <tr
                    key={q.symbol}
                    className={`border-b last:border-0 ${q.commodityId ? "cursor-pointer hover:bg-secondary/50" : ""}`}
                    onClick={() => q.commodityId && onPick(q.commodityId)}
                  >
                    <td className="py-2.5 pr-2">
                      <span className="mr-1.5">{q.emoji}</span>
                      <span className="font-medium">{q.name}</span>
                      <span className="ml-1.5 text-[10px] text-muted-foreground">{q.symbol}</span>
                    </td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground">📍 {q.warehouse}</td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums">
                      {q.priceTzs.toLocaleString()}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span
                        className={`inline-flex items-center justify-end gap-0.5 font-medium tabular-nums ${up ? "text-tz-green" : "text-red-500"}`}
                      >
                        {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {up ? "+" : ""}
                        {q.changePct}%
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs text-muted-foreground tabular-nums">
                      {q.bidTzs.toLocaleString()} / {q.offerTzs.toLocaleString()}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{q.volumeTons.toLocaleString()}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{q.trades}</td>
                    <td className="px-2 py-2.5">
                      <Badge bg={p.color + "22"} color={p.color}>
                        {p.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          {totals.gainers} gainers · {totals.losers} decliners. {TMX_META.note} Click a row to open
          that commodity&apos;s detail. Connect a live feed via <code>TMX_API_BASE_URL</code>.
        </p>
      </CardContent>
    </Card>
  );
}

export function CommodityIntelligence() {
  const [selected, setSelected] = useState<Commodity>(COMMODITIES[0]);
  const latest = selected.series[selected.series.length - 1];
  const first = selected.series[0];
  const growthPct = Math.round(((latest.production - first.production) / first.production) * 100);
  const tmxQuote = TMX_BOARD.find((q) => q.commodityId === selected.id);

  return (
    <div className="space-y-4">
      <MarketBulletin />
      <TmxBoard
        onPick={(id) => {
          const c = COMMODITIES.find((x) => x.id === id);
          if (c) setSelected(c);
        }}
      />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Grid selector */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-sm">20 Priority Commodities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {COMMODITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors ${
                  selected.id === c.id
                    ? "border-primary bg-primary/10"
                    : "hover:bg-secondary"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-[10px] leading-tight">{c.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail pane */}
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <span className="text-4xl">{selected.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{selected.name}</h2>
                <Badge
                  bg={STATUS_COLOR[selected.status] + "22"}
                  color={STATUS_COLOR[selected.status]}
                >
                  {selected.status}
                </Badge>
                <Badge>{selected.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{selected.note}</p>
              {tmxQuote && (
                <div className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-lg border bg-tz-gold/10 px-2.5 py-1.5 text-xs">
                  <span className="font-semibold text-tz-gold">TMX</span>
                  <span className="font-semibold">{tmxQuote.priceTzs.toLocaleString()} TZS/kg</span>
                  <span className={tmxQuote.changePct >= 0 ? "text-tz-green" : "text-red-500"}>
                    {tmxQuote.changePct >= 0 ? "+" : ""}
                    {tmxQuote.changePct}%
                  </span>
                  <span className="text-muted-foreground">
                    · {tmxQuote.volumeTons.toLocaleString()} t · {PRESSURE_META[tmxQuote.pressure].label} · 📍 {tmxQuote.warehouse}
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">{latest.year} Output</p>
                <p className="text-lg font-bold">{latest.production.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">&apos;000 MT</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">2030 Target</p>
                <p className="text-lg font-bold text-tz-blue">
                  {selected.amp2030TargetProduction.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">&apos;000 MT</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">5-yr Growth</p>
                <p className={`text-lg font-bold ${growthPct >= 0 ? "text-tz-green" : "text-red-500"}`}>
                  {growthPct >= 0 ? "+" : ""}
                  {growthPct}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Production Trend (&apos;000 MT)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={selected.series}>
                  <defs>
                    <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STATUS_COLOR[selected.status]} stopOpacity={0.5} />
                      <stop offset="95%" stopColor={STATUS_COLOR[selected.status]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={45} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="production"
                    stroke={STATUS_COLOR[selected.status]}
                    fill="url(#prodGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Farmgate Price History (TZS/kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={selected.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={45} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="price" stroke="#FCD116" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Post-Harvest Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-bold text-red-500">{selected.postHarvestLossPct}%</p>
                <p className="pb-1 text-xs text-muted-foreground">
                  of output lost — Flagship 7 targets a 50% reduction.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart
                  data={[
                    { name: "Loss", value: selected.postHarvestLossPct },
                    { name: "Retained", value: 100 - selected.postHarvestLossPct },
                  ]}
                  layout="vertical"
                >
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={4} fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Key Producing Regions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selected.keyRegions.map((r) => (
                  <Badge key={r} bg="hsl(var(--secondary))">
                    📍 {r}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                Category: <span className="font-medium text-foreground">{selected.category}</span> ·
                2030 target implies a{" "}
                <span className="font-medium text-foreground">
                  {Math.round(
                    (selected.amp2030TargetProduction / latest.production - 1) * 100
                  )}
                  %
                </span>{" "}
                output increase over {latest.year}.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
