"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { INSTITUTIONS } from "@/lib/data/institutions";
import { STATUS_META } from "@/lib/data/flagships";

export function InstitutionalScorecard() {
  const avg = Math.round(
    INSTITUTIONS.reduce((s, i) => s + i.deliveryScore, 0) / INSTITUTIONS.length
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Agencies tracked</p>
            <p className="text-2xl font-bold">{INSTITUTIONS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg activities implemented</p>
            <p className="text-2xl font-bold">{avg}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">On track 🟢</p>
            <p className="text-2xl font-bold">
              {INSTITUTIONS.filter((i) => i.status === "on-track").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Critical 🔴</p>
            <p className="text-2xl font-bold">
              {INSTITUTIONS.filter((i) => i.status === "critical").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Institutional Performance Matrix — Ministries &amp; Agencies
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            &ldquo;Activities implemented&rdquo; tracks planned activities delivered — an input/output
            measure, not results/outcomes achieved.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-2">Agency</th>
                  <th className="px-2 py-2">Mandate</th>
                  <th className="px-2 py-2 w-40">Activities Implemented</th>
                  <th className="px-2 py-2 w-40">Budget Execution</th>
                  <th className="px-2 py-2">Flagships</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {INSTITUTIONS.map((i) => {
                  const meta = STATUS_META[i.status];
                  return (
                    <tr key={i.id} className="border-b last:border-0">
                      <td className="py-3 pr-2">
                        <p className="font-semibold">{i.acronym}</p>
                        <p className="text-xs text-muted-foreground">{i.name}</p>
                      </td>
                      <td className="max-w-[220px] px-2 py-3 text-xs text-muted-foreground">
                        {i.mandate}
                      </td>
                      <td className="px-2 py-3">
                        <div className="mb-1 text-xs font-semibold">{i.deliveryScore}%</div>
                        <Progress value={i.deliveryScore} color={meta.color} />
                      </td>
                      <td className="px-2 py-3">
                        <div className="mb-1 text-xs font-semibold">{i.budgetExecutionPct}%</div>
                        <Progress value={i.budgetExecutionPct} color="#00A3DD" />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-1">
                          {i.linkedFlagships.map((f) => (
                            <span
                              key={f}
                              className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium"
                            >
                              F{f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <Badge bg={meta.color + "22"} color={meta.color}>
                          {meta.icon} {meta.label}
                        </Badge>
                      </td>
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
