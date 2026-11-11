import type { DatasetId } from "@/lib/domain/datasets";
import type { Row } from "@/lib/domain/validate";

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: "create" | "update" | "delete" | "import";
  dataset: string;
  recordId: string;
  summary: string;
  before: Row | null;
  after: Row | null;
}

export interface DataStore {
  readonly mode: "postgres" | "memory";
  readonly dbOk: boolean;
  readonly warning: string | null;
  init(): Promise<void>;
  list(dataset: DatasetId): Promise<Row[]>;
  get(dataset: DatasetId, id: string): Promise<Row | null>;
  create(dataset: DatasetId, row: Row, actor: string): Promise<Row>;
  update(dataset: DatasetId, id: string, row: Row, actor: string): Promise<Row>;
  remove(dataset: DatasetId, id: string, actor: string): Promise<void>;
  upsertMany(dataset: DatasetId, rows: Row[], actor: string): Promise<{ created: number; updated: number }>;
  audit(limit?: number): Promise<AuditEntry[]>;
  counts(): Promise<Record<DatasetId, number>>;
}
