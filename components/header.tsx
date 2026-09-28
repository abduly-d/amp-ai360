"use client";

import { useEffect, useState } from "react";
import { Bot, CalendarDays, Radio, Sparkles, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOURCE_STYLES: Record<string, string> = {
  GOV_API: "text-tz-green",
  WORLD_BANK: "text-tz-blue",
  FAOSTAT: "text-tz-blue",
  AMP_GROUND_TRUTH: "text-tz-gold",
};

export function Header({
  date,
  onDateChange,
  onOpenAssistant,
  onHome,
}: {
  date: string;
  onDateChange: (d: string) => void;
  onOpenAssistant: () => void;
  onHome: () => void;
}) {
  const [source, setSource] = useState<string>("…");
  const year = date ? date.slice(0, 4) : "";

  useEffect(() => {
    fetch("/api/data/metrics")
      .then((r) => r.json())
      .then((d) => setSource(d.source))
      .catch(() => setSource("AMP_GROUND_TRUTH"));
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <button onClick={onHome} className="flex items-center gap-3 text-left" title="Back to home">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tz-green to-[#0A5C2A] text-white shadow ring-2 ring-tz-gold/40">
            <Wheat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight sm:text-base">
              AMP Ai360 — Agriculture Transformation Office (ATO)
            </h1>
            <p className="text-xs text-muted-foreground">
              Tanzania Agriculture Master Plan Intelligence Platform · AMP 2050 · CAADP / Malabo
            </p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live date picker */}
          <label className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-2 text-xs">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-xs outline-none"
            />
          </label>

          {/* API source ticker */}
          <div className="flex items-center gap-2 overflow-hidden rounded-lg border bg-background px-3 py-2">
            <Radio className={`h-4 w-4 animate-pulse ${SOURCE_STYLES[source] ?? "text-muted-foreground"}`} />
            <span className="text-xs text-muted-foreground">Source:</span>
            <span className={`text-xs font-semibold ${SOURCE_STYLES[source] ?? ""}`}>
              {source}
            </span>
            {year && <span className="text-xs text-muted-foreground">· {year}</span>}
          </div>

          <Button onClick={onOpenAssistant} variant="outline" size="sm" title="Ask the in-dashboard assistant (offline)">
            <Sparkles className="h-4 w-4" />
            Assistant
          </Button>
          <a
            href="https://chatgpt.com/g/g-6a4e42bdd6f081918c7a97cc495511ec-tanzania-amp2050"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground shadow transition-opacity hover:opacity-90"
            title="Open the Tanzania AMP2050 GPT on ChatGPT"
          >
            <Bot className="h-4 w-4" />
            Ask AMP GPT ↗
          </a>
        </div>
      </div>
      {/* Tanzania national flag ribbon */}
      <div className="flex h-1" aria-hidden="true">
        <span className="flex-1" style={{ backgroundColor: "#1EB53A" }} />
        <span style={{ width: 22, backgroundColor: "#FCD116" }} />
        <span style={{ width: 10, backgroundColor: "#000000" }} />
        <span style={{ width: 22, backgroundColor: "#FCD116" }} />
        <span className="flex-1" style={{ backgroundColor: "#00A3DD" }} />
      </div>
    </header>
  );
}
