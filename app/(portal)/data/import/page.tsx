"use client";

import { ImportPanel } from "@/components/import-panel";
import { PageHeader } from "@/components/page-header";

export default function ImportPage() {
  return (
    <>
      <PageHeader
        title="Imports"
        description="Download a template, fill it, and import. Invalid rows are rejected together so a bad file does not partially apply."
      />
      <ImportPanel />
    </>
  );
}
