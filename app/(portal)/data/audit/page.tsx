"use client";

import { AuditTable } from "@/components/audit-table";
import { PageHeader } from "@/components/page-header";

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit log" description="Every create, edit, delete, and import is stored with the editor name and the before/after values." />
      <AuditTable />
    </>
  );
}
