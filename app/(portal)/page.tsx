"use client";

import { ExecutiveOverview } from "@/components/views/executive-overview";
import { PageHeader } from "@/components/page-header";
import { useDomain, useFilters } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";

export default function OverviewPage() {
  const { year } = useFilters();
  const { snapshot } = useDomain();
  return (
    <>
      <PageHeader
        title="Executive overview"
        description="AMP 2050 headlines against the latest reported actuals, open data, and the Bank of Tanzania review."
        updatedAt={datasetUpdatedAt(snapshot, ["kpis", "kpi_actuals"])}
        updatedBy={snapshot.meta.kpi_actuals.updatedBy}
      />
      <ExecutiveOverview year={year} />
    </>
  );
}
