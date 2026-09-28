"use client";

import { CloudRain, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FORECASTS, Recommendation, RiskLevel } from "@/lib/data/forecast";

const REC_STYLE: Record<Recommendation, { bg: string; color: string }> = {
  BUY: { bg: "#1EA84C22", color: "#1EA84C" },
  "STRENGTHEN RESERVES": { bg: "#EF444422", color: "#EF4444" },
  "EXPORT PUSH": { bg: "#00A3DD22", color: "#00A3DD" },
  HOLD: { bg: "#64748B22", color: "#64748B" },
  DIVERSIFY: { bg: "#F59E0B22", color: "#F59E0B" },
};

const RISK_COLOR: Record<RiskLevel, string> = {
  Low: "#1EA84C",
  Moderate: "#FCD116",
  High: "#EF4444",
};

export function ForecastEngine() {
  return (
    <div className="space-y-4">
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold">Ai Commodity Forecast Engine</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            12-month predictive price outlook, weather risk, trade signals and Ai recommendation
            badges. Signals blend commodity trend momentum with seasonal and market risk factors.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {FORECASTS.map((f) => {
          const rec = REC_STYLE[f.recommendation];
          const up = f.priceOutlookPct >= 0;
          return (
            <Card key={f.commodityId}>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <span className="text-2xl">{f.emoji}</span>
                <CardTitle className="flex-1 text-sm">{f.name}</CardTitle>
                <Badge bg={rec.bg} color={rec.color}>
                  {f.recommendation}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-secondary/50 p-2">
                    <p className="text-[10px] text-muted-foreground">Price outlook (12m)</p>
                    <p
                      className={`flex items-center gap-1 text-lg font-bold ${
                        up ? "text-tz-green" : "text-red-500"
                      }`}
                    >
                      {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {up ? "+" : ""}
                      {f.priceOutlookPct}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-2">
                    <p className="text-[10px] text-muted-foreground">Weather risk</p>
                    <p
                      className="flex items-center gap-1 text-lg font-bold"
                      style={{ color: RISK_COLOR[f.weatherRisk] }}
                    >
                      <CloudRain className="h-4 w-4" />
                      {f.weatherRisk}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Trade signal</span>
                    <span className="font-medium">{f.tradeSignal}</span>
                  </div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Model confidence</span>
                    <span className="font-semibold">{f.confidence}%</span>
                  </div>
                  <Progress value={f.confidence} color={rec.color} />
                </div>
                <p className="rounded-lg bg-secondary/40 p-2 text-xs text-muted-foreground">
                  {f.rationale}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
