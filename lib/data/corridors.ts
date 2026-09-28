// AGCOT growth corridors — the official four (Northern, Central, SAGCOT, Mtwara)
// per the AGCOT corridor map. Readiness = mean AMP score of member regions.

import { REGIONS } from "./regions";

export interface Corridor {
  id: string;
  name: string;
  short: string;
  color: string;
  regions: string[]; // region ids
  clusters: string[];
  leads: string[]; // lead value chains
  note: string;
}

export const CORRIDORS: Corridor[] = [
  { id: "sagcot", name: "SAGCOT Corridor", short: "SAGCOT", color: "#4E9F3D", regions: ["rukwa", "katavi", "mbeya", "songwe", "iringa", "njombe", "morogoro", "pwani", "dar", "ruvuma"], clusters: ["Ihemi", "Mbarali", "Kilombero", "Rufiji", "Sumbawanga", "Ludewa"], leads: ["Rice", "Maize", "Tea", "Avocado", "Soybeans", "Sugar", "Dairy"], note: "Flagship public-private-partnership corridor. Most investment-ready; anchor for commercial block farming (Flagship 8) and the current focus of operations." },
  { id: "central", name: "Central Corridor", short: "Central", color: "#E8A33D", regions: ["kigoma", "kagera", "mwanza", "geita", "shinyanga", "simiyu", "mara", "tabora", "dodoma", "singida"], clusters: ["Dodoma–Singida", "Tabora", "Lake Zone"], leads: ["Sunflower", "Cotton", "Rice", "Red Meat", "Tobacco", "Aquaculture"], note: "Largest corridor by area — sunflower edible-oil belt plus Lake Victoria cotton and fisheries. Irrigation and roads are the binding constraints." },
  { id: "northern", name: "Northern Corridor", short: "Northern", color: "#5B9BD5", regions: ["arusha", "kilimanjaro", "manyara", "tanga"], clusters: ["Arusha–Moshi", "Tanga"], leads: ["Horticulture", "Coffee", "Wheat", "Dairy", "Sisal"], note: "High-value horticulture and coffee with strong logistics to Mombasa and Dar es Salaam. Export-oriented." },
  { id: "mtwara", name: "Mtwara Corridor", short: "Mtwara", color: "#6FB1E0", regions: ["lindi", "mtwara"], clusters: ["Mtwara Development Corridor"], leads: ["Cashew", "Cassava", "Sesame", "Pulses"], note: "Cashew and sesame export belt; port-led corridor prioritising processing localisation and the southern-coast gas/agro-industry link." },
];

// Where the programme is currently operating (red pins on the map).
export const OPERATIONS = ["mbeya", "iringa", "morogoro", "pwani"];

export function corridorOf(regionId: string): Corridor | undefined {
  return CORRIDORS.find((c) => c.regions.includes(regionId));
}

export function corridorReadiness(c: Corridor): number {
  const scores = c.regions.map((id) => REGIONS.find((r) => r.id === id)?.ampScore ?? 0);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function corridorStatus(score: number): { label: string; color: string } {
  if (score >= 68) return { label: "Investment-ready", color: "#1EA84C" };
  if (score >= 62) return { label: "Developing", color: "#FCD116" };
  return { label: "Early stage", color: "#EF4444" };
}
