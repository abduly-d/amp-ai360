// Executive Decision Room — daily critical alerts for the Minister's briefing.

export type AlertLevel = "red" | "amber" | "green";

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  category: string;
  flagship?: number;
  recommendation: string;
  timestamp: string;
}

export const ALERTS: Alert[] = [
  {
    id: "a1",
    level: "red",
    title: "NFRA reserves 63% below 3M-ton target",
    detail:
      "Strategic grain reserves stand at 1.1M tons against the 3M-ton flagship target. A below-average short-rains forecast raises stock-out risk for Q1 2027.",
    category: "Food Security",
    flagship: 6,
    recommendation:
      "Approve emergency procurement window and fast-track NFRA silo commissioning in Dodoma & Songea.",
    timestamp: "2026-07-27T06:10:00Z",
  },
  {
    id: "a2",
    level: "red",
    title: "Agriculture budget share stuck at 5.9% vs Maputo 10%",
    detail:
      "The FY allocation leaves Tanzania 4.1 points below the CAADP Maputo commitment, jeopardising Biennial Review standing.",
    category: "CAADP Compliance",
    recommendation:
      "Table a phased budget ramp to Cabinet targeting 8% next cycle, prioritising irrigation and seed flagships.",
    timestamp: "2026-07-27T05:40:00Z",
  },
  {
    id: "a3",
    level: "amber",
    title: "Irrigation delivery at 61% of 1.2M ha trajectory",
    detail:
      "727k ha irrigated; disbursement delays on three basin schemes threaten the 2030 milestone.",
    category: "Flagship Delivery",
    flagship: 1,
    recommendation:
      "Escalate contractor payments and reallocate to shovel-ready schemes in Mbeya and Morogoro.",
    timestamp: "2026-07-26T15:20:00Z",
  },
  {
    id: "a4",
    level: "amber",
    title: "Cotton output declining ~2%/yr in Lake Zone",
    detail:
      "Weak contract farming and input access are eroding cotton volumes, pressuring the textiles value chain.",
    category: "Commodity Risk",
    recommendation:
      "Relaunch contract-farming compact with ginners and guarantee timely input credit via TADB.",
    timestamp: "2026-07-26T11:05:00Z",
  },
  {
    id: "a5",
    level: "green",
    title: "Avocado exports up 12%/yr — cold-chain scale-up paying off",
    detail:
      "Njombe/Iringa avocado exports continue double-digit growth, strengthening the horticulture export mix.",
    category: "Opportunity",
    recommendation:
      "Sustain cold-chain investment and open two additional EU/Middle East market access corridors.",
    timestamp: "2026-07-25T09:30:00Z",
  },
  {
    id: "a6",
    level: "green",
    title: "Sunflower on track for edible-oil self-sufficiency",
    detail:
      "Sunflower production growing ~10%/yr in Singida/Dodoma, narrowing the edible-oil import bill.",
    category: "Opportunity",
    flagship: 9,
    recommendation:
      "Expand oilseed processing SME finance and maintain seed multiplication momentum.",
    timestamp: "2026-07-25T08:00:00Z",
  },
];

export const ALERT_META: Record<AlertLevel, { label: string; color: string; bg: string }> = {
  red: { label: "Critical", color: "#991B1B", bg: "#FEE2E2" },
  amber: { label: "Watch", color: "#92400E", bg: "#FEF3C7" },
  green: { label: "Positive", color: "#065F46", bg: "#D1FAE5" },
};
