// AI Commodity Forecast Engine — predictive signals per commodity.

export type Recommendation =
  | "BUY"
  | "STRENGTHEN RESERVES"
  | "HOLD"
  | "EXPORT PUSH"
  | "DIVERSIFY";

export type RiskLevel = "Low" | "Moderate" | "High";

export interface Forecast {
  commodityId: string;
  name: string;
  emoji: string;
  priceOutlookPct: number; // expected 12-month price change
  weatherRisk: RiskLevel;
  tradeSignal: "Import Pressure" | "Export Opportunity" | "Balanced";
  confidence: number; // 0-100
  recommendation: Recommendation;
  rationale: string;
}

export const FORECASTS: Forecast[] = [
  { commodityId: "maize", name: "Maize", emoji: "🌽", priceOutlookPct: 9, weatherRisk: "High", tradeSignal: "Balanced", confidence: 82, recommendation: "STRENGTHEN RESERVES", rationale: "Below-average short rains raise price and food-security risk; build NFRA buffer ahead of Q1." },
  { commodityId: "rice", name: "Rice", emoji: "🌾", priceOutlookPct: 6, weatherRisk: "Moderate", tradeSignal: "Export Opportunity", confidence: 78, recommendation: "EXPORT PUSH", rationale: "Irrigation gains lift surplus; regional deficit opens structured export via TMX." },
  { commodityId: "wheat", name: "Wheat", emoji: "🌿", priceOutlookPct: 12, weatherRisk: "Moderate", tradeSignal: "Import Pressure", confidence: 74, recommendation: "BUY", rationale: "Large structural import gap and firm global prices; secure forward contracts." },
  { commodityId: "cashew", name: "Cashew", emoji: "🥜", priceOutlookPct: 8, weatherRisk: "Low", tradeSignal: "Export Opportunity", confidence: 85, recommendation: "EXPORT PUSH", rationale: "Strong global demand; localise processing to capture higher margin." },
  { commodityId: "sunflower", name: "Sunflower", emoji: "🌻", priceOutlookPct: 5, weatherRisk: "Moderate", tradeSignal: "Import Pressure", confidence: 80, recommendation: "BUY", rationale: "Edible-oil self-sufficiency drive; back domestic crushing and seed supply." },
  { commodityId: "avocado", name: "Avocado", emoji: "🥑", priceOutlookPct: 14, weatherRisk: "Low", tradeSignal: "Export Opportunity", confidence: 83, recommendation: "EXPORT PUSH", rationale: "Fastest-growing export horticulture; expand cold chain and market corridors." },
  { commodityId: "cotton", name: "Cotton", emoji: "🧵", priceOutlookPct: -3, weatherRisk: "Moderate", tradeSignal: "Balanced", confidence: 70, recommendation: "DIVERSIFY", rationale: "Softening volumes and prices; revive contract farming or diversify Lake Zone mix." },
  { commodityId: "coffee", name: "Coffee", emoji: "☕", priceOutlookPct: 7, weatherRisk: "Moderate", tradeSignal: "Export Opportunity", confidence: 76, recommendation: "HOLD", rationale: "Quality premiums firm; maintain traceability and washed-arabica upgrades." },
  { commodityId: "dairy", name: "Dairy", emoji: "🥛", priceOutlookPct: 4, weatherRisk: "Low", tradeSignal: "Balanced", confidence: 72, recommendation: "HOLD", rationale: "Steady domestic demand; cold chain and breed improvement unlock upside." },
  { commodityId: "poultry", name: "Poultry", emoji: "🐔", priceOutlookPct: 6, weatherRisk: "Low", tradeSignal: "Balanced", confidence: 75, recommendation: "BUY", rationale: "Fast protein demand; feed-cost management (soy/maize) is the key lever." },
];
