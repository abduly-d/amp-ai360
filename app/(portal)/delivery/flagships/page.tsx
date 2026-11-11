"use client";

import { FlagshipTracker } from "@/components/views/flagship-tracker";
import { PageHeader } from "@/components/page-header";
import { QuickEntry } from "@/components/quick-entry";
import { useDomain, useFilters } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";

export default function FlagshipsPage() {
  const { snapshot } = useDomain();
  const { flagship } = useFilters();
  return (
    <>
      <PageHeader
        title="Flagships"
        description="Delivery status comes from the latest progress entry for each programme."
        updatedAt={datasetUpdatedAt(snapshot, ["flagships", "flagship_progress"])}
        updatedBy={snapshot.meta.flagship_progress.updatedBy}
      />
      <div className="mb-4">
        <QuickEntry
          dataset="flagship_progress"
          title="Record progress"
          help="enter a period actual, status, note, and source"
          preset={flagship ? { flagshipId: flagship, period: String(new Date().getFullYear()) } : { period: String(new Date().getFullYear()) }}
        />
      </div>
      <FlagshipTracker />
    </>
  );
}
