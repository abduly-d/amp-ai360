// Institutional scorecard — key ministries & agencies delivering AMP.

export interface Institution {
  id: string;
  acronym: string;
  name: string;
  mandate: string;
  deliveryScore: number; // 0-100
  budgetExecutionPct: number;
  linkedFlagships: number[];
  status: "on-track" | "at-risk" | "critical";
}

export const INSTITUTIONS: Institution[] = [
  { id: "moa", acronym: "MoA", name: "Ministry of Agriculture", mandate: "Overall AMP stewardship, crops, irrigation, extension", deliveryScore: 68, budgetExecutionPct: 74, linkedFlagships: [1, 2, 3, 4, 5, 7], status: "at-risk" },
  { id: "mlf", acronym: "MLF", name: "Ministry of Livestock & Fisheries", mandate: "Livestock, fisheries and aquaculture productivity", deliveryScore: 61, budgetExecutionPct: 66, linkedFlagships: [14], status: "at-risk" },
  { id: "tari", acronym: "TARI", name: "Tanzania Agricultural Research Institute", mandate: "Crop research, seed systems, soil health science", deliveryScore: 72, budgetExecutionPct: 70, linkedFlagships: [2, 3], status: "on-track" },
  { id: "taliri", acronym: "TALIRI", name: "Tanzania Livestock Research Institute", mandate: "Livestock breeds, fodder and animal health research", deliveryScore: 58, budgetExecutionPct: 60, linkedFlagships: [14], status: "at-risk" },
  { id: "tafiri", acronym: "TAFIRI", name: "Tanzania Fisheries Research Institute", mandate: "Fisheries and aquaculture research and stock assessment", deliveryScore: 55, budgetExecutionPct: 58, linkedFlagships: [14], status: "at-risk" },
  { id: "tmx", acronym: "TMX", name: "Tanzania Mercantile Exchange", mandate: "Structured commodity markets and price discovery", deliveryScore: 64, budgetExecutionPct: 69, linkedFlagships: [10], status: "at-risk" },
  { id: "tadb", acronym: "TADB", name: "Tanzania Agricultural Development Bank", mandate: "Agri-finance, wholesale lending, de-risking", deliveryScore: 66, budgetExecutionPct: 72, linkedFlagships: [11], status: "at-risk" },
  { id: "nfra", acronym: "NFRA", name: "National Food Reserve Agency", mandate: "Strategic grain reserves and food security buffer", deliveryScore: 49, budgetExecutionPct: 55, linkedFlagships: [6], status: "critical" },
  { id: "asa", acronym: "ASA", name: "Agricultural Seed Agency", mandate: "Foundation & certified seed multiplication", deliveryScore: 62, budgetExecutionPct: 64, linkedFlagships: [2], status: "at-risk" },
  { id: "sagcot", acronym: "SAGCOT", name: "Southern Agricultural Growth Corridor", mandate: "Commercial farming clusters and out-grower schemes", deliveryScore: 70, budgetExecutionPct: 71, linkedFlagships: [8], status: "on-track" },
  { id: "ato", acronym: "ATO", name: "Agricultural Transformation Office", mandate: "AMP delivery coordination, M&E and CAADP alignment", deliveryScore: 73, budgetExecutionPct: 76, linkedFlagships: [4, 10, 12, 15], status: "on-track" },
  { id: "nirc", acronym: "NIRC", name: "National Irrigation Commission", mandate: "Irrigation scheme development toward 1.2M ha", deliveryScore: 60, budgetExecutionPct: 63, linkedFlagships: [1], status: "at-risk" },
  { id: "copra", acronym: "COPRA", name: "Cereals & Other Produce Regulatory Authority", mandate: "Warehouse-receipt trade, cooperative-union sales, market bulletins", deliveryScore: 67, budgetExecutionPct: 70, linkedFlagships: [6, 10], status: "at-risk" },
  { id: "wrrb", acronym: "WRRB", name: "Warehouse Receipt Regulatory Board", mandate: "Warehouse receipt system licensing & oversight", deliveryScore: 63, budgetExecutionPct: 66, linkedFlagships: [7, 10], status: "at-risk" },
  { id: "tphpa", acronym: "TPHPA", name: "Tanzania Plant Health & Pesticides Authority", mandate: "Phytosanitary control, pesticides & plant health", deliveryScore: 65, budgetExecutionPct: 68, linkedFlagships: [2, 7], status: "at-risk" },
  { id: "tosci", acronym: "TOSCI", name: "Tanzania Official Seed Certification Institute", mandate: "Seed certification and quality assurance", deliveryScore: 64, budgetExecutionPct: 67, linkedFlagships: [2], status: "at-risk" },
  { id: "tfra", acronym: "TFRA", name: "Tanzania Fertilizer Regulatory Authority", mandate: "Fertilizer quality, bulk procurement & blending", deliveryScore: 61, budgetExecutionPct: 64, linkedFlagships: [3], status: "at-risk" },
  { id: "tcb", acronym: "TCB", name: "Tanzania Coffee Board", mandate: "Coffee regulation, auctions and export promotion", deliveryScore: 66, budgetExecutionPct: 69, linkedFlagships: [9, 10], status: "at-risk" },
  { id: "cbt", acronym: "CBT", name: "Cashewnut Board of Tanzania", mandate: "Cashew regulation, WRS auctions and processing", deliveryScore: 69, budgetExecutionPct: 71, linkedFlagships: [9, 10], status: "on-track" },
  { id: "tcob", acronym: "TCoB", name: "Tanzania Cotton Board", mandate: "Cotton regulation, contract farming and ginning linkage", deliveryScore: 52, budgetExecutionPct: 57, linkedFlagships: [8, 10], status: "critical" },
  { id: "tsb", acronym: "TSB", name: "Sugar Board of Tanzania", mandate: "Sugar regulation, out-grower schemes & import controls", deliveryScore: 60, budgetExecutionPct: 63, linkedFlagships: [8, 9], status: "at-risk" },
  { id: "tmb", acronym: "TMB", name: "Tanzania Meat Board", mandate: "Red-meat value chain, abattoirs and export standards", deliveryScore: 57, budgetExecutionPct: 60, linkedFlagships: [14], status: "at-risk" },
  { id: "tdb", acronym: "TDB", name: "Tanzania Dairy Board", mandate: "Dairy regulation, cold chain and milk-market development", deliveryScore: 58, budgetExecutionPct: 61, linkedFlagships: [14], status: "at-risk" },
  { id: "tvla", acronym: "TVLA", name: "Tanzania Veterinary Laboratory Agency", mandate: "Animal-health diagnostics, vaccines and disease control", deliveryScore: 59, budgetExecutionPct: 62, linkedFlagships: [14], status: "at-risk" },
  { id: "tantrade", acronym: "TanTrade", name: "Tanzania Trade Development Authority", mandate: "Trade promotion, market access and AfCFTA linkage", deliveryScore: 63, budgetExecutionPct: 66, linkedFlagships: [10], status: "at-risk" },
  { id: "taha", acronym: "TAHA", name: "Tanzania Horticultural Association", mandate: "Horticulture value chain, cold chain & export logistics", deliveryScore: 71, budgetExecutionPct: 70, linkedFlagships: [9, 10], status: "on-track" },
  { id: "agitf", acronym: "AGITF", name: "Agricultural Inputs Trust Fund", mandate: "Concessional finance for inputs and mechanization", deliveryScore: 56, budgetExecutionPct: 59, linkedFlagships: [5, 11], status: "at-risk" },
  { id: "tcdc", acronym: "TCDC", name: "Tanzania Cooperative Development Commission", mandate: "Cooperative unions (AMCOS) governance and strengthening", deliveryScore: 60, budgetExecutionPct: 62, linkedFlagships: [4, 10], status: "at-risk" },
];
