import assert from "node:assert/strict";
import test from "node:test";
import { MemoryStore } from "./memory";
import { buildSnapshot } from "@/lib/domain/snapshot";
import { emptyTables } from "@/lib/domain/seed";
import { DATASET_IDS } from "@/lib/domain/datasets";

test("seed loads the public AMP dataset and an empty store does not throw", async () => {
  const store = MemoryStore.fromSeed();
  const counts = await store.counts();
  assert.equal(counts.flagships, 15);
  assert.equal(counts.commodities, 20);
  assert.equal(counts.regions, 26);
  assert.ok(counts.kpis >= 8);
  assert.ok(counts.kpi_actuals >= 8);
  assert.ok(counts.commodity_points > 20);
  assert.equal(counts.alerts > 0, true);

  const empty = MemoryStore.empty();
  const snapshot = buildSnapshot(emptyTables(), { mode: "memory", dbOk: true });
  assert.equal(snapshot.kpis.length, 0);
  assert.equal(snapshot.flagships.length, 0);
  assert.equal((await empty.list("flagships")).length, 0);
  for (const id of DATASET_IDS) assert.equal((await empty.list(id)).length, 0);
});

test("create, update, delete and actuals write an audit trail", async () => {
  const store = MemoryStore.fromSeed();
  const created = await store.create(
    "kpi_actuals",
    {
      id: "ag-growth-2027",
      kpiId: "ag-growth",
      year: 2027,
      value: 6.2,
      label: "6.2%",
      note: "Mid-year review",
      source: "ATO desk",
    },
    "Amina"
  );
  assert.equal(created.updatedBy, "Amina");
  assert.equal(created.value, 6.2);

  const updated = await store.update(
    "kpi_actuals",
    "ag-growth-2027",
    { ...created, value: 6.4, label: "6.4%", note: "Revised", source: "ATO desk" },
    "Amina"
  );
  assert.equal(updated.value, 6.4);

  const tables = emptyTables();
  for (const id of DATASET_IDS) tables[id] = await store.list(id);
  const snapshot = buildSnapshot(tables, { mode: "memory", dbOk: true });
  const growth = snapshot.kpis.find((kpi) => kpi.id === "ag-growth");
  assert.equal(growth?.current, 6.4);
  assert.equal(growth?.actualYear, 2027);
  assert.match(growth?.currentLabel ?? "", /6\.4/);

  await store.remove("kpi_actuals", "ag-growth-2027", "Amina");
  const audit = await store.audit(10);
  assert.deepEqual(
    audit.map((entry) => entry.action),
    ["delete", "update", "create"]
  );
  assert.equal(audit[0].actor, "Amina");
  assert.equal(audit[2].after && (audit[2].after as { note?: string }).note, "Mid-year review");
});

test("import upserts flagship progress by period and keeps a single audit entry", async () => {
  const store = MemoryStore.fromSeed();
  const first = await store.upsertMany(
    "flagship_progress",
    [
      {
        id: "f6-2026-Q3",
        flagshipId: 6,
        period: "2026-Q3",
        current: 1400,
        status: "at-risk",
        note: "Silo commissioning",
        source: "NFRA weekly",
      },
    ],
    "Joseph"
  );
  assert.deepEqual(first, { created: 1, updated: 0 });

  const second = await store.upsertMany(
    "flagship_progress",
    [
      {
        id: "different-id",
        flagshipId: 6,
        period: "2026-Q3",
        current: 1500,
        status: "at-risk",
        note: "Updated count",
        source: "NFRA weekly",
      },
    ],
    "Joseph"
  );
  assert.deepEqual(second, { created: 0, updated: 1 });
  const rows = await store.list("flagship_progress");
  const match = rows.filter((row) => row.flagshipId === 6 && row.period === "2026-Q3");
  assert.equal(match.length, 1);
  assert.equal(match[0].current, 1500);
  const audit = await store.audit(2);
  assert.equal(audit[0].action, "import");
  assert.match(audit[0].summary, /1 new, 1 updated|0 new, 1 updated/);
});

test("duplicate create is rejected", async () => {
  const store = MemoryStore.empty();
  await store.create(
    "alerts",
    {
      id: "a-new",
      level: "amber",
      title: "Seed delay",
      detail: "Certified seed is late in the southern highlands.",
      category: "Inputs",
      flagship: 2,
      recommendation: "Release ASA buffer stock.",
      timestamp: "2026-08-01T00:00:00.000Z",
      note: "",
      source: "Extension report",
    },
    "Amina"
  );
  await assert.rejects(() =>
    store.create(
      "alerts",
      {
        id: "a-new",
        level: "red",
        title: "Seed delay",
        detail: "Still late.",
        category: "Inputs",
        flagship: 2,
        recommendation: "Escalate.",
        timestamp: "2026-08-02T00:00:00.000Z",
        note: "",
        source: "Extension report",
      },
      "Amina"
    )
  );
});
