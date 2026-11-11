"use client";

import { useState } from "react";
import { DATASET_IDS, DATASETS, type DatasetId } from "@/lib/domain/datasets";
import { Button } from "@/components/ui/button";
import { useDomain } from "@/components/app-state";

export function ImportPanel() {
  const [dataset, setDataset] = useState<DatasetId>("kpi_actuals");
  const [csv, setCsv] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [pending, setPending] = useState(false);
  const { refresh } = useDomain();
  const spec = DATASETS[dataset];

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setErrors([]);
    try {
      const res = await fetch(`/api/records/${dataset}/import`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(Array.isArray(data.errors) ? data.errors : []);
        throw new Error(data.error || "Import failed");
      }
      setMessage(`Imported ${data.created + data.updated} rows (${data.created} new, ${data.updated} updated).`);
      setCsv("");
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        Dataset
        <select className="mt-1 h-10 w-full max-w-md rounded-lg border bg-background px-2" value={dataset} onChange={(event) => setDataset(event.target.value as DatasetId)}>
          {DATASET_IDS.map((id) => (
            <option key={id} value={id}>
              {DATASETS[id].label}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm text-muted-foreground">{spec.description} A failed row blocks the whole file, so the working dataset is left unchanged.</p>
      <div className="flex flex-wrap gap-3 text-sm">
        <a className="text-primary hover:underline" href={`/api/records/${dataset}/template`}>
          Download template
        </a>
        <a className="text-primary hover:underline" href={`/api/records/${dataset}/export`}>
          Download current CSV
        </a>
      </div>
      <label className="block text-sm">
        CSV file
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-1 block text-sm"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) setCsv(await file.text());
          }}
        />
      </label>
      <label className="block text-sm">
        Or paste CSV
        <textarea className="mt-1 min-h-40 w-full rounded-lg border bg-background p-3 font-mono text-xs" value={csv} onChange={(event) => setCsv(event.target.value)} />
      </label>
      {message && <p className="text-sm">{message}</p>}
      {errors.length > 0 && (
        <ul className="space-y-1 text-sm text-red-500">
          {errors.map((error, index) => (
            <li key={`${error.row}-${index}`}>
              Row {error.row}: {error.message}
            </li>
          ))}
        </ul>
      )}
      <Button type="submit" disabled={pending || !csv.trim()}>
        {pending ? "Importing…" : "Import"}
      </Button>
    </form>
  );
}
