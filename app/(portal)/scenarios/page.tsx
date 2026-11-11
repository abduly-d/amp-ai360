"use client";

import { VisionScenarios } from "@/components/views/vision-scenarios";
import { PageHeader } from "@/components/page-header";

export default function ScenariosPage() {
  return (
    <>
      <PageHeader title="DIRA 2050" description="Business-as-usual against the full AMP path. Scenario curves stay with the published plan." />
      <VisionScenarios />
    </>
  );
}
