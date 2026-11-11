"use client";

import { RegionalIntelligence } from "@/components/views/regional-intelligence";
import { PageHeader } from "@/components/page-header";
import { useDomain } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";

export default function RegionsPage() {
  const { snapshot } = useDomain();
  return (
    <>
      <PageHeader
        title="Regions"
        description="Corridor map and readiness. Choose a region in the filter bar to open its metrics."
        updatedAt={datasetUpdatedAt(snapshot, ["regions"])}
        updatedBy={snapshot.meta.regions.updatedBy}
      />
      <RegionalIntelligence />
    </>
  );
}
