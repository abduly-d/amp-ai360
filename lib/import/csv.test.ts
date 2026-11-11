import assert from "node:assert/strict";
import test from "node:test";
import { importCsv, parseCsv, templateCsv, toCsv } from "./csv";
import { schemaStatements } from "@/lib/store/sql";
import { DATASET_IDS } from "@/lib/domain/datasets";

test("parser keeps quoted commas and escaped quotes", () => {
  const parsed = parseCsv('id,name\n"a","Kilimo, ""MoA"""\n');
  assert.deepEqual(parsed.headers, ["id", "name"]);
  assert.deepEqual(parsed.rows, [["a", 'Kilimo, "MoA"']]);
});

test("template and round-trip export use the dataset columns", () => {
  const template = templateCsv("regions");
  assert.ok(template.startsWith("id,name,zone,"));
  const exported = toCsv("alerts", [
    {
      id: "a1",
      level: "red",
      title: "Reserves",
      detail: 'Below target, "urgent"',
      category: "Food Security",
      flagship: 6,
      recommendation: "Buy",
      timestamp: "2026-07-27T06:10:00.000Z",
      note: "",
      source: "NFRA",
    },
  ]);
  const parsed = parseCsv(exported);
  assert.equal(parsed.rows[0][0], "a1");
  assert.match(parsed.rows[0][3], /urgent/);
});

test("import rejects bad enums and accepts a valid actual", () => {
  const bad = importCsv(
    "flagship_progress",
    "id,flagshipId,period,current,status,note,source\nf1,1,2026,10,green,,desk\n"
  );
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.errors[0].message, /Status/);

  const good = importCsv(
    "kpi_actuals",
    "kpiId,year,value,label,note,source\nag-gdp,2026,22.4,$22.4B,Q2 release,NBS\n"
  );
  assert.equal(good.ok, true);
  if (good.ok) {
    assert.equal(good.rows[0].id, "ag-gdp-2026");
    assert.equal(good.rows[0].value, 22.4);
    assert.equal(good.rows[0].note, "Q2 release");
  }
});

test("import reports every invalid row and writes nothing conceptually", () => {
  const result = importCsv(
    "investments",
    "name,cat,funder,mda,region,flag,instr,req,sec,status\nOne,DPs,WB,MoA,Dodoma,Flagship 1,Grant,10,4,IN-PROGRESS\nTwo,DPs,WB,MoA,Mbeya,Flagship 2,Grant,nope,1,DONE\n"
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((error) => error.row === 3));
  }
});

test("list fields and investment gap are normalised", () => {
  const result = importCsv(
    "regions",
    "id,name,zone,x,y,croplandCoverPct,irrigationPct,stuntingPct,ampScore,leadCommodities,note,source\ndodoma,Dodoma,Central,52,55,34,6,30,61,Sunflower|Sorghum,Updated,ATO\n"
  );
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.rows[0].leadCommodities, ["Sunflower", "Sorghum"]);

  const investment = importCsv(
    "investments",
    "name,cat,funder,mda,region,flag,instr,req,sec,status,note,source\nScheme,DPs,WB,MoA,Morogoro,Flagship 1,Grant,100,40,IN-PROGRESS,Note,WB\n"
  );
  assert.equal(investment.ok, true);
  if (investment.ok) assert.equal(investment.rows[0].gap, 60);
});

test("schema covers every dataset and keeps identifiers internal", () => {
  const sql = schemaStatements().join("\n");
  for (const name of ["kpis", "kpi_actuals", "flagships", "flagship_progress", "commodities", "commodity_points", "regions", "institutions", "caadp_items", "alerts", "investments", "audit_log", "app_meta"]) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${name}`));
  }
  assert.equal(DATASET_IDS.length, 11);
  assert.doesNotMatch(sql, /;/);
});
