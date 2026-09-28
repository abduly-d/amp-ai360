"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SCENARIOS } from "@/lib/data/scenarios";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export function VisionScenarios() {
  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold">DIRA 2050 — National Vision Scenario Modelling (2030 &amp; 2050 horizons)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Business-As-Usual (BAU, ~4.8% growth) vs Full AMP Implementation (10% growth).
            The divergence quantifies the cost of inaction and the prize of delivery.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {SCENARIOS.map((s) => {
          const last = s.data[s.data.length - 1];
          const gap = s.betterDirection === "up" ? last.amp - last.bau : last.bau - last.amp;
          return (
            <Card key={s.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm">{s.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{s.unit}</p>
                </div>
                <Badge bg="#1EA84C22" color="#1EA84C">
                  2050 gap: {gap > 0 ? "+" : ""}
                  {gap.toFixed(gap < 10 ? 1 : 0)} {s.unit}
                </Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={s.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={40} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="bau"
                      name="Business-As-Usual"
                      stroke="#EF4444"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amp"
                      name="Full AMP"
                      stroke="#1EA84C"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="mt-2 text-xs text-muted-foreground">{s.narrative}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
