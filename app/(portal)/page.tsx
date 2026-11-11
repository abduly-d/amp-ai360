"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExecutiveOverview } from "@/components/views/executive-overview";
import { PageHeader } from "@/components/page-header";
import { WelcomeLanding } from "@/components/welcome-landing";
import { useDomain, useFilters } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";
import { WELCOME_SEEN_KEY, shouldShowWelcome } from "@/lib/welcome";

export default function OverviewPage() {
  const { year } = useFilters();
  const { snapshot } = useDomain();
  const router = useRouter();
  const welcome = useSearchParams().get("welcome") === "1";
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = window.sessionStorage.getItem(WELCOME_SEEN_KEY) === "1";
    if (!seen && !welcome) {
      router.replace("/?welcome=1");
      return;
    }
    setShowWelcome(shouldShowWelcome(seen, welcome));
  }, [welcome, router]);

  function enter(href: string) {
    window.sessionStorage.setItem(WELCOME_SEEN_KEY, "1");
    if (href === "/") {
      setShowWelcome(false);
      router.replace("/");
      return;
    }
    router.push(href);
  }

  function openAssistant() {
    window.sessionStorage.setItem(WELCOME_SEEN_KEY, "1");
    setShowWelcome(false);
    router.replace("/");
    window.dispatchEvent(new Event("amp-open-assistant"));
  }

  if (showWelcome === null) {
    return <p className="text-sm text-muted-foreground">Loading the workspace…</p>;
  }

  if (showWelcome) {
    return <WelcomeLanding onEnter={enter} onOpenAssistant={openAssistant} />;
  }

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
