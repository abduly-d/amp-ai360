"use client";

import { Suspense } from "react";
import { DataManager } from "@/components/data-manager";
import { PageHeader } from "@/components/page-header";
import { useDomain } from "@/components/app-state";

export default function DataPage() {
  const { snapshot } = useDomain();
  const latest = Object.values(snapshot.meta)
    .map((item) => item.updatedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  return (
    <>
      <PageHeader
        title="Manage data"
        description="Create, edit, and delete the working records. Exports and templates are available for every dataset."
        updatedAt={latest}
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading records…</p>}>
        <DataManager />
      </Suspense>
    </>
  );
}
