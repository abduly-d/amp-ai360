// 26 Mainland Tanzania regions with AMP agricultural indicators.
// x/y are stylised positions (0-100) for the SVG map — approximate geography.

export interface Region {
  id: string;
  name: string;
  zone: string;
  x: number;
  y: number;
  croplandCoverPct: number; // % of land under cultivation
  irrigationPct: number; // % of cropland irrigated
  stuntingPct: number; // under-5 stunting
  ampScore: number; // 0-100 composite AMP readiness score
  leadCommodities: string[];
}

export const REGIONS: Region[] = [
  { id: "dodoma", name: "Dodoma", zone: "Central", x: 52, y: 55, croplandCoverPct: 34, irrigationPct: 6, stuntingPct: 30, ampScore: 61, leadCommodities: ["Sunflower", "Grapes", "Sorghum"] },
  { id: "arusha", name: "Arusha", zone: "Northern", x: 55, y: 24, croplandCoverPct: 28, irrigationPct: 14, stuntingPct: 35, ampScore: 68, leadCommodities: ["Horticulture", "Wheat", "Coffee"] },
  { id: "kilimanjaro", name: "Kilimanjaro", zone: "Northern", x: 60, y: 22, croplandCoverPct: 41, irrigationPct: 22, stuntingPct: 29, ampScore: 72, leadCommodities: ["Coffee", "Horticulture", "Dairy"] },
  { id: "manyara", name: "Manyara", zone: "Northern", x: 54, y: 32, croplandCoverPct: 33, irrigationPct: 9, stuntingPct: 38, ampScore: 60, leadCommodities: ["Red Meat", "Pulses", "Fodder"] },
  { id: "tanga", name: "Tanga", zone: "Coastal", x: 66, y: 34, croplandCoverPct: 37, irrigationPct: 11, stuntingPct: 32, ampScore: 64, leadCommodities: ["Sisal", "Dairy", "Horticulture"] },
  { id: "morogoro", name: "Morogoro", zone: "Eastern", x: 58, y: 48, croplandCoverPct: 39, irrigationPct: 16, stuntingPct: 31, ampScore: 70, leadCommodities: ["Rice", "Sisal", "Sugar"] },
  { id: "pwani", name: "Pwani", zone: "Coastal", x: 68, y: 50, croplandCoverPct: 30, irrigationPct: 8, stuntingPct: 28, ampScore: 58, leadCommodities: ["Cashew", "Cassava", "Poultry"] },
  { id: "dar", name: "Dar es Salaam", zone: "Coastal", x: 71, y: 52, croplandCoverPct: 12, irrigationPct: 5, stuntingPct: 15, ampScore: 55, leadCommodities: ["Poultry", "Horticulture", "Aquaculture"] },
  { id: "lindi", name: "Lindi", zone: "Southern", x: 66, y: 68, croplandCoverPct: 26, irrigationPct: 4, stuntingPct: 33, ampScore: 54, leadCommodities: ["Cashew", "Cassava", "Sesame"] },
  { id: "mtwara", name: "Mtwara", zone: "Southern", x: 68, y: 76, croplandCoverPct: 31, irrigationPct: 5, stuntingPct: 34, ampScore: 57, leadCommodities: ["Cashew", "Cassava", "Pulses"] },
  { id: "ruvuma", name: "Ruvuma", zone: "Southern Highlands", x: 52, y: 74, croplandCoverPct: 35, irrigationPct: 7, stuntingPct: 40, ampScore: 63, leadCommodities: ["Maize", "Tobacco", "Soybeans"] },
  { id: "njombe", name: "Njombe", zone: "Southern Highlands", x: 46, y: 68, croplandCoverPct: 44, irrigationPct: 12, stuntingPct: 49, ampScore: 71, leadCommodities: ["Avocado", "Maize", "Tea"] },
  { id: "iringa", name: "Iringa", zone: "Southern Highlands", x: 48, y: 60, croplandCoverPct: 40, irrigationPct: 13, stuntingPct: 42, ampScore: 69, leadCommodities: ["Maize", "Horticulture", "Dairy"] },
  { id: "mbeya", name: "Mbeya", zone: "Southern Highlands", x: 38, y: 66, croplandCoverPct: 43, irrigationPct: 15, stuntingPct: 36, ampScore: 74, leadCommodities: ["Rice", "Maize", "Coffee"] },
  { id: "songwe", name: "Songwe", zone: "Southern Highlands", x: 33, y: 63, croplandCoverPct: 38, irrigationPct: 10, stuntingPct: 37, ampScore: 62, leadCommodities: ["Maize", "Rice", "Coffee"] },
  { id: "rukwa", name: "Rukwa", zone: "Western Highlands", x: 30, y: 58, croplandCoverPct: 42, irrigationPct: 8, stuntingPct: 45, ampScore: 66, leadCommodities: ["Maize", "Pulses", "Rice"] },
  { id: "katavi", name: "Katavi", zone: "Western", x: 32, y: 50, croplandCoverPct: 29, irrigationPct: 6, stuntingPct: 41, ampScore: 56, leadCommodities: ["Maize", "Tobacco", "Pulses"] },
  { id: "tabora", name: "Tabora", zone: "Western", x: 40, y: 44, croplandCoverPct: 32, irrigationPct: 5, stuntingPct: 39, ampScore: 59, leadCommodities: ["Tobacco", "Cotton", "Red Meat"] },
  { id: "singida", name: "Singida", zone: "Central", x: 47, y: 45, croplandCoverPct: 31, irrigationPct: 6, stuntingPct: 33, ampScore: 60, leadCommodities: ["Sunflower", "Red Meat", "Pulses"] },
  { id: "shinyanga", name: "Shinyanga", zone: "Lake", x: 42, y: 35, croplandCoverPct: 34, irrigationPct: 7, stuntingPct: 30, ampScore: 61, leadCommodities: ["Cotton", "Rice", "Red Meat"] },
  { id: "simiyu", name: "Simiyu", zone: "Lake", x: 45, y: 31, croplandCoverPct: 36, irrigationPct: 6, stuntingPct: 32, ampScore: 60, leadCommodities: ["Cotton", "Maize", "Red Meat"] },
  { id: "mwanza", name: "Mwanza", zone: "Lake", x: 40, y: 28, croplandCoverPct: 33, irrigationPct: 9, stuntingPct: 28, ampScore: 64, leadCommodities: ["Cotton", "Aquaculture", "Rice"] },
  { id: "geita", name: "Geita", zone: "Lake", x: 36, y: 30, croplandCoverPct: 30, irrigationPct: 6, stuntingPct: 34, ampScore: 57, leadCommodities: ["Cotton", "Tobacco", "Maize"] },
  { id: "kagera", name: "Kagera", zone: "Lake", x: 30, y: 26, croplandCoverPct: 38, irrigationPct: 8, stuntingPct: 41, ampScore: 65, leadCommodities: ["Coffee", "Banana", "Aquaculture"] },
  { id: "kigoma", name: "Kigoma", zone: "Western", x: 27, y: 40, croplandCoverPct: 31, irrigationPct: 5, stuntingPct: 43, ampScore: 55, leadCommodities: ["Cassava", "Rice", "Oil Palm"] },
  { id: "mara", name: "Mara", zone: "Lake", x: 44, y: 24, croplandCoverPct: 32, irrigationPct: 7, stuntingPct: 29, ampScore: 59, leadCommodities: ["Cotton", "Rice", "Aquaculture"] },
];

export function scoreBand(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "High readiness", color: "#1EA84C" };
  if (score >= 60) return { label: "Moderate", color: "#FCD116" };
  return { label: "Needs support", color: "#EF4444" };
}
