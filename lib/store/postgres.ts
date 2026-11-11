import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { DATASET_IDS, DATASETS, type DatasetId } from "@/lib/domain/datasets";
import { buildSeed, SEED_AT } from "@/lib/domain/seed";
import { assertIdent, displayName, rowId, stamp, type Row } from "@/lib/domain/validate";
import { compileList, compileUpsert, fromDb, schemaStatements } from "./sql";
import type { AuditEntry, DataStore } from "./types";

type Query = (text: string, values?: unknown[]) => Promise<Record<string, unknown>[]>;

function isNeonUrl(url: string) {
  return /neon\.tech|neon\.build/i.test(url);
}

/** Neon hosts use the HTTP serverless driver. Any other Postgres URL uses the wire protocol. */
export function createQuery(url: string): Query {
  if (isNeonUrl(url)) {
    const sql = neon(url);
    return async (text, values = []) => (await sql.query(text, values)) as Record<string, unknown>[];
  }
  const client = postgres(url, {
    ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require",
    max: 1,
    idle_timeout: 20,
    onnotice: () => {},
  });
  return async (text, values = []) => {
    const rows = await client.unsafe(text, values as never[]);
    return Array.from(rows) as unknown as Record<string, unknown>[];
  };
}

export class PostgresStore implements DataStore {
  readonly mode = "postgres" as const;
  dbOk = true;
  warning: string | null = null;
  private query: Query;

  constructor(url: string) {
    this.query = createQuery(url);
  }

  async init(): Promise<void> {
    for (const statement of schemaStatements()) {
      await this.query(statement);
    }
    const seeded = await this.query(`SELECT value FROM app_meta WHERE key = 'seeded'`);
    if (seeded.length > 0) return;
    const seed = buildSeed();
    for (const dataset of DATASET_IDS) {
      for (const row of seed[dataset]) {
        const compiled = compileUpsert(dataset, row, "ignore");
        await this.query(compiled.text, compiled.values);
      }
    }
    await this.query(
      `INSERT INTO app_meta (key, value) VALUES ('seeded', $1) ON CONFLICT (key) DO NOTHING`,
      [SEED_AT]
    );
  }

  async list(dataset: DatasetId): Promise<Row[]> {
    const records = await this.query(compileList(dataset));
    return records.map((record) => fromDb(dataset, record as Record<string, unknown>));
  }

  async get(dataset: DatasetId, id: string): Promise<Row | null> {
    const spec = DATASETS[dataset];
    const table = assertIdent(spec.table);
    const column = assertIdent(spec.fields.find((field) => field.key === spec.pk)!.column);
    const records = await this.query(`SELECT * FROM ${table} WHERE ${column} = $1`, [String(id)]);
    const record = records[0];
    return record ? fromDb(dataset, record as Record<string, unknown>) : null;
  }

  async create(dataset: DatasetId, row: Row, actor: string): Promise<Row> {
    const spec = DATASETS[dataset];
    const id = rowId(row, spec);
    const existing = await this.findExisting(dataset, row);
    if (existing) throw new Error("A record with this id already exists");
    const next = stamp(row, actor);
    const compiled = compileUpsert(dataset, next, "merge");
    await this.query(compiled.text, compiled.values);
    await this.writeAudit("create", dataset, id, `create ${displayName(next)}`, null, next, actor);
    const saved = await this.get(dataset, id);
    if (!saved) throw new Error("Record was not saved");
    return saved;
  }

  async update(dataset: DatasetId, id: string, row: Row, actor: string): Promise<Row> {
    const before = await this.get(dataset, id);
    if (!before) throw new Error("Record not found");
    const next = stamp({ ...row, [DATASETS[dataset].pk]: before[DATASETS[dataset].pk] }, actor);
    const compiled = compileUpsert(dataset, next, "merge");
    await this.query(compiled.text, compiled.values);
    await this.writeAudit("update", dataset, id, `update ${displayName(next)}`, before, next, actor);
    const saved = await this.get(dataset, id);
    if (!saved) throw new Error("Record was not saved");
    return saved;
  }

  async remove(dataset: DatasetId, id: string, actor: string): Promise<void> {
    const before = await this.get(dataset, id);
    if (!before) throw new Error("Record not found");
    const spec = DATASETS[dataset];
    const table = assertIdent(spec.table);
    const column = assertIdent(spec.fields.find((field) => field.key === spec.pk)!.column);
    await this.query(`DELETE FROM ${table} WHERE ${column} = $1`, [String(id)]);
    await this.writeAudit("delete", dataset, id, `delete ${displayName(before)}`, before, null, actor);
  }

  async upsertMany(dataset: DatasetId, rows: Row[], actor: string): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    for (const row of rows) {
      const existing = await this.findExisting(dataset, row);
      const spec = DATASETS[dataset];
      const next = stamp(existing ? { ...row, [spec.pk]: existing[spec.pk] } : row, actor);
      const compiled = compileUpsert(dataset, next, "merge");
      await this.query(compiled.text, compiled.values);
      if (existing) updated++;
      else created++;
    }
    await this.writeAudit(
      "import",
      dataset,
      "*",
      `Imported ${rows.length} ${DATASETS[dataset].label.toLowerCase()} (${created} new, ${updated} updated)`,
      null,
      { created, updated },
      actor
    );
    return { created, updated };
  }

  async audit(limit = 100): Promise<AuditEntry[]> {
    const records = await this.query(
      `SELECT id, at, actor, action, dataset, record_id, summary, before, after FROM audit_log ORDER BY at DESC LIMIT $1`,
      [Math.max(1, Math.min(500, limit))]
    );
    return records.map((record) => {
      const row = record as Record<string, unknown>;
      const at = row.at instanceof Date ? row.at.toISOString() : new Date(String(row.at)).toISOString();
      return {
        id: String(row.id),
        at,
        actor: String(row.actor),
        action: String(row.action) as AuditEntry["action"],
        dataset: String(row.dataset),
        recordId: String(row.record_id ?? ""),
        summary: String(row.summary),
        before: (row.before as Row | null) ?? null,
        after: (row.after as Row | null) ?? null,
      };
    });
  }

  async counts(): Promise<Record<DatasetId, number>> {
    const entries = await Promise.all(
      DATASET_IDS.map(async (dataset) => {
        const spec = DATASETS[dataset];
        const records = await this.query(`SELECT COUNT(*)::int AS count FROM ${assertIdent(spec.table)}`);
        const count = Number((records[0] as { count?: number })?.count ?? 0);
        return [dataset, count] as const;
      })
    );
    return Object.fromEntries(entries) as Record<DatasetId, number>;
  }

  private async findExisting(dataset: DatasetId, row: Row): Promise<Row | null> {
    const spec = DATASETS[dataset];
    const byId = await this.get(dataset, rowId(row, spec));
    if (byId) return byId;
    if (!spec.natural?.length) return null;
    const rows = await this.list(dataset);
    return (
      rows.find((item) => spec.natural!.every((key) => String(item[key] ?? "") !== "" && String(item[key]) === String(row[key] ?? ""))) ??
      null
    );
  }

  private async writeAudit(
    action: AuditEntry["action"],
    dataset: DatasetId,
    id: string,
    summary: string,
    before: Row | null,
    after: Row | null,
    actor: string
  ) {
    await this.query(
      `INSERT INTO audit_log (id, actor, action, dataset, record_id, summary, before, after) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)`,
      [
        `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        actor,
        action,
        dataset,
        id,
        summary,
        before ? JSON.stringify(before) : null,
        after ? JSON.stringify(after) : null,
      ]
    );
  }
}
