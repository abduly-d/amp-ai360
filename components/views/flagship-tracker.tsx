"use client";

import { useState } from "react";
import { ChevronDown, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FLAGSHIPS, STATUS_META, flagshipProgress } from "@/lib/data/flagships";

export function FlagshipTracker() {
  const [open, setOpen] = useState<number | null>(1);
  const [filter, setFilter] = useState<"all" | "on-track" | "at-risk" | "critical">("all");

  const counts = {
    "on-track": FLAGSHIPS.filter((f) => f.status === "on-track").length,
    "at-risk": FLAGSHIPS.filter((f) => f.status === "at-risk").length,
    critical: FLAGSHIPS.filter((f) => f.status === "critical").length,
  };

  const shown = FLAGSHIPS.filter((f) => filter === "all" || f.status === filter);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(["on-track", "at-risk", "critical"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? "all" : s)}>
            <Card className={filter === s ? "ring-2 ring-primary" : ""}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl">{STATUS_META[s].icon}</span>
                <div className="text-left">
                  <p className="text-2xl font-bold">{counts[s]}</p>
                  <p className="text-xs text-muted-foreground">{STATUS_META[s].label}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">15 AMP Flagship Programmes</CardTitle>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="text-xs text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {shown.map((f) => {
            const prog = flagshipProgress(f);
            const meta = STATUS_META[f.status];
            const isOpen = open === f.id;
            return (
              <div key={f.id} className="rounded-lg border">
                <button
                  onClick={() => setOpen(isOpen ? null : f.id)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold">
                    {f.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{f.name}</p>
                      <span title={meta.label}>{meta.icon}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{f.targetLabel}</p>
                  </div>
                  <div className="hidden w-40 shrink-0 sm:block">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {f.current.toLocaleString()}/{f.target.toLocaleString()} {f.unit}
                      </span>
                      <span className="font-semibold">{prog}%</span>
                    </div>
                    <Progress value={prog} color={meta.color} />
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="animate-fade-in space-y-3 border-t p-3">
                    <p className="text-sm text-muted-foreground">{f.summary}</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-secondary/50 p-2">
                        <p className="text-xs text-muted-foreground">Delivery Lead</p>
                        <p className="text-sm font-medium">{f.lead}</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-2">
                        <p className="text-xs text-muted-foreground">Indicative Budget</p>
                        <p className="text-sm font-medium">${f.budgetUsdM}M</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-2">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge bg={meta.color + "22"} color={meta.color}>
                          {meta.icon} {meta.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="sm:hidden">
                      <Progress value={prog} color={meta.color} />
                    </div>
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Link2 className="h-3 w-3" /> Interdependent flagships
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.linkedTo.map((id) => {
                          const l = FLAGSHIPS.find((x) => x.id === id)!;
                          return (
                            <button
                              key={id}
                              onClick={() => setOpen(id)}
                              className="rounded-full border px-2 py-0.5 text-xs hover:bg-secondary"
                            >
                              F{id} · {l.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
