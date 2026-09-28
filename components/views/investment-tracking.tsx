"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  INVESTMENTS,
  INV_TOTALS,
  INV_CATS,
  FLAG_FUND,
  usd,
} from "@/lib/data/investments";

const STATUS_COLOR: Record<string, string> = {
  "IN-PROGRESS": "#1EA84C",
  PLANNED: "#0F7DB8",
  COMPLETED: "#64748B",
  "ON-HOLD": "#E6A700",
  TERMINATED: "#EF4444",
};

export function InvestmentTracking() {
  const [cat, setCat] = useState<string>("");
  const t = INV_TOTALS;
  const securedPct = Math.round((t.sec / t.req) * 100);
  const maxReq = Math.max(...FLAG_FUND.map((f) => f.req));
  const funderTotals = Object.entries(
    INVESTMENTS.reduce<Record<string, number>>((m, p) => {
      m[p.funder] = (m[p.funder] ?? 0) + p.req;
      return m;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const maxFunder = funderTotals[0][1];
  const shown = INVESTMENTS.filter((p) => !cat || p.cat === cat);

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Total Initiative Cost", usd(t.req), `${t.n} investments tracked`, "text-foreground"],
          ["Funds Secured", usd(t.sec), `${securedPct}% of requirement`, "text-tz-green"],
          ["Funding Gap", usd(t.gap), `${100 - securedPct}% unfunded`, "text-red-500"],
          ["Pipeline", `${t.inprog} active`, `${t.planned} planned · ${t.completed} complete`, "text-tz-blue"],
        ].map((c) => (
          <Card key={c[0] as string}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{c[0]}</p>
              <p className={`text-2xl font-bold ${c[3]}`}>{c[1]}</p>
              <p className="text-xs text-muted-foreground">{c[2]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* By financing source */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center gap-2 space-y-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Landmark className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm">Investment by Financing Source</CardTitle>
          <span className="ml-auto text-[11px] text-muted-foreground">
            Public · Private · Development Partners · Non-Government
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {INV_CATS.map((c) => {
              const sp = Math.round((c.sec / c.req) * 100);
              return (
                <button
                  key={c.cat}
                  onClick={() => setCat(cat === c.cat ? "" : c.cat)}
                  className={`rounded-xl border p-3 text-left transition ${cat === c.cat ? "ring-2" : ""}`}
                  style={cat === c.cat ? { boxShadow: `0 0 0 2px ${c.color}` } : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <b className="text-sm">{c.label}</b>
                  </div>
                  <p className="mt-1 text-xl font-bold">{usd(c.req)}</p>
                  <p className="text-[11px] text-muted-foreground">{c.n} investments · {sp}% secured</p>
                  <div className="mt-1.5"><Progress value={sp} color={c.color} /></div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Secured {usd(c.sec)} · Gap {usd(c.gap)}</p>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Development Partners lead financing at {usd(140300000)} (79% of tracked cost). DP flows are trackable against the{" "}
            <a href="https://data-explorer.oecd.org/vis?df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_CRS%40DF_CRS&df[ag]=OECD.DCD.FSD" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">OECD CRS aid database ↗</a>. Source: AMP 2050 Financing &amp; Partnership Mapping (ATO).
          </p>
        </CardContent>
      </Card>

      {/* Gap by flagship + funders */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader><CardTitle className="text-sm">Financing vs Gap by Flagship (USD M)</CardTitle></CardHeader>
          <CardContent>
            {FLAG_FUND.map((f) => (
              <div key={f.f} className="mb-2">
                <div className="mb-1 flex justify-between text-xs">
                  <span>{f.f} · {f.name}</span>
                  <span className="text-muted-foreground">{f.sec.toFixed(1)} / {f.req.toFixed(1)}M</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-tz-green" style={{ width: `${(f.sec / maxReq) * 100}%` }} />
                  <div className="absolute inset-y-0 rounded-r-full bg-red-500/55" style={{ left: `${(f.sec / maxReq) * 100}%`, width: `${((f.req - f.sec) / maxReq) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="mt-2 flex gap-4 text-[11px]">
              <span className="text-tz-green">■ Secured</span>
              <span className="text-red-500">■ Gap</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Funder Concentration</CardTitle></CardHeader>
          <CardContent>
            {funderTotals.map(([f, v]) => (
              <div key={f} className="mb-1.5">
                <div className="mb-1 flex justify-between text-xs">
                  <span>{f}</span>
                  <b>{usd(v)}</b>
                </div>
                <Progress value={(v / maxFunder) * 100} color="#0F7DB8" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Register */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <CardTitle className="text-sm">Investment Register</CardTitle>
          {cat ? (
            <>
              <Badge color="#0F7DB8">{cat} · {shown.length}</Badge>
              <button onClick={() => setCat("")} className="text-xs text-primary hover:underline">Clear</button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">{shown.length} investments</span>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-2">ID</th>
                  <th className="px-2 py-2">Investment</th>
                  <th className="px-2 py-2">Source</th>
                  <th className="px-2 py-2">Funder</th>
                  <th className="px-2 py-2">Flagship</th>
                  <th className="px-2 py-2 text-right">Required</th>
                  <th className="px-2 py-2 text-right">Secured</th>
                  <th className="px-2 py-2 text-right">Gap</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const cc = INV_CATS.find((c) => c.cat === p.cat)?.color ?? "#64748B";
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 text-muted-foreground">{p.id}</td>
                      <td className="px-2 py-2">
                        <b className="text-xs">{p.name}</b>
                        <br />
                        <span className="text-[10px] text-muted-foreground">📍 {p.region || "—"}</span>
                      </td>
                      <td className="px-2 py-2"><Badge color={cc}>{p.cat}</Badge></td>
                      <td className="px-2 py-2 text-xs">{p.funder}</td>
                      <td className="px-2 py-2 text-[11px] text-muted-foreground">{p.flag}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{usd(p.req)}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-tz-green">{usd(p.sec)}</td>
                      <td className="px-2 py-2 text-right tabular-nums" style={{ color: p.gap > 0 ? "#EF4444" : "hsl(var(--muted-foreground))" }}>{usd(p.gap)}</td>
                      <td className="px-2 py-2"><Badge color={STATUS_COLOR[p.status] ?? "#64748B"}>{p.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
