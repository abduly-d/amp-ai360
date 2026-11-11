"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DATASET_IDS, DATASETS, type DatasetId, type FieldSpec } from "@/lib/domain/datasets";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/page-header";
import { saveRecord, useAuth, useDomain } from "@/components/app-state";

const LONG = new Set(["description", "commentary", "detail", "summary", "mandate", "recommendation", "note"]);

export function DataManager() {
  const params = useSearchParams();
  const requested = params.get("dataset");
  const initial = DATASET_IDS.includes(requested as DatasetId) ? (requested as DatasetId) : "kpis";
  const [dataset, setDataset] = useState<DatasetId>(initial);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { snapshot, refresh } = useDomain();
  const { name } = useAuth();
  const spec = DATASETS[dataset];
  const shown = useMemo(() => {
    const source = snapshot.tables[dataset] ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return source;
    return source.filter((row) => JSON.stringify(row).toLowerCase().includes(needle));
  }, [snapshot.tables, dataset, q]);
  const columns = spec.fields.slice(0, 4);

  async function remove(id: string) {
    if (!window.confirm("Delete this record? The audit log will keep the previous values.")) return;
    setError(null);
    try {
      await saveRecord(dataset, "DELETE", { id });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <div className="space-y-4">
      {!name && <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">You are viewing the working dataset. Sign in to create, edit, or delete records.</p>}
      <div className="flex flex-wrap gap-2">
        {DATASET_IDS.map((id) => (
          <button
            key={id}
            onClick={() => setDataset(id)}
            className={`rounded-full px-3 py-1 text-xs ${dataset === id ? "bg-primary text-primary-foreground" : "border hover:bg-secondary"}`}
          >
            {DATASETS[id].label}
            <span className="ml-1 opacity-70">{snapshot.meta[id]?.count ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={`Search ${spec.label.toLowerCase()}`}
          aria-label={`Search ${spec.label}`}
          className="h-9 min-w-[12rem] flex-1 rounded-lg border bg-background px-3 text-sm"
        />
        <a className="text-xs text-primary hover:underline" href={`/api/records/${dataset}/export`}>
          Export CSV
        </a>
        <a className="text-xs text-primary hover:underline" href={`/api/records/${dataset}/template`}>
          Template
        </a>
        <Button size="sm" disabled={!name} onClick={() => setCreating(true)}>
          New {spec.singular}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {shown.length === 0 ? (
        <EmptyState title={`No ${spec.label.toLowerCase()}`} body="Nothing matches this dataset yet. Editors can add a row or import a CSV." />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                {columns.map((field) => (
                  <th key={field.key} className="px-3 py-2 font-medium">
                    {field.label}
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Updated</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const id = String(row[spec.pk] ?? "");
                return (
                  <tr key={id} className="border-t">
                    {columns.map((field) => (
                      <td key={field.key} className="max-w-[16rem] truncate px-3 py-2">
                        {formatCell(row[field.key])}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {row.updatedAt ? new Date(String(row.updatedAt)).toLocaleDateString("en-GB") : "—"}
                      {row.updatedBy ? ` · ${row.updatedBy}` : ""}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button className="text-xs text-primary hover:underline disabled:opacity-40" disabled={!name} onClick={() => setEditing(row)}>
                          Edit
                        </button>
                        <button className="text-xs text-red-500 hover:underline disabled:opacity-40" disabled={!name} onClick={() => remove(id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {(creating || editing) && (
        <RecordDialog
          dataset={dataset}
          existing={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value == null || value === "") return "—";
  return String(value);
}

function RecordDialog({
  dataset,
  existing,
  onClose,
  onSaved,
}: {
  dataset: DatasetId;
  existing: Record<string, unknown> | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const spec = DATASETS[dataset];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of spec.fields) initial[field.key] = formatCell(existing?.[field.key]) === "—" ? "" : formatCell(existing?.[field.key]);
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { ...values };
      if (existing) payload.id = existing[spec.pk];
      await saveRecord(dataset, existing ? "PATCH" : "POST", payload);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" role="presentation" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
        className="thin-scroll max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card p-5 shadow-xl"
      >
        <h2 id="record-title" className="text-base font-semibold">
          {existing ? "Edit" : "New"} {spec.singular}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {spec.fields.map((field) => (
            <FieldInput key={field.key} field={field} value={values[field.key] ?? ""} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} />
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: FieldSpec; value: string; onChange: (value: string) => void }) {
  const wide = LONG.has(field.key);
  return (
    <label className={`block text-xs ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block font-medium">
        {field.label}
        {field.required ? "" : " (optional)"}
      </span>
      {field.kind === "enum" ? (
        <select className="h-9 w-full rounded-lg border bg-background px-2" value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select</option>
          {field.enums?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : wide ? (
        <textarea className="min-h-[5rem] w-full rounded-lg border bg-background px-2 py-1.5" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="h-9 w-full rounded-lg border bg-background px-2" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {field.help && <span className="mt-1 block text-[11px] text-muted-foreground">{field.help}</span>}
    </label>
  );
}
