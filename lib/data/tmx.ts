// Tanzania Mercantile Exchange (TMX) — commodity market board.
//
// TMX disseminates market data through its OTS (Online Trading System) and
// published trade-result / price-statistics bulletins; it does NOT expose a
// public, key-free REST API. This module therefore provides:
//   1. A typed board structure that mirrors a real TMX market report.
//   2. Indicative session data (clearly labelled) so the platform is usable now.
// When a real TMX feed is available, set TMX_API_BASE_URL / TMX_API_KEY and the
// /api/data/tmx route will use it in place of this indicative board.
//
// TMX trades warehouse-receipt-system (WRS) commodities: cashew, coffee, sesame,
// rice, sunflower, maize, pigeon peas, green gram, soya beans, cocoa, chickpeas.

export type TradePressure = "Buyers" | "Sellers" | "Balanced";

export interface TmxQuote {
  commodityId?: string; // links to COMMODITIES where a match exists
  symbol: string;
  name: string;
  emoji: string;
  warehouse: string; // TMX delivery centre / auction location
  priceTzs: number; // last session price, TZS per kg
  changePct: number; // vs previous session
  bidTzs: number;
  offerTzs: number;
  volumeTons: number; // volume traded this session
  trades: number; // number of executed trades / lots
  pressure: TradePressure; // net order-book behaviour
}

export const TMX_META = {
  exchange: "Tanzania Mercantile Exchange (TMX)",
  system: "OTS (Online Trading System)",
  mechanism: "Warehouse Receipt System auctions",
  note: "Indicative board — structured to match TMX trade-result bulletins. Connect a live TMX feed via TMX_API_BASE_URL.",
};

// Indicative session (structure matches TMX bulletins; values are illustrative).
export const TMX_BOARD: TmxQuote[] = [
  { commodityId: "cashew", symbol: "CASH-RAW", name: "Cashew (raw)", emoji: "🥜", warehouse: "Mtwara", priceTzs: 2850, changePct: 1.8, bidTzs: 2820, offerTzs: 2880, volumeTons: 1240, trades: 38, pressure: "Buyers" },
  { commodityId: "coffee", symbol: "COFF-PB", name: "Coffee (parchment)", emoji: "☕", warehouse: "Mbeya", priceTzs: 4650, changePct: 0.9, bidTzs: 4600, offerTzs: 4700, volumeTons: 320, trades: 21, pressure: "Buyers" },
  { commodityId: "sesame", symbol: "SESA", name: "Sesame (simsim)", emoji: "🌰", warehouse: "Dodoma", priceTzs: 3120, changePct: -1.1, bidTzs: 3080, offerTzs: 3160, volumeTons: 540, trades: 26, pressure: "Sellers" },
  { commodityId: "rice", symbol: "PADDY", name: "Rice (paddy)", emoji: "🌾", warehouse: "Mbeya", priceTzs: 1010, changePct: 0.6, bidTzs: 995, offerTzs: 1025, volumeTons: 880, trades: 33, pressure: "Balanced" },
  { commodityId: "sunflower", symbol: "SUNF", name: "Sunflower seed", emoji: "🌻", warehouse: "Singida", priceTzs: 980, changePct: 2.4, bidTzs: 960, offerTzs: 1000, volumeTons: 720, trades: 29, pressure: "Buyers" },
  { commodityId: "maize", symbol: "MAIZE", name: "Maize (grain)", emoji: "🌽", warehouse: "Njombe", priceTzs: 585, changePct: 3.1, bidTzs: 570, offerTzs: 600, volumeTons: 2100, trades: 47, pressure: "Buyers" },
  { commodityId: "pulses", symbol: "PIGP", name: "Pigeon peas", emoji: "🫛", warehouse: "Babati", priceTzs: 1980, changePct: -0.8, bidTzs: 1950, offerTzs: 2010, volumeTons: 610, trades: 24, pressure: "Sellers" },
  { commodityId: "pulses", symbol: "GRGM", name: "Green gram", emoji: "🌱", warehouse: "Singida", priceTzs: 2560, changePct: 1.2, bidTzs: 2520, offerTzs: 2600, volumeTons: 430, trades: 19, pressure: "Balanced" },
  { commodityId: "soybeans", symbol: "SOYA", name: "Soya beans", emoji: "🫘", warehouse: "Ruvuma", priceTzs: 1360, changePct: 0.4, bidTzs: 1340, offerTzs: 1380, volumeTons: 290, trades: 15, pressure: "Balanced" },
  { symbol: "COCO", name: "Cocoa", emoji: "🍫", warehouse: "Kyela", priceTzs: 7200, changePct: 4.6, bidTzs: 7100, offerTzs: 7300, volumeTons: 95, trades: 11, pressure: "Buyers" },
  { symbol: "CHKP", name: "Chickpeas", emoji: "🫛", warehouse: "Arusha", priceTzs: 2140, changePct: -1.4, bidTzs: 2110, offerTzs: 2180, volumeTons: 260, trades: 14, pressure: "Sellers" },
];

export const PRESSURE_META: Record<TradePressure, { label: string; color: string }> = {
  Buyers: { label: "Buyer-led", color: "#1EA84C" },
  Sellers: { label: "Seller-led", color: "#EF4444" },
  Balanced: { label: "Balanced", color: "#64748B" },
};

export function tmxTotals(board: TmxQuote[]) {
  return {
    volumeTons: board.reduce((s, q) => s + q.volumeTons, 0),
    trades: board.reduce((s, q) => s + q.trades, 0),
    gainers: board.filter((q) => q.changePct > 0).length,
    losers: board.filter((q) => q.changePct < 0).length,
  };
}
