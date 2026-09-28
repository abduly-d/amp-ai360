"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CAADP_MATRIX, VERDICT_META, CAADP_SCORECARD } from "@/lib/data/caadp";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export function CaadpAlignment() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              AMP 2050 vs CAADP / Malabo — Alignment Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CAADP_MATRIX.map((m) => {
              const v = VERDICT_META[m.verdict];
              return (
                <div key={m.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{m.dimension}</p>
                    <Badge bg={v.bg} color={v.color}>
                      {v.label} · {m.badge}
                    </Badge>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md bg-tz-blue/10 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        CAADP Commitment
                      </p>
                      <p className="text-xs">{m.caadpCommitment}</p>
                      <p className="mt-0.5 text-sm font-bold text-tz-blue">{m.caadpValueLabel}</p>
                    </div>
                    <div className="rounded-md bg-tz-green/10 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        AMP 2050 Position
                      </p>
                      <p className="text-xs">{m.ampPosition}</p>
                      <p className="mt-0.5 text-sm font-bold text-tz-green">{m.ampValueLabel}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{m.commentary}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alignment Radar</CardTitle>
              <p className="text-xs text-muted-foreground">
                AMP performance vs CAADP threshold (normalised 0–100)
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={CAADP_SCORECARD} outerRadius="72%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Radar name="AMP" dataKey="amp" stroke="#1EA84C" fill="#1EA84C" fillOpacity={0.4} />
                  <Radar name="CAADP Target" dataKey="caadp" stroke="#00A3DD" fill="#00A3DD" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="text-sm">Priority Compliance Gaps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CAADP_MATRIX.filter(
                (m) => m.verdict === "gap" || m.verdict === "critical-gap"
              ).map((m) => (
                <div key={m.id} className="rounded-lg bg-red-500/10 p-2 text-xs">
                  <p className="font-semibold">{m.dimension}</p>
                  <p className="text-muted-foreground">{m.badge}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
