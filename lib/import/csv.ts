import { DATASETS, type DatasetId, type FieldSpec } from "@/lib/domain/datasets";
import { assignId, validateRow, type Row, type ValidationError } from "@/lib/domain/validate";

export function csvHeaders(dataset: DatasetId): string[] {
  return DATASETS[dataset].fields.map((field) => field.key);
}

function escapeCell(value: unknown, field: FieldSpec): string {
  let text = "";
  if (value == null) text = "";
  else if (Array.isArray(value)) text = value.join("|");
  else text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(dataset: DatasetId, rows: Row[]): string {
  const spec = DATASETS[dataset];
  const lines = [spec.fields.map((field) => field.key).join(",")];
  for (const row of rows) {
    lines.push(spec.fields.map((field) => escapeCell(row[field.key], field)).join(","));
  }
  return lines.join("\n") + "\n";
}

export function templateCsv(dataset: DatasetId): string {
  return toCsv(dataset, []);
}

/** RFC-style CSV parser. Supports quoted commas, quotes, and newlines. */
export function parseCsv(input: string): { headers: string[]; rows: string[][] } {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += char;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n") {
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }
  const headers = (rows.shift() ?? []).map((header) => header.trim());
  return { headers, rows };
}

export function importCsv(
  dataset: DatasetId,
  csv: string
): { ok: true; rows: Row[] } | { ok: false; errors: ValidationError[] } {
  const { headers, rows } = parseCsv(csv);
  if (!headers.length) return { ok: false, errors: [{ row: 1, message: "The file has no header row" }] };
  const spec = DATASETS[dataset];
  const known = new Set(spec.fields.map((field) => field.key));
  const unknown = headers.filter((header) => header && !known.has(header));
  if (unknown.length) {
    return { ok: false, errors: [{ row: 1, message: `Unknown columns: ${unknown.join(", ")}` }] };
  }
  const missing = spec.fields.filter((field) => field.required && field.key !== "id" && !headers.includes(field.key));
  if (missing.length) {
    return {
      ok: false,
      errors: [{ row: 1, message: `Missing required columns: ${missing.map((field) => field.key).join(", ")}` }],
    };
  }

  const errors: ValidationError[] = [];
  const parsed: Row[] = [];
  rows.forEach((cells, index) => {
    const record: Row = {};
    headers.forEach((header, column) => {
      if (header) record[header] = cells[column] ?? "";
    });
    if (String(record.id ?? "").toLowerCase().startsWith("example")) return;
    const checked = validateRow(dataset, assignId(dataset, record));
    if (!checked.ok) {
      for (const message of checked.errors) errors.push({ row: index + 2, message });
      return;
    }
    parsed.push(checked.value);
  });
  if (errors.length) return { ok: false, errors };
  if (!parsed.length) return { ok: false, errors: [{ row: 2, message: "The file has no data rows" }] };
  return { ok: true, rows: parsed };
}
