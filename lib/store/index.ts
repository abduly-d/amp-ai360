import path from "node:path";
import { DATASET_IDS } from "@/lib/domain/datasets";
import { buildSnapshot, type DomainSnapshot } from "@/lib/domain/snapshot";
import { emptyTables } from "@/lib/domain/seed";
import { MemoryStore } from "./memory";
import { PostgresStore } from "./postgres";
import type { DataStore } from "./types";

let pending: Promise<DataStore> | null = null;

export function databaseUrl(): string {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

function localFile(): string | null {
  if (process.env.AMP_STORE_FILE) return process.env.AMP_STORE_FILE;
  if (process.env.AMP_STORE === "memory") return null;
  if (process.env.NODE_ENV === "production") return null;
  return path.join(process.cwd(), ".data", "store.json");
}

export async function openStore(): Promise<DataStore> {
  const url = databaseUrl();
  if (!url) {
    try {
      return await MemoryStore.open(localFile());
    } catch (error) {
      console.error("Local store failed, using an empty in-memory dataset", error);
      const store = MemoryStore.empty();
      store.warning = "The local dataset could not be loaded.";
      return store;
    }
  }
  try {
    const store = new PostgresStore(url);
    await store.init();
    return store;
  } catch (error) {
    const message = error instanceof Error ? error.message : "connection failed";
    console.error("Postgres unavailable, falling back to the seeded dataset:", message);
    const store = MemoryStore.fromSeed();
    store.dbOk = false;
    store.warning = "The database is unavailable. Figures shown are the public seed and will not be saved.";
    return store;
  }
}

export function getStore(): Promise<DataStore> {
  if (!pending) pending = openStore();
  return pending;
}

export function resetStoreCache(): void {
  pending = null;
}

export async function loadSnapshot(): Promise<DomainSnapshot> {
  try {
    const store = await getStore();
    const tables = emptyTables();
    await Promise.all(
      DATASET_IDS.map(async (dataset) => {
        try {
          tables[dataset] = await store.list(dataset);
        } catch (error) {
          console.error(`Failed to read ${dataset}`, error);
          tables[dataset] = [];
        }
      })
    );
    return buildSnapshot(tables, {
      mode: store.mode,
      dbOk: store.dbOk,
      warning: store.warning,
    });
  } catch (error) {
    console.error("Snapshot failed", error);
    return buildSnapshot(emptyTables(), {
      mode: "memory",
      dbOk: false,
      warning: "Data could not be loaded. The workspace is empty until the database is reachable.",
    });
  }
}
