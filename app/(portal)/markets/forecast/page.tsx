"use client";

import { ForecastEngine } from "@/components/views/forecast-engine";
import { PageHeader } from "@/components/page-header";

export default function ForecastPage() {
  return (
    <>
      <PageHeader title="Forecast" description="Illustrative price, weather, and trade signals. These reference views are not edited in the working dataset." />
      <ForecastEngine />
    </>
  );
}
