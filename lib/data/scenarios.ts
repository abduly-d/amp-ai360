// Vision 2030 & 2050 scenario paths: Business-As-Usual vs Full AMP Implementation.

export interface ScenarioPoint {
  year: number;
  bau: number;
  amp: number;
}

export interface ScenarioSeries {
  id: string;
  label: string;
  unit: string;
  betterDirection: "up" | "down";
  data: ScenarioPoint[];
  narrative: string;
}

export const SCENARIOS: ScenarioSeries[] = [
  {
    id: "ag-gdp",
    label: "Agricultural GDP",
    unit: "USD B",
    betterDirection: "up",
    narrative:
      "Under BAU (~4.8% growth) Ag GDP reaches ~USD 45B by 2050. Full AMP implementation (10% growth) compounds to USD 100B — a USD 55B annual gap by mid-century.",
    data: [
      { year: 2022, bau: 18, amp: 18 },
      { year: 2030, bau: 24, amp: 31.2 },
      { year: 2035, bau: 29, amp: 45 },
      { year: 2040, bau: 35, amp: 62 },
      { year: 2050, bau: 45, amp: 100 },
    ],
  },
  {
    id: "exports",
    label: "Net Agricultural Exports",
    unit: "USD B",
    betterDirection: "up",
    narrative:
      "BAU exports drift to ~USD 5B by 2050. AMP's processing and market flagships lift net exports to USD 20B — a fourfold divergence.",
    data: [
      { year: 2022, bau: 1.2, amp: 1.2 },
      { year: 2030, bau: 2.4, amp: 6 },
      { year: 2035, bau: 3.1, amp: 9.5 },
      { year: 2040, bau: 3.9, amp: 13 },
      { year: 2050, bau: 5, amp: 20 },
    ],
  },
  {
    id: "poverty",
    label: "Poverty Headcount",
    unit: "M people",
    betterDirection: "down",
    narrative:
      "BAU leaves ~17M in poverty by 2050. AMP's income and jobs pathway cuts the headcount to 2M — lifting ~15M additional people out of poverty.",
    data: [
      { year: 2022, bau: 26, amp: 26 },
      { year: 2030, bau: 24, amp: 21.7 },
      { year: 2035, bau: 22, amp: 15 },
      { year: 2040, bau: 20, amp: 8 },
      { year: 2050, bau: 17, amp: 2 },
    ],
  },
  {
    id: "undernourishment",
    label: "Undernourishment Rate",
    unit: "%",
    betterDirection: "down",
    narrative:
      "BAU undernourishment plateaus near 19%. AMP eradicates undernourishment by 2042, reaching 0% and holding it.",
    data: [
      { year: 2022, bau: 25, amp: 25 },
      { year: 2030, bau: 22, amp: 15.1 },
      { year: 2035, bau: 21, amp: 8 },
      { year: 2042, bau: 20, amp: 0 },
      { year: 2050, bau: 19, amp: 0 },
    ],
  },
];
