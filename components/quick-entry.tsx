"use client";

import { useState } from "react";
import { DATASETS, type DatasetId } from "@/lib/domain/datasets";
import { Button } from "@/components/ui/button";
import { saveRecord, useAuth, useDomain } from "@/components/app-state";

export function QuickEntry({
  dataset,
  title,
  help,
  preset = {},
}: {
  dataset: DatasetId;
  title: string;
  help: string;
  preset?: Record<string, string>;
}) {
  const { name, editingEnabled } = useAuth();
  const { refresh } = useDomain();
  const spec = DATASETS[dataset];
  const [values, setValues] = useState<Record<string, string>>(preset);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!editingEnabled) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
        Editing is turned off on this deployment. Viewers can read the working figures but cannot change them.
      </p>
    );
  }
  if (!name) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
        Sign in as an editor to {help}.
      </p>
    );
  }

  const fields = spec.fields.filter((field) => field.key !== "id");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(null);
    try {
      await saveRecord(dataset, "POST", { ...preset, ...values });
      await refresh();
      setSaved("Saved. The audit log has the note and your name.");
      setValues(preset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-card p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{help}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <label key={field.key} className="block text-xs">
            <span className="mb-1 block font-medium">
              {field.label}
              {field.required ? "" : " (optional)"}
            </span>
            {field.kind === "enum" ? (
              <select
                className="h-9 w-full rounded-lg border bg-background px-2"
                value={values[field.key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                required={field.required}
              >
                <option value="">Select</option>
                {field.enums?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="h-9 w-full rounded-lg border bg-background px-2"
                value={values[field.key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                required={field.required}
                type={field.kind === "number" || field.kind === "int" ? "number" : field.key === "timestamp" ? "datetime-local" : "text"}
                step="any"
              />
            )}
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {saved && <p className="mt-2 text-xs text-tz-green">{saved}</p>}
      <Button type="submit" size="sm" className="mt-3" disabled={pending}>
        {pending ? "Saving…" : "Save entry"}
      </Button>
    </form>
  );
}
