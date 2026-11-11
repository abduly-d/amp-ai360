"use client";

import { InstitutionalScorecard } from "@/components/views/institutional-scorecard";
import { PageHeader } from "@/components/page-header";
import { useDomain } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";

export default function InstitutionsPage() {
  const { snapshot } = useDomain();
  return (
    <>
      <PageHeader
        title="Institutions"
        description="Delivery and budget execution for ministries, agencies, and boards."
        updatedAt={datasetUpdatedAt(snapshot, ["institutions"])}
        updatedBy={snapshot.meta.institutions.updatedBy}
      />
      <InstitutionalScorecard />
    </>
  );
}
