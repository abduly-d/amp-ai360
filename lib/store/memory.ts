import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATASET_IDS, DATASETS, type DatasetId } from "@/lib/domain/datasets";
import { buildSeed, emptyTables, type Tables } from "@/lib/domain/seed";
import { displayName, rowId, stamp, type Row } from "@/lib/domain/validate";
import type { AuditEntry, DataStore } from "./types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sameNatural(dataset: DatasetId, a: Row, b: Row): boolean {
  const keys = DATASETS[dataset].natural;
  if (!keys?.length) return false;
  return keys.every((key) => String(a[key] ?? "") === String(b[key] ?? "") && String(a[key] ?? "") !== "");
}

function sortRows(dataset: DatasetId, rows: Row[]): Row[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    if (dataset === "flagships" || dataset === "flagship_progress") {
      const flag = Number(a.flagshipId ?? a.id) - Number(b.flagshipId ?? b.id);
      if (flag) return flag;
      return String(a.period ?? "").localeCompare(String(b.period ?? ""));
    }
    if (dataset === "kpi_actuals" || dataset === "commodity_points") {
      const parent = String(a.kpiId ?? a.commodityId).localeCompare(String(b.kpiId ?? b.commodityId));
      if (parent) return parent;
      return Number(a.year) - Number(b.year);
    }
    if (dataset === "alerts") return String(b.timestamp ?? "").localeCompare(String(a.timestamp ?? ""));
    const label = (row: Row) => String(row.name ?? row.label ?? row.acronym ?? row.dimension ?? row.id ?? "");
    return label(a).localeCompare(label(b));
  });
  return copy;
}

export class MemoryStore implements DataStore {
  readonly mode = "memory" as const;
  dbOk = true;
  warning: string | null = null;
  private tables: Tables;
  private auditLog: AuditEntry[] = [];
  private file: string | null;
  private persistQueue: Promise<void> = Promise.resolve();

  private constructor(tables: Tables, audit: AuditEntry[], file: string | null) {
    this.tables = tables;
    this.auditLog = audit;
    this.file = file;
  }

  static fromSeed(): MemoryStore {
    return new MemoryStore(buildSeed(), [], null);
  }

  static empty(): MemoryStore {
    return new MemoryStore(emptyTables(), [], null);
  }

  static async open(file: string | null): Promise<MemoryStore> {
    if (!file) return MemoryStore.fromSeed();
    try {
      const raw = await readFile(file, "utf8");
      const parsed = JSON.parse(raw) as { tables?: Tables; audit?: AuditEntry[] };
      if (!parsed.tables) return MemoryStore.fromSeed();
      const tables = emptyTables();
      for (const id of DATASET_IDS) tables[id] = Array.isArray(parsed.tables[id]) ? parsed.tables[id] : [];
      return new MemoryStore(tables, Array.isArray(parsed.audit) ? parsed.audit : [], file);
    } catch (error) {
      const missing = error && typeof error === "object" && "code" in error && error.code === "ENOENT";
      const store = MemoryStore.fromSeed();
      store.file = file;
      if (!missing) store.warning = "Local data file could not be read. Started from the public seed.";
      await store.persist();
      return store;
    }
  }

  async init(): Promise<void> {
    return;
  }

  async list(dataset: DatasetId): Promise<Row[]> {
    return clone(sortRows(dataset, this.tables[dataset]));
  }

  async get(dataset: DatasetId, id: string): Promise<Row | null> {
    const row = this.tables[dataset].find((item) => rowId(item, DATASETS[dataset]) === id);
    return row ? clone(row) : null;
  }

  async create(dataset: DatasetId, row: Row, actor: string): Promise<Row> {
    const id = rowId(row, DATASETS[dataset]);
    if (this.tables[dataset].some((item) => rowId(item, DATASETS[dataset]) === id || sameNatural(dataset, item, row))) {
      throw new Error("A record with this id already exists");
    }
    const next = stamp(row, actor);
    this.tables[dataset].push(next);
    this.pushAudit("create", dataset, id, next, null, next, actor);
    await this.persist();
    return clone(next);
  }

  async update(dataset: DatasetId, id: string, row: Row, actor: string): Promise<Row> {
    const index = this.tables[dataset].findIndex((item) => rowId(item, DATASETS[dataset]) === id);
    if (index < 0) throw new Error("Record not found");
    const before = this.tables[dataset][index];
    const next = stamp({ ...row, [DATASETS[dataset].pk]: before[DATASETS[dataset].pk] }, actor);
    this.tables[dataset][index] = next;
    this.pushAudit("update", dataset, id, next, before, next, actor);
    await this.persist();
    return clone(next);
  }

  async remove(dataset: DatasetId, id: string, actor: string): Promise<void> {
    const index = this.tables[dataset].findIndex((item) => rowId(item, DATASETS[dataset]) === id);
    if (index < 0) throw new Error("Record not found");
    const [before] = this.tables[dataset].splice(index, 1);
    this.pushAudit("delete", dataset, id, before, before, null, actor);
    await this.persist();
  }

  async upsertMany(dataset: DatasetId, rows: Row[], actor: string): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    for (const row of rows) {
      const spec = DATASETS[dataset];
      const natural = this.tables[dataset].find((item) => sameNatural(dataset, item, row));
      const id = natural ? rowId(natural, spec) : rowId(row, spec);
      const index = this.tables[dataset].findIndex((item) => rowId(item, spec) === id);
      const next = stamp({ ...row, [spec.pk]: natural ? natural[spec.pk] : row[spec.pk] }, actor);
      if (index >= 0) {
        this.tables[dataset][index] = next;
        updated++;
      } else {
        this.tables[dataset].push(next);
        created++;
      }
    }
    this.pushAudit(
      "import",
      dataset,
      "*",
      null,
      null,
      { created, updated },
      actor,
      `Imported ${rows.length} ${DATASETS[dataset].label.toLowerCase()} (${created} new, ${updated} updated)`
    );
    await this.persist();
    return { created, updated };
  }

  async audit(limit = 100): Promise<AuditEntry[]> {
    return clone(this.auditLog.slice(0, limit));
  }

  async counts(): Promise<Record<DatasetId, number>> {
    return Object.fromEntries(DATASET_IDS.map((id) => [id, this.tables[id].length])) as Record<DatasetId, number>;
  }

  private pushAudit(
    action: AuditEntry["action"],
    dataset: DatasetId,
    id: string,
    row: Row | null,
    before: Row | null,
    after: Row | null,
    actor: string,
    summary?: string
  ) {
    this.auditLog.unshift({
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      actor,
      action,
      dataset,
      recordId: id,
      summary: summary ?? `${action} ${displayName(row ?? before ?? { id })}`,
      before: before ? clone(before) : null,
      after: after ? clone(after) : null,
    });
    this.auditLog = this.auditLog.slice(0, 500);
  }

  private async persist() {
    if (!this.file) return;
    const file = this.file;
    const payload = JSON.stringify({ version: 1, tables: this.tables, audit: this.auditLog });
    this.persistQueue = this.persistQueue.then(async () => {
      await mkdir(path.dirname(file), { recursive: true });
      const tmp = `${file}.tmp`;
      await writeFile(tmp, payload);
      await rename(tmp, file);
    }).catch(() => {
      this.warning = "Edits are kept in memory but could not be written to the local data file.";
    });
    await this.persistQueue;
  }
}
