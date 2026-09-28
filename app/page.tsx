"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Wheat,
  Map,
  Flag,
  LineChart,
  Globe2,
  Brain,
  Building2,
  Wallet,
  Siren,
} from "lucide-react";
import { Header } from "@/components/header";
import { Landing } from "@/components/landing";
import { SourceStrip } from "@/components/source-strip";
import { AiCopilotDrawer } from "@/components/ai-copilot-drawer";
import { ExecutiveOverview } from "@/components/views/executive-overview";
import { CommodityIntelligence } from "@/components/views/commodity-intelligence";
import { RegionalIntelligence } from "@/components/views/regional-intelligence";
import { FlagshipTracker } from "@/components/views/flagship-tracker";
import { VisionScenarios } from "@/components/views/vision-scenarios";
import { CaadpAlignment } from "@/components/views/caadp-alignment";
import { ForecastEngine } from "@/components/views/forecast-engine";
import { InstitutionalScorecard } from "@/components/views/institutional-scorecard";
import { InvestmentTracking } from "@/components/views/investment-tracking";
import { DecisionRoom } from "@/components/views/decision-room";

const TABS = [
  { id: "overview", label: "Executive Overview", icon: LayoutDashboard, view: ExecutiveOverview, desc: "KPIs vs 2030 & 2050 targets" },
  { id: "commodity", label: "Commodity Intelligence", icon: Wheat, view: CommodityIntelligence, desc: "Prices, production & TMX board" },
  { id: "regional", label: "Regional Intelligence", icon: Map, view: RegionalIntelligence, desc: "Tanzania map & AGCOT corridors" },
  { id: "flagships", label: "15 Flagship Tracker", icon: Flag, view: FlagshipTracker, desc: "15 AMP flagship programmes" },
  { id: "scenarios", label: "DIRA 2050", icon: LineChart, view: VisionScenarios, desc: "DIRA 2050 BAU vs Full AMP" },
  { id: "caadp", label: "CAADP Alignment", icon: Globe2, view: CaadpAlignment, desc: "CAADP / Malabo alignment" },
  { id: "forecast", label: "Ai Forecast Engine", icon: Brain, view: ForecastEngine, desc: "Ai commodity forecasts" },
  { id: "institutions", label: "Institutional Scorecard", icon: Building2, view: InstitutionalScorecard, desc: "Ministry & agency scorecards" },
  { id: "investment", label: "Investment Tracking", icon: Wallet, view: InvestmentTracking, desc: "Financing & partnership mapping" },
  { id: "decision", label: "Decision Room", icon: Siren, view: DecisionRoom, desc: "Minister's daily decision room" },
] as const;

export default function Home() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"] | "home">("home");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [assistantOpen, setAssistantOpen] = useState(false);
  const year = Number(date.slice(0, 4)) || new Date().getFullYear();

  const isHome = active === "home";
  const ActiveView = TABS.find((t) => t.id === active)?.view ?? ExecutiveOverview;

  return (
    <div className="min-h-screen">
      <Header
        date={date}
        onDateChange={setDate}
        onOpenAssistant={() => setAssistantOpen(true)}
        onHome={() => setActive("home")}
      />

      {/* Tab navigation */}
      <nav
        className={`sticky top-[65px] z-20 border-b bg-background/95 backdrop-blur lg:top-[57px] ${isHome ? "hidden" : ""}`}
      >
        <div className="mx-auto max-w-[1400px] px-2">
          <div className="thin-scroll flex gap-1 overflow-x-auto py-2">
            {TABS.map((t, i) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded text-xs opacity-70">
                    {i + 1}
                  </span>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        {isHome ? (
          <Landing
            items={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon, desc: t.desc }))}
            onSelect={(id) => setActive(id as (typeof TABS)[number]["id"])}
          />
        ) : (
          <>
            <SourceStrip tab={active} />
            {active === "overview" ? <ExecutiveOverview year={year} /> : <ActiveView />}
          </>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <b>AMP Ai360</b> powered by the Ministry of Agriculture and the Ministry of Livestock &amp;
        Fisheries · Data: World Bank open data, MoA Weekly Bulletin, Bank of Tanzania MER, AMP 2050
        Financing Mapping · AI via the Tanzania AMP2050 GPT
      </footer>

      {/* Floating AMP Assistant button (always available) */}
      <button
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Ask the AMP assistant"
        title="Ask the AMP assistant"
      >
        <Brain className="h-6 w-6" />
      </button>

      <AiCopilotDrawer open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
