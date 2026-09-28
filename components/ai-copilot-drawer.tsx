"use client";

import { useState } from "react";
import { X, Send, Sparkles, Search, Loader2, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/lib/ai/types";

const QUICK_QUERIES = [
  "Analyze correlation between Flagship 1 (Irrigation) and Flagship 8 (Commercial Ag)",
  "How do AMP targets align with the CAADP Malabo Declaration?",
  "What is needed to hit $6B Ag Exports by 2030?",
  "How does Irrigation (Flagship 1) impact Seed Production (Flagship 2) and smallholder income?",
];

const MODE_LABEL: Record<string, string> = {
  correlation: "Cross-Flagship Correlation",
  "target-path": "Target-Path Execution",
  "caadp-alignment": "CAADP Alignment",
  general: "Document RAG",
};

export function AiCopilotDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(q: string) {
    const question = q.trim();
    if (!question) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: question }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setResult(await res.json());
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l bg-card shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AMP Assistant</h2>
              <p className="text-xs text-muted-foreground">
                In-dashboard · AMP 2050 & CAADP knowledge base
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://chatgpt.com/g/g-6a4e42bdd6f081918c7a97cc495511ec-tanzania-amp2050"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-xs text-accent hover:underline sm:inline"
            >
              Open full GPT ↗
            </a>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close assistant">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Search */}
        <div className="border-b p-4">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run(query)}
              placeholder="Ask about flagships, CAADP, targets, commodities…"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button size="sm" onClick={() => run(query)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">Quick queries</p>
            {QUICK_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  run(q);
                }}
                className="rounded-lg border bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-secondary"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="thin-scroll flex-1 overflow-y-auto p-4">
          {!result && !loading && !error && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <Lightbulb className="mx-auto mb-2 h-8 w-8 opacity-50" />
              Ask a question or pick a quick query to generate an executive briefing.
            </div>
          )}
          {loading && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating executive analysis…
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
          )}

          {result && (
            <div className="animate-fade-in space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge bg="hsl(var(--primary))" color="#fff">
                  {MODE_LABEL[result.mode] ?? result.mode}
                </Badge>
                <Badge>
                  {result.provider === "local-rag"
                    ? "Local RAG"
                    : result.provider === "anthropic"
                    ? "Anthropic"
                    : "OpenAI"}
                </Badge>
              </div>

              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Executive Summary
                </h3>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </section>

              {result.keyPoints?.length > 0 && (
                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Key Points
                  </h3>
                  <ul className="space-y-1.5">
                    {result.keyPoints.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.tables?.map((t, ti) => (
                <section key={ti}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.title}
                  </h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary">
                        <tr>
                          {t.columns.map((c) => (
                            <th key={c} className="px-2.5 py-2 font-semibold">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.rows.map((row, ri) => (
                          <tr key={ri} className="border-t">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-2.5 py-2 align-top">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}

              {result.recommendations && result.recommendations.length > 0 && (
                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommendations
                  </h3>
                  <ul className="space-y-1.5">
                    {result.recommendations.map((r, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded-lg bg-primary/10 p-2 text-sm"
                      >
                        <span className="font-semibold text-primary">{i + 1}.</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.citations?.length > 0 && (
                <section>
                  <h3 className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <FileText className="h-3 w-3" /> Sources
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.citations.map((c, i) => (
                      <Badge key={i} className="text-[10px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
