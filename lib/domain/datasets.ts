// Column contracts for every editable dataset. Forms, CSV import/export,
// validation, and SQL all read this list so they cannot drift apart.

export const DATASET_IDS = [
  "kpis",
  "kpi_actuals",
  "flagships",
  "flagship_progress",
  "commodities",
  "commodity_points",
  "regions",
  "institutions",
  "caadp",
  "alerts",
  "investments",
] as const;

export type DatasetId = (typeof DATASET_IDS)[number];

export type FieldKind = "text" | "number" | "int" | "enum" | "textlist" | "intlist";

export interface FieldSpec {
  key: string;
  column: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  enums?: readonly string[];
  help?: string;
}

export interface DatasetSpec {
  id: DatasetId;
  table: string;
  label: string;
  singular: string;
  /** Camel-case primary key. Also one of `fields`. */
  pk: string;
  /** Stable natural key used to upsert period/series rows. */
  natural?: string[];
  orderSql: string;
  description: string;
  fields: FieldSpec[];
}

const STATUS = ["on-track", "at-risk", "critical"] as const;
const COMMODITY_CATEGORY = [
  "Cereals",
  "Cash Crops",
  "Horticulture",
  "Roots & Tubers",
  "Oilseeds",
  "Pulses",
  "Livestock",
  "Fisheries",
] as const;

function field(
  key: string,
  column: string,
  label: string,
  kind: FieldKind,
  extra: Partial<FieldSpec> = {}
): FieldSpec {
  return { key, column, label, kind, required: extra.required ?? true, ...extra };
}

const note = field("note", "note", "Note", "text", {
  required: false,
  help: "Short context for the change",
});
const source = field("source", "source", "Source", "text", {
  required: false,
  help: "Where the figure came from",
});

export const DATASETS: Record<DatasetId, DatasetSpec> = {
  kpis: {
    id: "kpis",
    table: "kpis",
    label: "AMP indicators",
    singular: "indicator",
    pk: "id",
    orderSql: "label",
    description: "AMP macro targets with baseline, 2030 and 2050 milestones.",
    fields: [
      field("id", "id", "ID", "text", { help: "Stable slug, e.g. ag-gdp" }),
      field("label", "label", "Label", "text"),
      field("unit", "unit", "Unit", "text"),
      field("baselineYear", "baseline_year", "Baseline year", "int"),
      field("baseline", "baseline", "Baseline", "number"),
      field("baselineLabel", "baseline_label", "Baseline label", "text"),
      field("target2030", "target_2030", "2030 target", "number"),
      field("target2030Label", "target_2030_label", "2030 label", "text"),
      field("target2050", "target_2050", "2050 target", "number"),
      field("target2050Label", "target_2050_label", "2050 label", "text"),
      field("betterDirection", "better_direction", "Better direction", "enum", {
        enums: ["up", "down"],
      }),
      field("description", "description", "Description", "text"),
      note,
      source,
    ],
  },
  kpi_actuals: {
    id: "kpi_actuals",
    table: "kpi_actuals",
    label: "Indicator actuals",
    singular: "actual",
    pk: "id",
    natural: ["kpiId", "year"],
    orderSql: "kpi_id, year",
    description: "Reported actuals for an indicator, one row per year.",
    fields: [
      field("id", "id", "ID", "text", { required: false, help: "Leave blank to generate" }),
      field("kpiId", "kpi_id", "Indicator ID", "text"),
      field("year", "year", "Year", "int"),
      field("value", "value", "Value", "number"),
      field("label", "label", "Display label", "text", { required: false }),
      note,
      source,
    ],
  },
  flagships: {
    id: "flagships",
    table: "flagships",
    label: "Flagships",
    singular: "flagship",
    pk: "id",
    orderSql: "id::int",
    description: "The 15 AMP flagship programmes.",
    fields: [
      field("id", "id", "Number", "int", { help: "1–15" }),
      field("name", "name", "Name", "text"),
      field("targetLabel", "target_label", "Target label", "text"),
      field("target", "target", "Target", "number"),
      field("unit", "unit", "Unit", "text"),
      field("lead", "lead", "Lead institution", "text"),
      field("budgetUsdM", "budget_usd_m", "Budget (USD m)", "number"),
      field("linkedTo", "linked_to", "Linked flagships", "intlist", {
        required: false,
        help: "Comma-separated flagship numbers",
      }),
      field("summary", "summary", "Summary", "text"),
      note,
      source,
    ],
  },
  flagship_progress: {
    id: "flagship_progress",
    table: "flagship_progress",
    label: "Flagship progress",
    singular: "progress entry",
    pk: "id",
    natural: ["flagshipId", "period"],
    orderSql: "flagship_id, period",
    description: "Progress and status for a flagship in a reporting period.",
    fields: [
      field("id", "id", "ID", "text", { required: false }),
      field("flagshipId", "flagship_id", "Flagship", "int"),
      field("period", "period", "Period", "text", { help: "e.g. 2026 or 2026-Q3" }),
      field("current", "current", "Current", "number"),
      field("status", "status", "Status", "enum", { enums: STATUS }),
      note,
      source,
    ],
  },
  commodities: {
    id: "commodities",
    table: "commodities",
    label: "Commodities",
    singular: "commodity",
    pk: "id",
    orderSql: "name",
    description: "Priority commodities and their AMP production targets.",
    fields: [
      field("id", "id", "ID", "text"),
      field("name", "name", "Name", "text"),
      field("emoji", "emoji", "Emoji", "text", { required: false }),
      field("category", "category", "Category", "enum", { enums: COMMODITY_CATEGORY }),
      field("postHarvestLossPct", "post_harvest_loss_pct", "Post-harvest loss %", "number"),
      field("amp2030TargetProduction", "amp_2030_target", "2030 production target", "number"),
      field("seasonTargetProduction", "season_target", "Season target", "number", { required: false }),
      field("seasonLabel", "season_label", "Season label", "text", { required: false }),
      field("keyRegions", "key_regions", "Key regions", "textlist", { required: false }),
      field("status", "status", "Status", "enum", { enums: ["growing", "stable", "declining"] }),
      note,
      source,
    ],
  },
  commodity_points: {
    id: "commodity_points",
    table: "commodity_points",
    label: "Commodity series",
    singular: "series point",
    pk: "id",
    natural: ["commodityId", "year"],
    orderSql: "commodity_id, year",
    description: "Production and farmgate price for one commodity-year.",
    fields: [
      field("id", "id", "ID", "text", { required: false }),
      field("commodityId", "commodity_id", "Commodity ID", "text"),
      field("year", "year", "Year", "int"),
      field("production", "production", "Production", "number"),
      field("price", "price", "Price (TZS/kg)", "number"),
      note,
      source,
    ],
  },
  regions: {
    id: "regions",
    table: "regions",
    label: "Regions",
    singular: "region",
    pk: "id",
    orderSql: "name",
    description: "Mainland region metrics used by the map and scorecards.",
    fields: [
      field("id", "id", "ID", "text"),
      field("name", "name", "Name", "text"),
      field("zone", "zone", "Zone", "text"),
      field("x", "x", "Map X", "number"),
      field("y", "y", "Map Y", "number"),
      field("croplandCoverPct", "cropland_cover_pct", "Cropland %", "number"),
      field("irrigationPct", "irrigation_pct", "Irrigation %", "number"),
      field("stuntingPct", "stunting_pct", "Stunting %", "number"),
      field("ampScore", "amp_score", "AMP score", "number"),
      field("leadCommodities", "lead_commodities", "Lead commodities", "textlist", { required: false }),
      note,
      source,
    ],
  },
  institutions: {
    id: "institutions",
    table: "institutions",
    label: "Institutions",
    singular: "institution",
    pk: "id",
    orderSql: "acronym",
    description: "Delivery and budget-execution scorecard.",
    fields: [
      field("id", "id", "ID", "text"),
      field("acronym", "acronym", "Acronym", "text"),
      field("name", "name", "Name", "text"),
      field("mandate", "mandate", "Mandate", "text"),
      field("deliveryScore", "delivery_score", "Delivery score", "number"),
      field("budgetExecutionPct", "budget_execution_pct", "Budget execution %", "number"),
      field("linkedFlagships", "linked_flagships", "Linked flagships", "intlist", { required: false }),
      field("status", "status", "Status", "enum", { enums: STATUS }),
      note,
      source,
    ],
  },
  caadp: {
    id: "caadp",
    table: "caadp_items",
    label: "CAADP alignment",
    singular: "alignment item",
    pk: "id",
    orderSql: "dimension",
    description: "AMP position against CAADP / Malabo commitments.",
    fields: [
      field("id", "id", "ID", "text"),
      field("dimension", "dimension", "Dimension", "text"),
      field("caadpCommitment", "caadp_commitment", "CAADP commitment", "text"),
      field("caadpValueLabel", "caadp_value_label", "CAADP value", "text"),
      field("ampPosition", "amp_position", "AMP position", "text"),
      field("ampValueLabel", "amp_value_label", "AMP value", "text"),
      field("verdict", "verdict", "Verdict", "enum", {
        enums: ["exceeds", "aligned", "gap", "critical-gap"],
      }),
      field("badge", "badge", "Badge", "text"),
      field("commentary", "commentary", "Commentary", "text"),
      note,
      source,
    ],
  },
  alerts: {
    id: "alerts",
    table: "alerts",
    label: "Decision room",
    singular: "alert",
    pk: "id",
    orderSql: "alert_at DESC",
    description: "Decision-room alerts for the ministerial briefing.",
    fields: [
      field("id", "id", "ID", "text", { required: false }),
      field("level", "level", "Level", "enum", { enums: ["red", "amber", "green"] }),
      field("title", "title", "Title", "text"),
      field("detail", "detail", "Detail", "text"),
      field("category", "category", "Category", "text"),
      field("flagship", "flagship", "Flagship", "int", { required: false }),
      field("recommendation", "recommendation", "Recommendation", "text"),
      field("timestamp", "alert_at", "Timestamp", "text", { help: "ISO date-time" }),
      note,
      source,
    ],
  },
  investments: {
    id: "investments",
    table: "investments",
    label: "Investments & partners",
    singular: "investment",
    pk: "id",
    orderSql: "id",
    description: "Financing and partnership records. Gap is required minus secured.",
    fields: [
      field("id", "id", "ID", "text", { required: false }),
      field("name", "name", "Name", "text"),
      field("cat", "cat", "Category", "text", { help: "DPs, Private, Public, or Non-Government" }),
      field("funder", "funder", "Funder / partner", "text"),
      field("mda", "mda", "MDA", "text"),
      field("region", "region", "Region", "text"),
      field("flag", "flag", "Flagship", "text"),
      field("instr", "instr", "Instrument", "text"),
      field("req", "req", "Required (USD)", "number"),
      field("sec", "sec", "Secured (USD)", "number"),
      field("gap", "gap", "Gap (USD)", "number", { required: false, help: "Filled as required − secured when omitted" }),
      field("status", "status", "Status", "enum", {
        enums: ["PLANNED", "IN-PROGRESS", "COMPLETED", "ON-HOLD", "TERMINATED"],
      }),
      note,
      source,
    ],
  },
};

export function datasetSpec(id: string): DatasetSpec | null {
  if ((DATASET_IDS as readonly string[]).includes(id)) return DATASETS[id as DatasetId];
  return null;
}

export function isDatasetId(id: string): id is DatasetId {
  return (DATASET_IDS as readonly string[]).includes(id);
}
