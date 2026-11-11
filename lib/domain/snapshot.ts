import type { KpiTarget } from "@/lib/data/amp-targets";
import type { Flagship, FlagshipStatus } from "@/lib/data/flagships";
import type { Commodity, CommodityPoint } from "@/lib/data/commodities";
import type { Region } from "@/lib/data/regions";
import type { Institution } from "@/lib/data/institutions";
import type { CaadpMetric } from "@/lib/data/caadp";
import type { Alert } from "@/lib/data/alerts";
import type { Investment } from "@/lib/data/investments";
import { DATASET_IDS, type DatasetId } from "./datasets";
import type { Tables } from "./seed";
import type { Row } from "./validate";

export interface DatasetMeta {
  count: number;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface DomainSnapshot {
  mode: "postgres" | "memory";
  dbOk: boolean;
  warning: string | null;
  generatedAt: string;
  kpis: Array<KpiTarget & { actuals: Row[]; note: string; updatedAt?: string; updatedBy?: string }>;
  flagships: Array<Flagship & { note: string; source: string; updatedAt?: string; updatedBy?: string; progress: Row[] }>;
  commodities: Array<Commodity & { updatedAt?: string; updatedBy?: string; source?: string }>;
  regions: Array<Region & { note: string; source: string; updatedAt?: string; updatedBy?: string }>;
  institutions: Array<Institution & { note: string; source: string; updatedAt?: string; updatedBy?: string }>;
  caadp: Array<CaadpMetric & { note: string; source: string; updatedAt?: string; updatedBy?: string }>;
  alerts: Array<Alert & { note: string; source: string; updatedAt?: string; updatedBy?: string }>;
  investments: Array<Investment & { note: string; source: string; updatedAt?: string; updatedBy?: string }>;
  tables: Tables;
  meta: Record<DatasetId, DatasetMeta>;
}

function text(row: Row, key: string, fallback = ""): string {
  const value = row[key];
  return value == null ? fallback : String(value);
}

function num(row: Row, key: string, fallback = 0): number {
  const value = row[key];
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function optionalNum(row: Row, key: string): number | null {
  const value = row[key];
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function list(row: Row, key: string): string[] {
  const value = row[key];
  return Array.isArray(value) ? value.map(String) : [];
}

function ints(row: Row, key: string): number[] {
  const value = row[key];
  return Array.isArray(value) ? value.map((item) => Number(item)).filter((n) => Number.isFinite(n)) : [];
}

function metaFor(rows: Row[]): DatasetMeta {
  const sorted = [...rows].sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
  const top = sorted[0];
  return {
    count: rows.length,
    updatedAt: top?.updatedAt ? String(top.updatedAt) : null,
    updatedBy: top?.updatedBy ? String(top.updatedBy) : null,
  };
}

export function buildSnapshot(
  tables: Tables,
  info: { mode: "postgres" | "memory"; dbOk: boolean; warning?: string | null; generatedAt?: string }
): DomainSnapshot {
  const kpis = tables.kpis.map((row) => {
    const actuals = tables.kpi_actuals
      .filter((actual) => actual.kpiId === row.id)
      .sort((a, b) => num(a, "year") - num(b, "year"));
    const current = actuals[actuals.length - 1];
    const kpi: DomainSnapshot["kpis"][number] = {
      id: text(row, "id"),
      label: text(row, "label"),
      unit: text(row, "unit"),
      baselineYear: num(row, "baselineYear"),
      baseline: num(row, "baseline"),
      baselineLabel: text(row, "baselineLabel"),
      target2030: num(row, "target2030"),
      target2030Label: text(row, "target2030Label"),
      target2050: num(row, "target2050"),
      target2050Label: text(row, "target2050Label"),
      betterDirection: text(row, "betterDirection") === "down" ? "down" : "up",
      description: text(row, "description"),
      actualSource: current ? text(current, "source", "Team entry") : text(row, "source", "—"),
      actualYear: current ? num(current, "year") : num(row, "baselineYear"),
      note: text(row, "note"),
      updatedAt: text(current?.updatedAt ?? row.updatedAt),
      updatedBy: text(current?.updatedBy ?? row.updatedBy),
      actuals,
    };
    if (current) {
      kpi.current = num(current, "value");
      kpi.currentLabel = text(current, "label") || String(num(current, "value"));
    }
    return kpi;
  });

  const flagships = tables.flagships
    .map((row) => {
      const progress = tables.flagship_progress
        .filter((entry) => String(entry.flagshipId) === String(row.id))
        .sort((a, b) => text(a, "period").localeCompare(text(b, "period")));
      const current = progress[progress.length - 1];
      const status = (text(current ?? {}, "status") || "at-risk") as FlagshipStatus;
      return {
        id: num(row, "id"),
        name: text(row, "name"),
        targetLabel: text(row, "targetLabel"),
        target: num(row, "target"),
        current: current ? num(current, "current") : 0,
        unit: text(row, "unit"),
        status: status === "on-track" || status === "critical" ? status : "at-risk",
        lead: text(row, "lead"),
        budgetUsdM: num(row, "budgetUsdM"),
        linkedTo: ints(row, "linkedTo"),
        summary: text(row, "summary"),
        note: text(current?.note ?? row.note),
        source: text(current?.source ?? row.source),
        updatedAt: text(current?.updatedAt ?? row.updatedAt),
        updatedBy: text(current?.updatedBy ?? row.updatedBy),
        progress,
      };
    })
    .sort((a, b) => a.id - b.id);

  const commodities = tables.commodities.map((row) => {
    const series: CommodityPoint[] = tables.commodity_points
      .filter((point) => point.commodityId === row.id)
      .sort((a, b) => num(a, "year") - num(b, "year"))
      .map((point) => ({
        year: num(point, "year"),
        production: num(point, "production"),
        price: num(point, "price"),
      }));
    const season = optionalNum(row, "seasonTargetProduction");
    return {
      id: text(row, "id"),
      name: text(row, "name"),
      emoji: text(row, "emoji"),
      category: text(row, "category") as Commodity["category"],
      postHarvestLossPct: num(row, "postHarvestLossPct"),
      amp2030TargetProduction: num(row, "amp2030TargetProduction"),
      seasonTargetProduction: season ?? undefined,
      seasonLabel: text(row, "seasonLabel") || undefined,
      keyRegions: list(row, "keyRegions"),
      status: (text(row, "status") || "stable") as Commodity["status"],
      note: text(row, "note"),
      series,
      source: text(row, "source"),
      updatedAt: text(row, "updatedAt"),
      updatedBy: text(row, "updatedBy"),
    };
  });

  const regions = tables.regions.map((row) => ({
    id: text(row, "id"),
    name: text(row, "name"),
    zone: text(row, "zone"),
    x: num(row, "x"),
    y: num(row, "y"),
    croplandCoverPct: num(row, "croplandCoverPct"),
    irrigationPct: num(row, "irrigationPct"),
    stuntingPct: num(row, "stuntingPct"),
    ampScore: num(row, "ampScore"),
    leadCommodities: list(row, "leadCommodities"),
    note: text(row, "note"),
    source: text(row, "source"),
    updatedAt: text(row, "updatedAt"),
    updatedBy: text(row, "updatedBy"),
  }));

  const institutions = tables.institutions.map((row) => ({
    id: text(row, "id"),
    acronym: text(row, "acronym"),
    name: text(row, "name"),
    mandate: text(row, "mandate"),
    deliveryScore: num(row, "deliveryScore"),
    budgetExecutionPct: num(row, "budgetExecutionPct"),
    linkedFlagships: ints(row, "linkedFlagships"),
    status: (text(row, "status") || "at-risk") as Institution["status"],
    note: text(row, "note"),
    source: text(row, "source"),
    updatedAt: text(row, "updatedAt"),
    updatedBy: text(row, "updatedBy"),
  }));

  const caadp = tables.caadp.map((row) => ({
    id: text(row, "id"),
    dimension: text(row, "dimension"),
    caadpCommitment: text(row, "caadpCommitment"),
    caadpValueLabel: text(row, "caadpValueLabel"),
    ampPosition: text(row, "ampPosition"),
    ampValueLabel: text(row, "ampValueLabel"),
    verdict: text(row, "verdict") as CaadpMetric["verdict"],
    badge: text(row, "badge"),
    commentary: text(row, "commentary"),
    note: text(row, "note"),
    source: text(row, "source"),
    updatedAt: text(row, "updatedAt"),
    updatedBy: text(row, "updatedBy"),
  }));

  const alerts = tables.alerts
    .map((row) => {
      const flagship = optionalNum(row, "flagship");
      return {
        id: text(row, "id"),
        level: text(row, "level") as Alert["level"],
        title: text(row, "title"),
        detail: text(row, "detail"),
        category: text(row, "category"),
        flagship: flagship ?? undefined,
        recommendation: text(row, "recommendation"),
        timestamp: text(row, "timestamp"),
        note: text(row, "note"),
        source: text(row, "source"),
        updatedAt: text(row, "updatedAt"),
        updatedBy: text(row, "updatedBy"),
      };
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const investments = tables.investments.map((row) => ({
    id: text(row, "id"),
    name: text(row, "name"),
    cat: text(row, "cat"),
    funder: text(row, "funder"),
    mda: text(row, "mda"),
    region: text(row, "region"),
    flag: text(row, "flag"),
    instr: text(row, "instr"),
    req: num(row, "req"),
    sec: num(row, "sec"),
    gap: num(row, "gap", num(row, "req") - num(row, "sec")),
    status: text(row, "status"),
    note: text(row, "note"),
    source: text(row, "source"),
    updatedAt: text(row, "updatedAt"),
    updatedBy: text(row, "updatedBy"),
  }));

  const meta = Object.fromEntries(DATASET_IDS.map((id) => [id, metaFor(tables[id])])) as Record<DatasetId, DatasetMeta>;

  return {
    mode: info.mode,
    dbOk: info.dbOk,
    warning: info.warning ?? null,
    generatedAt: info.generatedAt ?? new Date().toISOString(),
    kpis,
    flagships,
    commodities,
    regions,
    institutions,
    caadp,
    alerts,
    investments,
    tables,
    meta,
  };
}

export function datasetUpdatedAt(snapshot: DomainSnapshot, ids: DatasetId[]): string | null {
  const stamps = ids.map((id) => snapshot.meta[id]?.updatedAt).filter((value): value is string => Boolean(value));
  return stamps.sort().at(-1) ?? null;
}

export function investmentRollup(rows: DomainSnapshot["investments"]) {
  const req = rows.reduce((sum, row) => sum + row.req, 0);
  const sec = rows.reduce((sum, row) => sum + row.sec, 0);
  const gap = rows.reduce((sum, row) => sum + row.gap, 0);
  const colors: Record<string, string> = {
    DPs: "#0F7DB8",
    "Non-Government": "#7C3AED",
    Private: "#E6A700",
    Public: "#14913F",
  };
  const labels: Record<string, string> = {
    DPs: "Development Partners",
    "Non-Government": "Non-Government",
    Private: "Private Investment",
    Public: "Public Investment",
  };
  const cats = Array.from(new Set(rows.map((row) => row.cat))).map((cat) => {
    const group = rows.filter((row) => row.cat === cat);
    return {
      cat,
      label: labels[cat] ?? cat,
      req: group.reduce((sum, row) => sum + row.req, 0),
      sec: group.reduce((sum, row) => sum + row.sec, 0),
      gap: group.reduce((sum, row) => sum + row.gap, 0),
      n: group.length,
      color: colors[cat] ?? "#64748B",
    };
  });
  const flags = new Map<string, { f: string; name: string; req: number; sec: number; gap: number }>();
  for (const row of rows) {
    const key = row.flag || "Unassigned";
    const current = flags.get(key) ?? { f: key, name: key, req: 0, sec: 0, gap: 0 };
    current.req += row.req / 1e6;
    current.sec += row.sec / 1e6;
    current.gap += row.gap / 1e6;
    flags.set(key, current);
  }
  return {
    totals: {
      req,
      sec,
      gap,
      n: rows.length,
      inprog: rows.filter((row) => row.status === "IN-PROGRESS").length,
      planned: rows.filter((row) => row.status === "PLANNED").length,
      completed: rows.filter((row) => row.status === "COMPLETED").length,
    },
    cats,
    byFlag: Array.from(flags.values()).sort((a, b) => b.req - a.req),
  };
}

export function liveFacts(snapshot: DomainSnapshot): string {
  const kpiLines = snapshot.kpis
    .map((kpi) => `${kpi.label}: current ${kpi.currentLabel ?? "n/a"} (${kpi.actualYear}), 2030 ${kpi.target2030Label}, 2050 ${kpi.target2050Label}`)
    .join("\n");
  const flagshipLines = snapshot.flagships
    .map((flagship) => `Flagship ${flagship.id} ${flagship.name}: ${flagship.current}/${flagship.target} ${flagship.unit} (${flagship.status})`)
    .join("\n");
  const alertLines = snapshot.alerts
    .slice(0, 8)
    .map((alert) => `[${alert.level}] ${alert.title} — ${alert.detail}`)
    .join("\n");
  const commodityLines = snapshot.commodities
    .map((commodity) => {
      const last = commodity.series[commodity.series.length - 1];
      return `${commodity.name} (${commodity.status})${last ? `: ${last.production} in ${last.year}` : ""}`;
    })
    .join("\n");
  return [
    "Live working dataset (team-maintained; may differ from the original document):",
    kpiLines || "No indicators recorded.",
    flagshipLines || "No flagships recorded.",
    commodityLines || "No commodities recorded.",
    alertLines || "No decision-room alerts.",
    `Regions: ${snapshot.regions.length}. Institutions: ${snapshot.institutions.length}. Investments: ${snapshot.investments.length}. CAADP items: ${snapshot.caadp.length}.`,
  ].join("\n\n");
}
