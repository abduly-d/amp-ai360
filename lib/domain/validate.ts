import { DATASETS, type DatasetId, type DatasetSpec, type FieldSpec } from "./datasets";

export type Row = Record<string, unknown>;

export interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

export interface ValidationOk {
  ok: true;
  value: Row;
}

export interface ValidationFail {
  ok: false;
  errors: string[];
}

const IDENT = /^[a-z_][a-z0-9_]*$/;

export function assertIdent(name: string): string {
  if (!IDENT.test(name)) throw new Error(`Unsafe SQL identifier: ${name}`);
  return name;
}

export function splitList(value: string): string[] {
  return value
    .split(/[|,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function coerceField(field: FieldSpec, raw: unknown): unknown {
  if (raw == null || raw === "") {
    if (field.kind === "textlist" || field.kind === "intlist") return [];
    if (field.kind === "text" || field.kind === "enum") return "";
    return null;
  }
  if (field.kind === "text" || field.kind === "enum") return String(raw).trim();
  if (field.kind === "number" || field.kind === "int") {
    const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, "").trim());
    if (!Number.isFinite(n)) return null;
    return field.kind === "int" ? Math.trunc(n) : n;
  }
  if (field.kind === "intlist") {
    if (Array.isArray(raw)) return raw.map((item) => Math.trunc(Number(item))).filter((n) => Number.isFinite(n));
    return splitList(String(raw))
      .map((item) => Math.trunc(Number(item)))
      .filter((n) => Number.isFinite(n));
  }
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean);
  const text = String(raw).trim();
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch {
      /* treat as a delimited list */
    }
  }
  return splitList(text);
}

export function validateRow(dataset: DatasetId, input: Row): ValidationOk | ValidationFail {
  const spec = DATASETS[dataset];
  const errors: string[] = [];
  const value: Row = {};

  for (const field of spec.fields) {
    const coerced = coerceField(field, input[field.key]);
    if (field.required && (coerced == null || coerced === "" || (Array.isArray(coerced) && coerced.length === 0 && field.kind !== "textlist" && field.kind !== "intlist"))) {
      if (coerced == null || coerced === "") errors.push(`${field.label} is required`);
    }
    if ((field.kind === "number" || field.kind === "int") && field.required && (coerced == null || typeof coerced !== "number")) {
      errors.push(`${field.label} must be a number`);
    }
    if (field.kind === "enum" && coerced && field.enums && !field.enums.includes(String(coerced))) {
      errors.push(`${field.label} must be one of: ${field.enums.join(", ")}`);
    }
    if (field.kind === "int" && typeof coerced === "number") {
      if (field.key === "year" && (coerced < 1990 || coerced > 2100)) errors.push(`${field.label} is out of range`);
      if (dataset === "flagships" && field.key === "id" && (coerced < 1 || coerced > 99)) {
        errors.push("Flagship number must be between 1 and 99");
      }
    }
    value[field.key] = coerced === "" && !field.required && field.kind !== "enum" ? "" : coerced;
  }

  if (dataset === "investments") {
    const req = typeof value.req === "number" ? value.req : null;
    const sec = typeof value.sec === "number" ? value.sec : null;
    if (req != null && sec != null && (value.gap == null || value.gap === "")) {
      value.gap = Math.round((req - sec) * 100) / 100;
    }
  }

  if (dataset === "alerts" && value.timestamp) {
    const t = Date.parse(String(value.timestamp));
    if (Number.isNaN(t)) errors.push("Timestamp must be a valid date");
    else value.timestamp = new Date(t).toISOString();
  }

  if (errors.length) return { ok: false, errors: unique(errors) };
  return { ok: true, value };
}

export function stamp(row: Row, actor: string, at = new Date().toISOString()): Row {
  return { ...row, updatedAt: at, updatedBy: actor };
}

export function rowId(row: Row, spec: DatasetSpec): string {
  return String(row[spec.pk] ?? "");
}

export function displayName(row: Row): string {
  const pick = row.name ?? row.label ?? row.title ?? row.dimension ?? row.period ?? row.id;
  return String(pick ?? "record");
}

export function assignId(dataset: DatasetId, row: Row): Row {
  const spec = DATASETS[dataset];
  if (row[spec.pk] != null && row[spec.pk] !== "") return row;
  if (dataset === "investments") return { ...row, id: `INV-${Date.now().toString(36).toUpperCase()}` };
  if (dataset === "kpi_actuals" && row.kpiId && row.year) return { ...row, id: `${row.kpiId}-${row.year}` };
  if (dataset === "flagship_progress" && row.flagshipId && row.period) {
    return { ...row, id: `f${row.flagshipId}-${row.period}` };
  }
  if (dataset === "commodity_points" && row.commodityId && row.year) {
    return { ...row, id: `${row.commodityId}-${row.year}` };
  }
  return { ...row, id: `rec-${Math.random().toString(36).slice(2, 10)}` };
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}
