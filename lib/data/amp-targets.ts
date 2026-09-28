// AMP 2050 Ground-Truth Executive KPIs
// Source: Tanzania Agriculture Master Plan (AMP 2050) baseline vectors.

export type TrendDirection = "up" | "down";

export interface KpiTarget {
  id: string;
  label: string;
  unit: string;
  baselineYear: number;
  baseline: number;
  baselineLabel: string;
  target2030: number;
  target2030Label: string;
  target2050: number;
  target2050Label: string;
  current?: number;
  currentLabel?: string;
  // "up" means higher is better; "down" means lower is better
  betterDirection: TrendDirection;
  description: string;
  // Provenance for the "current" actual value.
  actualSource: string;
  actualYear: number;
}

export const AMP_KPIS: KpiTarget[] = [
  {
    id: "ag-gdp",
    label: "Agricultural GDP",
    unit: "USD",
    baselineYear: 2022,
    baseline: 18,
    baselineLabel: "$18B",
    target2030: 31.2,
    target2030Label: "$31.2B",
    target2050: 100,
    target2050Label: "$100B (~TZS 280T)",
    current: 20.65,
    currentLabel: "$20.7B",
    betterDirection: "up",
    actualSource: "World Bank (NV.AGR.TOTL.CD)",
    actualYear: 2025,
    description:
      "Total agricultural gross domestic product. AMP targets a 5.5x expansion by 2050 to reach USD 100 billion (~TZS 280 trillion).",
  },
  {
    id: "ag-growth",
    label: "Annual Ag Growth Rate",
    unit: "%",
    baselineYear: 2022,
    baseline: 4.8,
    baselineLabel: "4.8%",
    target2030: 10,
    target2030Label: "10%",
    target2050: 10,
    target2050Label: "10% sustained",
    current: 3.6,
    currentLabel: "3.6%",
    betterDirection: "up",
    actualSource: "World Bank (NV.AGR.TOTL.KD.ZG)",
    actualYear: 2025,
    description:
      "Annual sector growth rate. Latest actual (3.6%) sits below both the 10% AMP goal and the CAADP Malabo ≥6% floor — the central execution gap.",
  },
  {
    id: "net-exports",
    label: "Net Agricultural Exports",
    unit: "USD",
    baselineYear: 2022,
    baseline: 1.2,
    baselineLabel: "$1.2B",
    target2030: 6.0,
    target2030Label: "$6.0B",
    target2050: 20,
    target2050Label: "$20B (~TZS 55T)",
    current: 1.6,
    currentLabel: "$1.6B",
    betterDirection: "up",
    actualSource: "AMP 2050 estimate",
    actualYear: 2022,
    description:
      "Net agricultural exports. A 5x jump to USD 6B by 2030 and 16x to USD 20B by 2050 anchors the agro-industrialization agenda.",
  },
  {
    id: "farm-income",
    label: "Per Capita Farm Household Income",
    unit: "USD",
    baselineYear: 2022,
    baseline: 651,
    baselineLabel: "$651",
    target2030: 810,
    target2030Label: ">$810 (~TZS 4.0M)",
    target2050: 1450,
    target2050Label: ">$1,450 (~TZS 6.2M)",
    current: 690,
    currentLabel: "$690",
    betterDirection: "up",
    actualSource: "AMP 2050 estimate",
    actualYear: 2022,
    description:
      "Average income per farm household. Lifting rural incomes underpins the Malabo poverty and livelihoods commitments.",
  },
  {
    id: "agro-processing",
    label: "Agro-Processing Value",
    unit: "USD",
    baselineYear: 2022,
    baseline: 1.5,
    baselineLabel: "$1.5B",
    target2030: 3.0,
    target2030Label: "$3.0B",
    target2050: 7.5,
    target2050Label: "5x Increase (~$7.5B)",
    current: 1.8,
    currentLabel: "$1.8B",
    betterDirection: "up",
    actualSource: "AMP 2050 estimate",
    actualYear: 2022,
    description:
      "Value added through agro-processing. AMP targets a doubling by 2030 and a 5x increase by 2050.",
  },
  {
    id: "undernourishment",
    label: "Undernourishment Rate",
    unit: "%",
    baselineYear: 2022,
    baseline: 25,
    baselineLabel: "25%",
    target2030: 15.1,
    target2030Label: "15.1%",
    target2050: 0,
    target2050Label: "Eradicated (0% by 2042)",
    current: 20.2,
    currentLabel: "20.2%",
    betterDirection: "down",
    actualSource: "World Bank / FAO (SN.ITK.DEFC.ZS)",
    actualYear: 2023,
    description:
      "Prevalence of undernourishment. Latest actual 20.2% (2023). AMP commits to eradication by 2042 — directly answering the Malabo Zero Hunger goal.",
  },
  {
    id: "poverty-count",
    label: "Poverty Headcount",
    unit: "people",
    baselineYear: 2022,
    baseline: 26,
    baselineLabel: "26M people",
    target2030: 21.7,
    target2030Label: "21.7M",
    target2050: 2,
    target2050Label: "2M",
    current: 25.1,
    currentLabel: "25.1M",
    betterDirection: "down",
    actualSource: "World Bank rate 26.4% (2018), AMP count est.",
    actualYear: 2018,
    description:
      "People living below the poverty line. AMP targets a 92% reduction by 2050, exceeding the Malabo commitment to halve poverty.",
  },
  {
    id: "public-investment",
    label: "Required Public Investment",
    unit: "USD",
    baselineYear: 2024,
    baseline: 0,
    baselineLabel: "$0 (2024)",
    target2030: 5.5,
    target2030Label: "$5.5B (2024–2030)",
    target2050: 20,
    target2050Label: "$20B GDP unlocked",
    current: 0.9,
    currentLabel: "$0.9B committed",
    betterDirection: "up",
    actualSource: "AMP 2050 financing plan",
    actualYear: 2024,
    description:
      "Public investment of USD 5.5B (2024–2030) unlocks ~USD 20B in GDP growth — a benefit-cost ratio of 3.5.",
  },
];

export const AMP_HEADLINES = {
  benefitCostRatio: 3.5,
  requiredPublicInvestment: 5.5, // USD B, 2024-2030
  gdpUnlocked: 20, // USD B
  visionYearTargetGdp: 100, // USD B by 2050
  agGdpTzs2050: 280, // TZS trillion
};

// Helper: progress toward the 2030 target (0-100), respecting direction.
export function progressTo2030(kpi: KpiTarget): number {
  const from = kpi.baseline;
  const to = kpi.target2030;
  const cur = kpi.current ?? kpi.baseline;
  if (from === to) return 100;
  const pct = ((cur - from) / (to - from)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
