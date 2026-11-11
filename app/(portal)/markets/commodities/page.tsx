"use client";

import { CommodityIntelligence } from "@/components/views/commodity-intelligence";
import { PageHeader } from "@/components/page-header";
import { useDomain } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";

export default function CommoditiesPage() {
  const { snapshot } = useDomain();
  return (
    <>
      <PageHeader
        title="Commodities"
        description="Priority commodities, production and farmgate series, and the market bulletin."
        updatedAt={datasetUpdatedAt(snapshot, ["commodities", "commodity_points"])}
        updatedBy={snapshot.meta.commodity_points.updatedBy}
      />
      <CommodityIntelligence />
    </>
  );
}
