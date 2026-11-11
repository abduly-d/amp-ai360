"use client";

import { DecisionRoom } from "@/components/views/decision-room";
import { PageHeader } from "@/components/page-header";
import { QuickEntry } from "@/components/quick-entry";
import { useDomain } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";

export default function DecisionPage() {
  const { snapshot } = useDomain();
  return (
    <>
      <PageHeader
        title="Decision room"
        description="Red, amber, and green items for the briefing. Each item can carry a note and a source."
        updatedAt={datasetUpdatedAt(snapshot, ["alerts"])}
        updatedBy={snapshot.meta.alerts.updatedBy}
      />
      <div className="mb-4">
        <QuickEntry dataset="alerts" title="Add an alert" help="record a decision-room item" preset={{ timestamp: new Date().toISOString().slice(0, 16) }} />
      </div>
      <DecisionRoom />
    </>
  );
}
