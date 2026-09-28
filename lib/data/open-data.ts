// Real open-data snapshot for Tanzania (verifiable, key-free sources).
// Fetched from the World Bank Indicators API; used as the tier-2 live feed
// and as the offline fallback snapshot when the live call is unavailable.
// Each entry carries its indicator code, observation year and source so the
// figure is auditable for executive decision-making.

export interface OpenSignal {
  code: string; // World Bank indicator code
  label: string;
  value: number;
  valueLabel: string;
  unit: string;
  year: number;
  source: string;
  note?: string;
}

// Snapshot captured from api.worldbank.org (Tanzania, TZA), most-recent value.
export const OPEN_DATA_SNAPSHOT: OpenSignal[] = [
  { code: "NV.AGR.TOTL.CD", label: "Agriculture value added", value: 20.65, valueLabel: "$20.7B", unit: "USD", year: 2025, source: "World Bank" },
  { code: "NV.AGR.TOTL.ZS", label: "Agriculture, % of GDP", value: 22.9, valueLabel: "22.9%", unit: "%", year: 2025, source: "World Bank" },
  { code: "NV.AGR.TOTL.KD.ZG", label: "Ag value-added growth", value: 3.6, valueLabel: "3.6%", unit: "%", year: 2025, source: "World Bank", note: "Below the CAADP Malabo ≥6% floor" },
  { code: "NY.GDP.MKTP.CD", label: "Total GDP", value: 90.1, valueLabel: "$90.1B", unit: "USD", year: 2025, source: "World Bank" },
  { code: "SN.ITK.DEFC.ZS", label: "Undernourishment", value: 20.2, valueLabel: "20.2%", unit: "%", year: 2023, source: "World Bank / FAO" },
  { code: "SI.POV.NAHC", label: "Poverty headcount (national)", value: 26.4, valueLabel: "26.4%", unit: "%", year: 2018, source: "World Bank" },
  { code: "AG.PRD.CREL.MT", label: "Cereal production", value: 12.79, valueLabel: "12.8M MT", unit: "tonnes", year: 2023, source: "World Bank / FAO" },
  { code: "AG.YLD.CREL.KG", label: "Cereal yield", value: 1961, valueLabel: "1,961 kg/ha", unit: "kg/ha", year: 2023, source: "World Bank / FAO" },
  { code: "SP.RUR.TOTL", label: "Rural population", value: 44.5, valueLabel: "44.5M", unit: "people", year: 2025, source: "World Bank" },
  { code: "SP.POP.TOTL", label: "Total population", value: 70.6, valueLabel: "70.6M", unit: "people", year: 2025, source: "World Bank" },
];

// Indicators the live route attempts to refresh on each request.
export const WB_INDICATORS = OPEN_DATA_SNAPSHOT.map((s) => s.code);

export function formatWbValue(code: string, value: number): string {
  const s = OPEN_DATA_SNAPSHOT.find((x) => x.code === code);
  const unit = s?.unit;
  if (code === "NV.AGR.TOTL.CD" || code === "NY.GDP.MKTP.CD")
    return "$" + (value / 1e9).toFixed(1) + "B";
  if (code === "AG.PRD.CREL.MT") return (value / 1e6).toFixed(1) + "M MT";
  if (code === "AG.YLD.CREL.KG") return Math.round(value).toLocaleString() + " kg/ha";
  if (code === "SP.RUR.TOTL" || code === "SP.POP.TOTL")
    return (value / 1e6).toFixed(1) + "M";
  if (unit === "%") return value.toFixed(1) + "%";
  return String(value);
}
