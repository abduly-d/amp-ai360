"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/page-header";

interface Entry {
  id: string;
  at: string;
  actor: string;
  action: string;
  dataset: string;
  recordId: string;
  summary: string;
  before: unknown;
  after: unknown;
}

export function AuditTable() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/audit?limit=200", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setEntries(Array.isArray(data.entries) ? data.entries : []);
        setWarning(data.warning ?? null);
      })
      .catch(() => {
        setEntries([]);
        setWarning("The audit log could not be loaded.");
      });
  }, []);

  if (!entries) return <p className="text-sm text-muted-foreground">Loading the audit log…</p>;
  if (!entries.length) {
    return <EmptyState title="No changes yet" body={warning || "Edits, imports, and deletions will appear here with the editor name and a before/after snapshot."} />;
  }
  return (
    <div className="space-y-2">
      {warning && <p className="text-sm text-tz-gold">{warning}</p>}
      {entries.map((entry) => (
        <details key={entry.id} className="rounded-lg border bg-card px-3 py-2">
          <summary className="cursor-pointer text-sm">
            <span className="font-medium">{entry.summary}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {new Date(entry.at).toLocaleString("en-GB")} · {entry.actor} · {entry.action} · {entry.dataset}
              {entry.recordId && entry.recordId !== "*" ? ` · ${entry.recordId}` : ""}
            </span>
          </summary>
          <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
            <pre className="overflow-auto rounded bg-secondary/50 p-2">{JSON.stringify(entry.before, null, 2)}</pre>
            <pre className="overflow-auto rounded bg-secondary/50 p-2">{JSON.stringify(entry.after, null, 2)}</pre>
          </div>
        </details>
      ))}
    </div>
  );
}
