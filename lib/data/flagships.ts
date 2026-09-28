// The 15 AMP Flagship Programmes with progress and interdependencies.

export type FlagshipStatus = "on-track" | "at-risk" | "critical";

export interface Flagship {
  id: number;
  name: string;
  targetLabel: string;
  target: number;
  current: number;
  unit: string;
  status: FlagshipStatus;
  lead: string;
  budgetUsdM: number;
  // ids of flagships this one materially depends on / drives
  linkedTo: number[];
  summary: string;
}

export const FLAGSHIPS: Flagship[] = [
  { id: 1, name: "Irrigation Expansion", targetLabel: "1.2M ha irrigated", target: 1200, current: 727, unit: "'000 ha", status: "at-risk", lead: "NIRC / MoA", budgetUsdM: 1150, linkedTo: [2, 3, 8, 10], summary: "Scale irrigated area to 1.2M ha, unlocking multi-season, climate-resilient production." },
  { id: 2, name: "Seed Production (Quintupling)", targetLabel: "5x certified seed", target: 500, current: 240, unit: "% of baseline", status: "at-risk", lead: "ASA / TARI", budgetUsdM: 320, linkedTo: [1, 3, 4], summary: "Quintuple certified seed output to raise yields across priority commodities." },
  { id: 3, name: "Soil Health & Fertilizer", targetLabel: "3M ha restored", target: 3000, current: 1180, unit: "'000 ha", status: "at-risk", lead: "TARI / MoA", budgetUsdM: 420, linkedTo: [1, 2, 8], summary: "Restore soil health on 3M ha and rationalise fertilizer use and blending." },
  { id: 4, name: "Farmer Registration & Extension", targetLabel: "9.9M farmers", target: 9900, current: 4600, unit: "'000 farmers", status: "at-risk", lead: "MoA Extension", budgetUsdM: 260, linkedTo: [2, 5, 11], summary: "Register 9.9M farmers and modernise digital extension for advisory at scale." },
  { id: 5, name: "Mechanization", targetLabel: "25% mechanized", target: 25, current: 14, unit: "% area", status: "at-risk", lead: "CAMARTEC / MoA", budgetUsdM: 380, linkedTo: [1, 4, 8], summary: "Raise mechanization coverage, cutting labour bottlenecks and drudgery." },
  { id: 6, name: "NFRA Strategic Reserves", targetLabel: "3M tons reserve", target: 3000, current: 1100, unit: "'000 tons", status: "critical", lead: "NFRA", budgetUsdM: 300, linkedTo: [9, 14], summary: "Expand national food reserve to 3M tons for price stability and food security." },
  { id: 7, name: "Post-Harvest & Storage", targetLabel: "50% loss reduction", target: 50, current: 18, unit: "% loss cut", status: "critical", lead: "MoA / CPB", budgetUsdM: 340, linkedTo: [6, 8, 9], summary: "Halve post-harvest losses through storage, aggregation and cold chain." },
  { id: 8, name: "Commercial & Block Farming", targetLabel: "700k ha blocks", target: 700, current: 250, unit: "'000 ha", status: "at-risk", lead: "SAGCOT / NDC", budgetUsdM: 900, linkedTo: [1, 3, 5, 10], summary: "Develop commercial farming blocks and out-grower models to crowd in investment." },
  { id: 9, name: "Agro-Processing & Value Addition", targetLabel: "5x processing", target: 500, current: 190, unit: "% of baseline", status: "at-risk", lead: "MITI / EPZA", budgetUsdM: 780, linkedTo: [7, 10, 12], summary: "Quintuple agro-processing value to drive agro-industrialization and exports." },
  { id: 10, name: "Market Access & Trade", targetLabel: "$6B exports", target: 6000, current: 1600, unit: "USD M", status: "at-risk", lead: "TMX / TanTrade", budgetUsdM: 260, linkedTo: [8, 9, 12], summary: "Grow structured markets and net exports to USD 6B by 2030." },
  { id: 11, name: "Agri-Finance & Insurance", targetLabel: "TZS 5T credit", target: 5000, current: 1900, unit: "TZS B", status: "at-risk", lead: "TADB / BoT", budgetUsdM: 220, linkedTo: [4, 8, 13], summary: "Expand affordable credit and index insurance to de-risk smallholders." },
  { id: 12, name: "Digital Agriculture", targetLabel: "Full e-platform", target: 100, current: 45, unit: "% rollout", status: "at-risk", lead: "MoA ICT", budgetUsdM: 140, linkedTo: [4, 10, 11], summary: "Deploy integrated digital platform for advisory, markets and traceability." },
  { id: 13, name: "Youth & Women Agripreneurs", targetLabel: "1M enterprises", target: 1000, current: 360, unit: "'000 ventures", status: "at-risk", lead: "MoA / BBT", budgetUsdM: 200, linkedTo: [11, 12], summary: "Enable 1M youth and women agri-enterprises (Building a Better Tomorrow)." },
  { id: 14, name: "Livestock & Fisheries Productivity", targetLabel: "2x productivity", target: 200, current: 120, unit: "% of baseline", status: "at-risk", lead: "MLF / TALIRI / TAFIRI", budgetUsdM: 560, linkedTo: [3, 6, 9], summary: "Double livestock and fisheries productivity, including aquaculture scale-up." },
  { id: 15, name: "Climate Resilience & Sustainability", targetLabel: "Climate-smart at scale", target: 100, current: 42, unit: "% coverage", status: "at-risk", lead: "VPO / MoA", budgetUsdM: 480, linkedTo: [1, 3, 7], summary: "Mainstream climate-smart agriculture and safeguard natural resource base." },
];

export const STATUS_META: Record<FlagshipStatus, { label: string; icon: string; color: string }> = {
  "on-track": { label: "On Track", icon: "🟢", color: "#1EA84C" },
  "at-risk": { label: "At Risk", icon: "🟡", color: "#FCD116" },
  critical: { label: "Critical", icon: "🔴", color: "#EF4444" },
};

export function flagshipProgress(f: Flagship): number {
  return Math.max(0, Math.min(100, Math.round((f.current / f.target) * 100)));
}
