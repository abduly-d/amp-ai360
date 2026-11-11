"use client";

import { InvestmentTracking } from "@/components/views/investment-tracking";
import { PageHeader } from "@/components/page-header";
import { useDomain } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";

export default function InvestmentsPage() {
  const { snapshot } = useDomain();
  return (
    <>
      <PageHeader
        title="Investments and partners"
        description="Required, secured, and gap amounts by partner. The gap is required minus secured when you leave it blank."
        updatedAt={datasetUpdatedAt(snapshot, ["investments"])}
        updatedBy={snapshot.meta.investments.updatedBy}
      />
      <InvestmentTracking />
    </>
  );
}
