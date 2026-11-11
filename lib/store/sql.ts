import { DATASET_IDS, DATASETS, type DatasetId, type DatasetSpec, type FieldSpec } from "@/lib/domain/datasets";
import { assertIdent, type Row } from "@/lib/domain/validate";

function sqlType(field: FieldSpec): string {
  if (field.kind === "int" && field.key !== "id" && field.key !== "flagshipId") return "INTEGER";
  if (field.kind === "number") return "DOUBLE PRECISION";
  if (field.kind === "textlist" || field.kind === "intlist") return "JSONB";
  if (field.key === "id" || field.key === "flagshipId") return "TEXT";
  if (field.kind === "int") return "INTEGER";
  return "TEXT";
}

function nullable(field: FieldSpec): string {
  return field.required ? " NOT NULL" : "";
}

export function createTableSql(spec: DatasetSpec): string {
  const table = assertIdent(spec.table);
  const columns = spec.fields.map((field) => {
    const column = assertIdent(field.column);
    return `${column} ${sqlType(field)}${nullable(field)}`;
  });
  columns.push("updated_at TIMESTAMPTZ NOT NULL DEFAULT now()");
  columns.push("updated_by TEXT NOT NULL DEFAULT ''");
  const pk = assertIdent(DATASETS[spec.id].fields.find((field) => field.key === spec.pk)!.column);
  return `CREATE TABLE IF NOT EXISTS ${table} (${columns.join(", ")}, PRIMARY KEY (${pk}))`;
}

export function schemaStatements(): string[] {
  return [
    `CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      at TIMESTAMPTZ NOT NULL DEFAULT now(),
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      dataset TEXT NOT NULL,
      record_id TEXT,
      summary TEXT NOT NULL,
      before JSONB,
      after JSONB
    )`,
    `CREATE INDEX IF NOT EXISTS audit_log_at_idx ON audit_log (at DESC)`,
    ...DATASET_IDS.map((id) => createTableSql(DATASETS[id])),
  ];
}

function isJson(field: FieldSpec): boolean {
  return field.kind === "textlist" || field.kind === "intlist";
}

export function toParam(field: FieldSpec, value: unknown): unknown {
  if (isJson(field)) return JSON.stringify(value ?? []);
  if ((field.key === "id" || field.key === "flagshipId") && value != null) return String(value);
  if (value === "") return null;
  return value ?? null;
}

export function compileUpsert(dataset: DatasetId, row: Row, mode: "merge" | "ignore"): { text: string; values: unknown[] } {
  const spec = DATASETS[dataset];
  const table = assertIdent(spec.table);
  const fields = spec.fields;
  const columns = [...fields.map((field) => assertIdent(field.column)), "updated_at", "updated_by"];
  const values: unknown[] = fields.map((field) => toParam(field, row[field.key]));
  values.push(row.updatedAt ?? new Date().toISOString());
  values.push(row.updatedBy ?? "");
  const placeholders = fields.map((field, index) => (isJson(field) ? `$${index + 1}::jsonb` : `$${index + 1}`));
  placeholders.push(`$${fields.length + 1}`);
  placeholders.push(`$${fields.length + 2}`);
  const pk = assertIdent(fields.find((field) => field.key === spec.pk)!.column);
  const updates = columns
    .filter((column) => column !== pk)
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(", ");
  const conflict = mode === "ignore" ? "DO NOTHING" : `DO UPDATE SET ${updates}`;
  return {
    text: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) ON CONFLICT (${pk}) ${conflict}`,
    values,
  };
}

export function compileList(dataset: DatasetId): string {
  const spec = DATASETS[dataset];
  return `SELECT * FROM ${assertIdent(spec.table)} ORDER BY ${spec.orderSql}`;
}

export function fromDb(dataset: DatasetId, record: Record<string, unknown>): Row {
  const spec = DATASETS[dataset];
  const row: Row = {};
  for (const field of spec.fields) {
    let value = record[field.column];
    if (typeof value === "string" && (field.kind === "textlist" || field.kind === "intlist")) {
      try {
        value = JSON.parse(value);
      } catch {
        value = [];
      }
    }
    if (field.kind === "number" || (field.kind === "int" && field.key !== "id" && field.key !== "flagshipId")) {
      if (value == null || value === "") row[field.key] = null;
      else row[field.key] = field.kind === "int" ? Math.trunc(Number(value)) : Number(value);
    } else if (field.key === "id" && field.kind === "int") {
      row[field.key] = Math.trunc(Number(value));
    } else if (field.key === "flagshipId") {
      row[field.key] = Math.trunc(Number(value));
    } else if (field.kind === "intlist") {
      row[field.key] = Array.isArray(value) ? value.map((item) => Math.trunc(Number(item))) : [];
    } else if (field.kind === "textlist") {
      row[field.key] = Array.isArray(value) ? value.map(String) : [];
    } else {
      row[field.key] = value == null ? "" : value;
    }
  }
  const at = record.updated_at;
  row.updatedAt = at instanceof Date ? at.toISOString() : at ? new Date(String(at)).toISOString() : "";
  row.updatedBy = record.updated_by == null ? "" : String(record.updated_by);
  return row;
}
