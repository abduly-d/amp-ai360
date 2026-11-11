import { AMP_KPIS } from "@/lib/data/amp-targets";
import { FLAGSHIPS } from "@/lib/data/flagships";
import { COMMODITIES } from "@/lib/data/commodities";
import { REGIONS } from "@/lib/data/regions";
import { INSTITUTIONS } from "@/lib/data/institutions";
import { CAADP_MATRIX } from "@/lib/data/caadp";
import { ALERTS } from "@/lib/data/alerts";
import { INVESTMENTS } from "@/lib/data/investments";
import { DATASET_IDS, type DatasetId } from "./datasets";
import { stamp, type Row } from "./validate";

/** Fixed clock so a re-seed is identical and tests stay stable. */
export const SEED_AT = "2026-07-27T00:00:00.000Z";
const ACTOR = "seed";

export type Tables = Record<DatasetId, Row[]>;

function blank(): Tables {
  return Object.fromEntries(DATASET_IDS.map((id) => [id, []])) as unknown as Tables;
}

/**
 * Starting dataset: the public AMP 2050 figures already shipped with this
 * repo. Commodity price paths and a handful of operational fields are
 * illustrative placeholders, not confidential ATO working papers.
 */
export function buildSeed(): Tables {
  const tables = blank();

  tables.kpis = AMP_KPIS.map((kpi) =>
    stamp(
      {
        id: kpi.id,
        label: kpi.label,
        unit: kpi.unit,
        baselineYear: kpi.baselineYear,
        baseline: kpi.baseline,
        baselineLabel: kpi.baselineLabel,
        target2030: kpi.target2030,
        target2030Label: kpi.target2030Label,
        target2050: kpi.target2050,
        target2050Label: kpi.target2050Label,
        betterDirection: kpi.betterDirection,
        description: kpi.description,
        note: "",
        source: "AMP 2050",
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.kpi_actuals = AMP_KPIS.filter((kpi) => kpi.current != null).map((kpi) =>
    stamp(
      {
        id: `${kpi.id}-${kpi.actualYear}`,
        kpiId: kpi.id,
        year: kpi.actualYear,
        value: kpi.current,
        label: kpi.currentLabel ?? "",
        note: "",
        source: kpi.actualSource,
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.flagships = FLAGSHIPS.map((flagship) =>
    stamp(
      {
        id: flagship.id,
        name: flagship.name,
        targetLabel: flagship.targetLabel,
        target: flagship.target,
        unit: flagship.unit,
        lead: flagship.lead,
        budgetUsdM: flagship.budgetUsdM,
        linkedTo: flagship.linkedTo,
        summary: flagship.summary,
        note: "",
        source: "AMP 2050",
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.flagship_progress = FLAGSHIPS.map((flagship) =>
    stamp(
      {
        id: `f${flagship.id}-2026`,
        flagshipId: flagship.id,
        period: "2026",
        current: flagship.current,
        status: flagship.status,
        note: "",
        source: "AMP 2050 flagship tracker",
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.commodities = COMMODITIES.map((commodity) =>
    stamp(
      {
        id: commodity.id,
        name: commodity.name,
        emoji: commodity.emoji,
        category: commodity.category,
        postHarvestLossPct: commodity.postHarvestLossPct,
        amp2030TargetProduction: commodity.amp2030TargetProduction,
        seasonTargetProduction: commodity.seasonTargetProduction ?? null,
        seasonLabel: commodity.seasonLabel ?? "",
        keyRegions: commodity.keyRegions,
        status: commodity.status,
        note: commodity.note,
        source: "AMP 2050 priority commodity list",
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.commodity_points = COMMODITIES.flatMap((commodity) =>
    commodity.series.map((point) =>
      stamp(
        {
          id: `${commodity.id}-${point.year}`,
          commodityId: commodity.id,
          year: point.year,
          production: point.production,
          price: point.price,
          note: "Illustrative series seeded from the public showcase, not a confidential market feed.",
          source: "AMP AI360 public baseline",
        },
        ACTOR,
        SEED_AT
      )
    )
  );

  tables.regions = REGIONS.map((region) =>
    stamp(
      {
        id: region.id,
        name: region.name,
        zone: region.zone,
        x: region.x,
        y: region.y,
        croplandCoverPct: region.croplandCoverPct,
        irrigationPct: region.irrigationPct,
        stuntingPct: region.stuntingPct,
        ampScore: region.ampScore,
        leadCommodities: region.leadCommodities,
        note: "",
        source: "AMP regional baseline (illustrative readiness scores)",
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.institutions = INSTITUTIONS.map((institution) =>
    stamp(
      {
        id: institution.id,
        acronym: institution.acronym,
        name: institution.name,
        mandate: institution.mandate,
        deliveryScore: institution.deliveryScore,
        budgetExecutionPct: institution.budgetExecutionPct,
        linkedFlagships: institution.linkedFlagships,
        status: institution.status,
        note: "",
        source: "AMP institutional scorecard (illustrative)",
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.caadp = CAADP_MATRIX.map((item) =>
    stamp(
      {
        id: item.id,
        dimension: item.dimension,
        caadpCommitment: item.caadpCommitment,
        caadpValueLabel: item.caadpValueLabel,
        ampPosition: item.ampPosition,
        ampValueLabel: item.ampValueLabel,
        verdict: item.verdict,
        badge: item.badge,
        commentary: item.commentary,
        note: "",
        source: "CAADP Malabo / AMP 2050 public alignment",
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.alerts = ALERTS.map((alert) =>
    stamp(
      {
        id: alert.id,
        level: alert.level,
        title: alert.title,
        detail: alert.detail,
        category: alert.category,
        flagship: alert.flagship ?? null,
        recommendation: alert.recommendation,
        timestamp: alert.timestamp,
        note: "",
        source: "Illustrative decision-room seed",
      },
      ACTOR,
      SEED_AT
    )
  );

  tables.investments = INVESTMENTS.map((investment) =>
    stamp(
      {
        ...investment,
        note: "Illustrative public portfolio, not a confidential financing book.",
        source: "AMP 2050 financing map (public showcase)",
      },
      ACTOR,
      SEED_AT
    )
  );

  return tables;
}

export function emptyTables(): Tables {
  return blank();
}
