// CAADP / Malabo Declaration alignment framework vs AMP 2050 targets.

export type AlignmentVerdict =
  | "exceeds"
  | "aligned"
  | "gap"
  | "critical-gap";

export interface CaadpMetric {
  id: string;
  dimension: string;
  caadpCommitment: string;
  caadpValueLabel: string;
  ampPosition: string;
  ampValueLabel: string;
  verdict: AlignmentVerdict;
  badge: string;
  commentary: string;
}

export const CAADP_MATRIX: CaadpMetric[] = [
  {
    id: "budget",
    dimension: "Public Budget Allocation",
    caadpCommitment: "Maputo/Malabo: ≥10% of total national budget to agriculture",
    caadpValueLabel: "≥10%",
    ampPosition: "AMP current allocation to agriculture",
    ampValueLabel: "~5.9%",
    verdict: "critical-gap",
    badge: "Budget Allocation Requires Expansion",
    commentary:
      "Tanzania allocates ~5.9% of the national budget to agriculture against the ≥10% Maputo commitment — the single largest CAADP compliance gap. Closing it requires ~USD 5.5B additional public investment (2024–2030).",
  },
  {
    id: "growth",
    dimension: "Annual Sector Growth",
    caadpCommitment: "Malabo: sustain ≥6% annual agricultural GDP growth",
    caadpValueLabel: "≥6%",
    ampPosition: "AMP 2030 growth goal (from 4.8% baseline)",
    ampValueLabel: "10%",
    verdict: "exceeds",
    badge: "AMP Target Exceeds CAADP Baseline",
    commentary:
      "AMP's 10% growth ambition is 1.7x the Malabo ≥6% floor. Current performance (4.8%) is still below the CAADP threshold, so execution — not ambition — is the binding constraint.",
  },
  {
    id: "trade",
    dimension: "Intra-African Trade",
    caadpCommitment: "Malabo: triple intra-African agricultural trade by 2025",
    caadpValueLabel: "3x",
    ampPosition: "AMP export goal $6B by 2030 ($20B by 2050)",
    ampValueLabel: "$6B → $20B",
    verdict: "aligned",
    badge: "Aligned — AfCFTA Leverage",
    commentary:
      "AMP's 5x export expansion is directionally consistent with the tripling-of-trade commitment and positions Tanzania to capture AfCFTA regional demand, though intra-African share must be tracked explicitly.",
  },
  {
    id: "poverty",
    dimension: "Poverty & Hunger",
    caadpCommitment: "Malabo: end hunger by 2025 & halve poverty via agriculture",
    caadpValueLabel: "Halve poverty / Zero Hunger",
    ampPosition: "AMP: undernourishment eradicated by 2042; poverty 26M → 2M",
    ampValueLabel: "0% hunger by 2042; -92% poverty",
    verdict: "aligned",
    badge: "Aligned — Timeline Extends Beyond Malabo",
    commentary:
      "AMP fully embraces Zero Hunger and deep poverty reduction, but on a 2042/2050 horizon rather than the 2025 Malabo deadline. Reporting should frame this as a credible, financed trajectory.",
  },
  {
    id: "resilience",
    dimension: "Climate Resilience",
    caadpCommitment: "Malabo: 30% of farm households resilient to climate shocks",
    caadpValueLabel: "30% resilient",
    ampPosition: "AMP Flagship 15: climate-smart agriculture at scale",
    ampValueLabel: "42% coverage → 100%",
    verdict: "aligned",
    badge: "Aligned — Flagship 15 Anchor",
    commentary:
      "AMP's climate resilience flagship maps directly onto the Malabo resilience target; current 42% coverage already exceeds the 30% commitment and is on a path to full mainstreaming.",
  },
  {
    id: "mutual-accountability",
    dimension: "Mutual Accountability",
    caadpCommitment: "Malabo: Biennial Review (BR) reporting & peer scorecards",
    caadpValueLabel: "BR compliant",
    ampPosition: "AMP institutional scorecard & M&E framework",
    ampValueLabel: "In development",
    verdict: "gap",
    badge: "Strengthen BR Reporting Systems",
    commentary:
      "AMP's M&E and institutional scorecard need hardening to feed the CAADP Biennial Review reliably. This is a process gap rather than an ambition gap.",
  },
  {
    id: "post-malabo",
    dimension: "Post-Malabo Agenda (2026–2035)",
    caadpCommitment: "Kampala CAADP: food systems, agro-industrialization, climate, inclusion of women & youth",
    caadpValueLabel: "2026–2035 strategy",
    ampPosition: "AMP Flagships 9, 13, 14, 15 (processing, youth/women, livestock, climate)",
    ampValueLabel: "Multi-flagship",
    verdict: "exceeds",
    badge: "AMP Pre-Positioned for Post-Malabo",
    commentary:
      "AMP already operationalises the Post-Malabo priorities — sustainable food production, agro-industrialization, climate resilience, and inclusive livelihoods for women and youth — through dedicated flagships.",
  },
];

export const VERDICT_META: Record<
  AlignmentVerdict,
  { label: string; color: string; bg: string }
> = {
  exceeds: { label: "Exceeds", color: "#065F46", bg: "#D1FAE5" },
  aligned: { label: "Aligned", color: "#1E3A8A", bg: "#DBEAFE" },
  gap: { label: "Gap", color: "#92400E", bg: "#FEF3C7" },
  "critical-gap": { label: "Critical Gap", color: "#991B1B", bg: "#FEE2E2" },
};

// Radar-style scorecard: AMP score vs CAADP threshold (0-100 normalised).
export const CAADP_SCORECARD = [
  { dimension: "Budget (10%)", amp: 59, caadp: 100 },
  { dimension: "Growth (6%)", amp: 80, caadp: 60 },
  { dimension: "Trade (3x)", amp: 72, caadp: 70 },
  { dimension: "Poverty", amp: 66, caadp: 80 },
  { dimension: "Hunger", amp: 70, caadp: 80 },
  { dimension: "Resilience", amp: 76, caadp: 60 },
  { dimension: "Accountability", amp: 52, caadp: 75 },
];
