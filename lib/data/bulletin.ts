// MoA Weekly Market Bulletin — real data.
// Source: Ministry of Agriculture, Agricultural Marketing Section,
// Weekly Market Bulletin 10–14 August 2026 (kilimo.go.tz).
// WRS season sales via COPRA; horticulture via TAHA.

export interface NationalPrice {
  crop: string;
  emoji: string;
  price: number; // TZS/kg, national weekly average wholesale (current week)
  prev: number; // previous week
  chg: number; // % week-on-week
}

export interface SeasonSale {
  name: string;
  emoji: string;
  kg: number;
  valueTzs: number;
  avg: number; // TZS/kg
  source: string;
}

export const BULLETIN = {
  week: "10–14 August 2026",
  prevWeek: "03–07 August 2026",
  updated: "2026-08-14",
  source: "Ministry of Agriculture — Agricultural Marketing Section (kilimo.go.tz)",
  sourceUrl: "https://www.kilimo.go.tz",
  national: [
    { crop: "Maize", emoji: "🌽", price: 600, prev: 600, chg: 0.0 },
    { crop: "Rice", emoji: "🌾", price: 2100, prev: 2000, chg: 5.0 },
    { crop: "Beans", emoji: "🫘", price: 2000, prev: 1900, chg: 5.3 },
    { crop: "Sorghum", emoji: "🌾", price: 1300, prev: 1300, chg: 0.0 },
    { crop: "Bulrush millet", emoji: "🌾", price: 1500, prev: 1500, chg: 0.0 },
    { crop: "Finger millet", emoji: "🌾", price: 1900, prev: 1800, chg: 5.6 },
    { crop: "Round potato", emoji: "🥔", price: 1100, prev: 1100, chg: 0.0 },
  ] as NationalPrice[],
  season: [
    { name: "Sesame", emoji: "🌰", kg: 27629485, valueTzs: 79059231951, avg: 2400, source: "COPRA" },
    { name: "Cocoa", emoji: "🍫", kg: 2722650, valueTzs: 36916032657, avg: 12900, source: "COPRA" },
    { name: "Pigeon peas", emoji: "🫛", kg: 11659788, valueTzs: 19364313611, avg: 1470, source: "COPRA" },
    { name: "Lentil", emoji: "🫘", kg: 3544018, valueTzs: 5534783758, avg: 1345, source: "COPRA" },
    { name: "Green gram", emoji: "🌱", kg: 1436625, valueTzs: 2292295141, avg: 1400, source: "COPRA" },
    { name: "Soybean", emoji: "🫘", kg: 326063, valueTzs: 498214719, avg: 1272, source: "COPRA" },
  ] as SeasonSale[],
};

export function chgLabel(v: number): string {
  return v > 0 ? `▲ +${v}%` : v < 0 ? `▼ ${v}%` : "► 0.0%";
}
