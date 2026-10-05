// 20 AMP Priority Commodities with production, loss, and price series.

export type CommodityCategory =
  | "Cereals"
  | "Cash Crops"
  | "Horticulture"
  | "Roots & Tubers"
  | "Oilseeds"
  | "Pulses"
  | "Livestock"
  | "Fisheries";

export interface CommodityPoint {
  year: number;
  production: number; // '000 metric tons (or '000 tons live weight for livestock)
  price: number; // TZS per kg (indicative farmgate)
}

export interface Commodity {
  id: string;
  name: string;
  emoji: string;
  category: CommodityCategory;
  postHarvestLossPct: number;
  amp2030TargetProduction: number; // '000 MT
  seasonTargetProduction?: number; // '000 MT — current marketing-season target
  seasonLabel?: string; // e.g. "2026/2027"
  keyRegions: string[];
  status: "growing" | "stable" | "declining";
  note: string;
  series: CommodityPoint[];
}

function series(base: number, priceBase: number, growth: number): CommodityPoint[] {
  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  return years.map((year, i) => ({
    year,
    production: Math.round(base * Math.pow(1 + growth, i)),
    price: Math.round(priceBase * Math.pow(1.06, i)),
  }));
}

export const COMMODITIES: Commodity[] = [
  { id: "maize", name: "Maize", emoji: "🌽", category: "Cereals", postHarvestLossPct: 18, amp2030TargetProduction: 10500, keyRegions: ["Njombe", "Mbeya", "Ruvuma", "Rukwa"], status: "growing", note: "Staple food security crop; NFRA strategic reserve anchor.", series: series(6200, 480, 0.06) },
  { id: "rice", name: "Rice", emoji: "🌾", category: "Cereals", postHarvestLossPct: 15, amp2030TargetProduction: 4200, keyRegions: ["Morogoro", "Mbeya", "Shinyanga", "Kigoma"], status: "growing", note: "High irrigation-linked upside; key to import substitution.", series: series(2100, 900, 0.07) },
  { id: "wheat", name: "Wheat", emoji: "🌿", category: "Cereals", postHarvestLossPct: 12, amp2030TargetProduction: 300, keyRegions: ["Arusha", "Manyara", "Iringa"], status: "stable", note: "Large import gap; strategic domestic expansion target.", series: series(80, 1100, 0.04) },
  { id: "cashew", name: "Cashew", emoji: "🥜", category: "Cash Crops", postHarvestLossPct: 8, amp2030TargetProduction: 1000, seasonTargetProduction: 750, seasonLabel: "2026/2027", keyRegions: ["Mtwara", "Lindi", "Ruvuma", "Pwani"], status: "growing", note: "2025/26 output 618,497 MT; 2026/27 target 750,000 MT; 2030 target 1.0M MT (Cashewnut Board of Tanzania). Top export earner; processing localisation priority.", series: series(360.6, 2600, 0.08) },
  { id: "coffee", name: "Coffee", emoji: "☕", category: "Cash Crops", postHarvestLossPct: 6, amp2030TargetProduction: 300, keyRegions: ["Kagera", "Kilimanjaro", "Mbeya", "Ruvuma"], status: "stable", note: "Value premium via washed arabica and traceability.", series: series(65, 4200, 0.05) },
  { id: "cotton", name: "Cotton", emoji: "🧵", category: "Cash Crops", postHarvestLossPct: 9, amp2030TargetProduction: 1000, keyRegions: ["Simiyu", "Mwanza", "Shinyanga", "Tabora"], status: "declining", note: "Textiles linkage; contract farming revival needed.", series: series(350, 1150, -0.02) },
  { id: "sisal", name: "Sisal", emoji: "🪢", category: "Cash Crops", postHarvestLossPct: 5, amp2030TargetProduction: 120, keyRegions: ["Tanga", "Morogoro", "Kilimanjaro"], status: "growing", note: "Rising global fibre demand; biogas co-products.", series: series(45, 1400, 0.06) },
  { id: "avocado", name: "Avocado", emoji: "🥑", category: "Horticulture", postHarvestLossPct: 22, amp2030TargetProduction: 250, keyRegions: ["Njombe", "Iringa", "Mbeya"], status: "growing", note: "Fastest-growing export horticulture; cold chain gaps.", series: series(48, 1800, 0.12) },
  { id: "cassava", name: "Cassava", emoji: "🍠", category: "Roots & Tubers", postHarvestLossPct: 28, amp2030TargetProduction: 9000, keyRegions: ["Mtwara", "Lindi", "Pwani", "Kigoma"], status: "stable", note: "Climate-resilient staple; industrial starch potential.", series: series(7000, 350, 0.03) },
  { id: "sunflower", name: "Sunflower", emoji: "🌻", category: "Oilseeds", postHarvestLossPct: 11, amp2030TargetProduction: 1500, keyRegions: ["Singida", "Dodoma", "Manyara", "Iringa"], status: "growing", note: "Edible oil self-sufficiency flagship input.", series: series(900, 950, 0.10) },
  { id: "soybeans", name: "Soybeans", emoji: "🫘", category: "Oilseeds", postHarvestLossPct: 10, amp2030TargetProduction: 350, keyRegions: ["Ruvuma", "Njombe", "Rukwa"], status: "growing", note: "Feed and protein value chain; poultry linkage.", series: series(45, 1300, 0.14) },
  { id: "pulses", name: "Pulses", emoji: "🌱", category: "Pulses", postHarvestLossPct: 13, amp2030TargetProduction: 2600, keyRegions: ["Manyara", "Arusha", "Njombe", "Katavi"], status: "growing", note: "Beans, pigeon peas, green gram; strong regional exports.", series: series(1700, 1500, 0.05) },
  { id: "aquaculture", name: "Aquaculture", emoji: "🐟", category: "Fisheries", postHarvestLossPct: 20, amp2030TargetProduction: 250, keyRegions: ["Mwanza", "Kagera", "Mbeya", "Ruvuma"], status: "growing", note: "Tilapia and catfish cage/pond expansion under TAFIRI.", series: series(18, 5200, 0.15) },
  { id: "poultry", name: "Poultry", emoji: "🐔", category: "Livestock", postHarvestLossPct: 7, amp2030TargetProduction: 1100, keyRegions: ["Dar es Salaam", "Pwani", "Morogoro", "Dodoma"], status: "growing", note: "Fast protein growth; feed cost is binding constraint.", series: series(600, 6500, 0.09) },
  { id: "red-meat", name: "Red Meat", emoji: "🥩", category: "Livestock", postHarvestLossPct: 9, amp2030TargetProduction: 900, keyRegions: ["Manyara", "Singida", "Tabora", "Shinyanga"], status: "stable", note: "3rd-largest African herd; abattoir & export upgrade.", series: series(700, 7800, 0.04) },
  { id: "dairy", name: "Dairy", emoji: "🥛", category: "Livestock", postHarvestLossPct: 16, amp2030TargetProduction: 4500, keyRegions: ["Tanga", "Iringa", "Njombe", "Kilimanjaro"], status: "growing", note: "Cold chain and breed improvement via TALIRI.", series: series(3200, 900, 0.06) },
  { id: "fodder", name: "Fodder", emoji: "🌾", category: "Livestock", postHarvestLossPct: 14, amp2030TargetProduction: 1200, keyRegions: ["Manyara", "Dodoma", "Singida"], status: "growing", note: "Feed-and-fodder flagship underpins livestock productivity.", series: series(500, 400, 0.08) },
  { id: "horticulture", name: "Horticulture (Veg & Fruit)", emoji: "🍅", category: "Horticulture", postHarvestLossPct: 30, amp2030TargetProduction: 2200, keyRegions: ["Arusha", "Kilimanjaro", "Iringa", "Tanga"], status: "growing", note: "Highest post-harvest loss; export logistics priority.", series: series(1200, 800, 0.11) },
  { id: "tea", name: "Tea", emoji: "🍵", category: "Cash Crops", postHarvestLossPct: 6, amp2030TargetProduction: 90, keyRegions: ["Njombe", "Mbeya", "Tanga", "Iringa"], status: "stable", note: "Smallholder factory linkages; quality premium play.", series: series(55, 1600, 0.03) },
  { id: "tobacco", name: "Tobacco", emoji: "🍂", category: "Cash Crops", postHarvestLossPct: 5, amp2030TargetProduction: 130, keyRegions: ["Tabora", "Katavi", "Ruvuma", "Geita"], status: "stable", note: "High-value export; diversification pressure over time.", series: series(90, 3500, 0.02) },
];
