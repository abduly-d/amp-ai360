"use client";

import { CaadpAlignment } from "@/components/views/caadp-alignment";
import { PageHeader } from "@/components/page-header";
import { useDomain } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";

export default function CaadpPage() {
  const { snapshot } = useDomain();
  return (
    <>
      <PageHeader
        title="CAADP alignment"
        description="How the AMP position sits against Maputo and Malabo commitments."
        updatedAt={datasetUpdatedAt(snapshot, ["caadp"])}
        updatedBy={snapshot.meta.caadp.updatedBy}
      />
      <CaadpAlignment />
    </>
  );
}
