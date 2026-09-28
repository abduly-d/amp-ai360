"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { REGIONS, scoreBand } from "@/lib/data/regions";
import {
  CORRIDORS,
  OPERATIONS,
  Corridor,
  corridorOf,
  corridorReadiness,
  corridorStatus,
} from "@/lib/data/corridors";
import { TZ_GEO } from "@/lib/data/tz-geo";

export function RegionalIntelligence() {
  const [selectedId, setSelectedId] = useState<string>("sagcot");
  const sel: Corridor = CORRIDORS.find((c) => c.id === selectedId) ?? CORRIDORS[0];
  const score = corridorReadiness(sel);
  const status = corridorStatus(score);
  const ranked = CORRIDORS.map((c) => ({ c, score: corridorReadiness(c) })).sort(
    (a, b) => b.score - a.score
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-sm">Regional Intelligence — Tanzania</CardTitle>
          <div className="flex flex-wrap gap-1">
            {CORRIDORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors ${
                  selectedId === c.id ? "bg-primary text-primary-foreground" : "border hover:bg-secondary"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.short}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden rounded-lg border bg-secondary/30">
            <svg viewBox={`0 0 ${TZ_GEO.vb[0]} ${TZ_GEO.vb[1]}`} className="block h-auto w-full">
              {/* accurate region polygons, choropleth-coloured by corridor */}
              {REGIONS.map((r) => {
                const path = TZ_GEO.paths[r.id];
                if (!path) return null;
                const cor = corridorOf(r.id);
                const inSel = cor?.id === sel.id;
                return (
                  <path
                    key={r.id}
                    d={path}
                    fill={cor?.color ?? "#94a3b8"}
                    fillOpacity={inSel ? 0.95 : 0.6}
                    stroke="hsl(var(--card))"
                    strokeWidth={0.4}
                    className="cursor-pointer"
                    onClick={() => cor && setSelectedId(cor.id)}
                  >
                    <title>{r.name} · {cor?.name ?? "—"}</title>
                  </path>
                );
              })}
              {/* current-operations pins at region centroids */}
              {OPERATIONS.map((id) => {
                const c = TZ_GEO.cent[id];
                if (!c) return null;
                const r = REGIONS.find((x) => x.id === id);
                return (
                  <g key={id}>
                    <circle cx={c[0]} cy={c[1]} r={1.8} fill="#DC2626" stroke="#fff" strokeWidth={0.6} />
                    <circle cx={c[0]} cy={c[1]} r={0.65} fill="#fff" />
                    <title>Current operations · {r?.name ?? id}</title>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {CORRIDORS.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                {c.name}
              </button>
            ))}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-white" style={{ backgroundColor: "#DC2626", boxShadow: "0 0 0 1px #DC2626" }} />
              Current operations
            </span>
            <span className="text-[10px] text-muted-foreground">Boundaries: geoBoundaries (OSM) ADM1</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded" style={{ backgroundColor: sel.color }} />
                {sel.name}
              </span>
              <Badge bg={status.color + "22"} color={status.color}>{status.label}</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {sel.regions.length} regions · clusters: {sel.clusters.join(", ")}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">AMP corridor readiness</span>
                <span className="font-semibold">{score}/100</span>
              </div>
              <Progress value={score} color={status.color} />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Lead value chains</p>
              <div className="flex flex-wrap gap-1.5">
                {sel.leads.map((l) => (<Badge key={l}>{l}</Badge>))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Member regions &amp; readiness</p>
              <div className="space-y-1.5">
                {sel.regions.map((id) => {
                  const r = REGIONS.find((x) => x.id === id)!;
                  const b = scoreBand(r.ampScore);
                  return (
                    <div key={id} className="flex items-center gap-2 text-xs">
                      <span className="flex-1">📍 {r.name}</span>
                      <span className="w-20"><Progress value={r.ampScore} color={b.color} /></span>
                      <span className="w-7 text-right font-semibold">{r.ampScore}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">{sel.note}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Corridors ranked by AMP readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {ranked.map((x, i) => (
              <button
                key={x.c.id}
                onClick={() => setSelectedId(x.c.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                  selectedId === x.c.id ? "bg-primary/10" : "hover:bg-secondary"
                }`}
              >
                <span className="w-4 text-muted-foreground">{i + 1}</span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: x.c.color }} />
                <span className="flex-1 truncate">{x.c.short}</span>
                <span className="w-16"><Progress value={x.score} color={corridorStatus(x.score).color} /></span>
                <span className="w-7 text-right font-semibold">{x.score}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
