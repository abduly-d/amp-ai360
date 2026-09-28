// Indexed document chunks for the RAG pipeline.
// Covers the AMP 2050 Master Plan and the CAADP / Malabo Strategy Framework.
// Each chunk is a retrievable "section" with a citation handle.

export interface DocChunk {
  id: string;
  source: "AMP_2050" | "CAADP_MALABO";
  section: string;
  title: string;
  text: string;
  tags: string[];
}

export const KNOWLEDGE_BASE: DocChunk[] = [
  {
    id: "amp-vision",
    source: "AMP_2050",
    section: "§1 Vision & Ambition",
    title: "AMP 2050 Vision",
    text: "The Agriculture Master Plan (AMP) sets Tanzania on a path to grow agricultural GDP from USD 18B (2022) to USD 31.2B by 2030 and USD 100B (~TZS 280 trillion) by 2050. The plan targets 10% annual sector growth, net agricultural exports of USD 6B by 2030 and USD 20B by 2050, and the eradication of undernourishment by 2042.",
    tags: ["gdp", "vision", "growth", "exports", "2030", "2050"],
  },
  {
    id: "amp-investment",
    source: "AMP_2050",
    section: "§2 Investment Case",
    title: "Public Investment & Benefit-Cost",
    text: "AMP requires USD 5.5B of public investment over 2024–2030, which is modelled to unlock approximately USD 20B of overall GDP growth — a benefit-cost ratio of 3.5. Crowding in private capital through commercial farming blocks, agri-finance and de-risking instruments is central to the financing strategy.",
    tags: ["investment", "financing", "benefit-cost", "5.5b", "20b", "roi"],
  },
  {
    id: "amp-income-poverty",
    source: "AMP_2050",
    section: "§3 Incomes, Poverty & Nutrition",
    title: "Household Income, Poverty and Undernourishment",
    text: "Per-capita farm household income rises from USD 651 (2022) to over USD 810 (~TZS 4.0M) by 2030 and over USD 1,450 (~TZS 6.2M) by 2050. Poverty headcount falls from 26M to 21.7M by 2030 and to 2M by 2050. Undernourishment declines from 25% to 15.1% by 2030 and is eradicated by 2042.",
    tags: ["income", "poverty", "hunger", "nutrition", "undernourishment", "livelihoods"],
  },
  {
    id: "amp-flagship-irrigation",
    source: "AMP_2050",
    section: "§4 Flagship 1 — Irrigation",
    title: "Irrigation Expansion (Flagship 1)",
    text: "Flagship 1 expands irrigated area to 1.2M hectares, enabling multi-season, climate-resilient production. Irrigation is a foundational enabler: it raises the returns to certified seed (Flagship 2), soil health investments (Flagship 3), mechanization (Flagship 5) and commercial block farming (Flagship 8), and stabilises smallholder incomes against rainfall variability.",
    tags: ["irrigation", "flagship 1", "1.2m ha", "water", "climate", "correlation"],
  },
  {
    id: "amp-flagship-seed",
    source: "AMP_2050",
    section: "§4 Flagship 2 — Seed",
    title: "Seed Production Quintupling (Flagship 2)",
    text: "Flagship 2 quintuples certified seed production through ASA and TARI. Improved seed delivers the largest yield response when paired with irrigation (Flagship 1), balanced soil fertility (Flagship 3) and effective extension (Flagship 4). Seed is the primary multiplier on productivity across the 20 priority commodities.",
    tags: ["seed", "flagship 2", "yield", "productivity", "asa", "tari", "correlation"],
  },
  {
    id: "amp-flagship-soil",
    source: "AMP_2050",
    section: "§4 Flagship 3 — Soil Health",
    title: "Soil Health & Fertilizer (Flagship 3)",
    text: "Flagship 3 restores soil health on 3M hectares and rationalises fertilizer blending and use. Soil health compounds the returns from seed and irrigation and is a precondition for sustained yield gains in commercial farming blocks.",
    tags: ["soil", "fertilizer", "flagship 3", "3m ha", "productivity"],
  },
  {
    id: "amp-flagship-commercial",
    source: "AMP_2050",
    section: "§4 Flagship 8 — Commercial Farming",
    title: "Commercial & Block Farming (Flagship 8)",
    text: "Flagship 8 develops commercial farming blocks and out-grower schemes (anchored by SAGCOT) to crowd in private investment. Its productivity depends on irrigation (Flagship 1), soil health (Flagship 3) and mechanization (Flagship 5); its output feeds agro-processing (Flagship 9) and exports (Flagship 10).",
    tags: ["commercial", "block farming", "flagship 8", "sagcot", "investment", "correlation"],
  },
  {
    id: "amp-flagship-processing",
    source: "AMP_2050",
    section: "§4 Flagship 9 — Agro-Processing",
    title: "Agro-Processing & Value Addition (Flagship 9)",
    text: "Flagship 9 quintuples agro-processing value, moving Tanzania up the value chain toward agro-industrialization. It is the bridge between raw production and the USD 6B export target (Flagship 10) and is central to the Post-Malabo agenda.",
    tags: ["processing", "value addition", "flagship 9", "agro-industrialization", "exports"],
  },
  {
    id: "amp-flagship-trade",
    source: "AMP_2050",
    section: "§4 Flagship 10 — Markets & Trade",
    title: "Market Access & Trade (Flagship 10)",
    text: "Flagship 10 grows structured markets (via TMX) and net exports to USD 6B by 2030 and USD 20B by 2050. Reaching USD 6B requires processing capacity (Flagship 9), commercial volumes (Flagship 8) and trade-facilitation reforms, with AfCFTA as a demand accelerator.",
    tags: ["trade", "exports", "flagship 10", "6b", "tmx", "afcfta", "market access"],
  },
  {
    id: "amp-nfra",
    source: "AMP_2050",
    section: "§4 Flagship 6 — Food Reserves",
    title: "NFRA Strategic Reserves (Flagship 6)",
    text: "Flagship 6 expands the National Food Reserve Agency buffer to 3M tons for price stabilisation and food security. Adequate reserves reduce consumer price volatility and underpin the Zero Hunger commitment.",
    tags: ["nfra", "reserves", "flagship 6", "3m tons", "food security"],
  },
  {
    id: "caadp-maputo",
    source: "CAADP_MALABO",
    section: "CAADP §1 Maputo Commitment",
    title: "Maputo 10% Budget Commitment",
    text: "The 2003 Maputo Declaration and the 2014 Malabo Declaration commit African Union member states to allocate at least 10% of total national budget expenditure to agriculture and rural development. Tanzania currently allocates about 5.9%, leaving a compliance gap that must be closed to sustain 6% agricultural GDP growth.",
    tags: ["maputo", "10%", "budget", "caadp", "malabo", "compliance", "gap"],
  },
  {
    id: "caadp-growth",
    source: "CAADP_MALABO",
    section: "CAADP §2 Growth Commitment",
    title: "6% Agricultural GDP Growth",
    text: "Malabo commits member states to sustain at least 6% annual agricultural GDP growth. Tanzania's AMP goes further, targeting 10% by 2030, but current performance of 4.8% remains below the CAADP threshold — an execution gap rather than an ambition gap.",
    tags: ["growth", "6%", "malabo", "caadp", "gdp", "10%"],
  },
  {
    id: "caadp-trade",
    source: "CAADP_MALABO",
    section: "CAADP §3 Trade Commitment",
    title: "Tripling Intra-African Trade",
    text: "Malabo commits to tripling intra-African trade in agricultural commodities and services by 2025. AMP's export targets (USD 6B by 2030, USD 20B by 2050) and AfCFTA participation align Tanzania with this commitment, though the intra-African share should be reported explicitly.",
    tags: ["trade", "intra-african", "triple", "malabo", "afcfta", "exports"],
  },
  {
    id: "caadp-hunger",
    source: "CAADP_MALABO",
    section: "CAADP §4 Hunger & Poverty",
    title: "Ending Hunger and Halving Poverty",
    text: "Malabo commits to ending hunger by 2025 and halving poverty through agriculture by 2025. AMP embraces Zero Hunger and deep poverty reduction but on a 2042/2050 horizon, representing a financed and credible — if later — trajectory.",
    tags: ["hunger", "poverty", "malabo", "zero hunger", "2025", "caadp"],
  },
  {
    id: "caadp-br",
    source: "CAADP_MALABO",
    section: "CAADP §5 Mutual Accountability",
    title: "Biennial Review & Scorecards",
    text: "CAADP operates a Biennial Review (BR) mechanism producing country scorecards on progress against Malabo commitments. Strong national M&E systems are required to report reliably; AMP's institutional scorecard and M&E framework must be hardened to feed the BR.",
    tags: ["biennial review", "scorecard", "accountability", "m&e", "caadp", "reporting"],
  },
  {
    id: "caadp-post-malabo",
    source: "CAADP_MALABO",
    section: "CAADP §6 Post-Malabo Agenda",
    title: "Post-Malabo / Kampala Strategy 2026–2035",
    text: "The Post-Malabo (Kampala) CAADP Strategy 2026–2035 prioritises sustainable food production, agro-industrialization, climate resilience, and inclusive livelihoods for women and youth. AMP's Flagships 9 (processing), 13 (youth & women), 14 (livestock & fisheries) and 15 (climate) pre-position Tanzania for this agenda.",
    tags: ["post-malabo", "kampala", "2026", "2035", "agro-industrialization", "climate", "youth", "women", "inclusion"],
  },
  {
    id: "fin-overview",
    source: "AMP_2050",
    section: "§5 Financing & Partnerships",
    title: "Investment Tracking Overview",
    text: "The AMP 2050 Financing & Partnership Mapping tracks 22 investments with a total initiative cost of USD 176.7M, of which USD 64.3M (36%) is secured, leaving a funding gap of USD 112.4M. 13 investments are in progress, 6 planned and 3 completed. Grants dominate the financing instruments.",
    tags: ["financing", "investment", "funding gap", "176.7m", "64.3m", "112.4m", "partnerships", "money", "budget"],
  },
  {
    id: "fin-sources",
    source: "AMP_2050",
    section: "§5 Financing by Source",
    title: "Financing by Source: Public, Private, DPs, Non-Government",
    text: "By financing source, Development Partners (DPs) lead with USD 140.3M across 13 investments (79% of tracked cost, 31% secured); Non-Government USD 15.2M across 4; Private investment USD 14.0M across 3; and Public investment USD 7.2M across 2. DP flows are trackable against the OECD CRS aid database. Reducing dependence on DPs and crowding in private and public capital is the central financing challenge.",
    tags: ["dps", "development partners", "private", "public", "non-government", "oecd", "funders", "140.3m", "source"],
  },
  {
    id: "fin-flagship",
    source: "AMP_2050",
    section: "§5 Financing by Flagship",
    title: "Flagship Funding Gaps",
    text: "Against the AMP macro targets, the largest tracked flagship gaps are Flagship 8 Commercial Value Chains (USD 27.2M gap), Flagship 9 Agro-Processing (USD 23.1M), Flagship 5 Livestock (USD 21.7M), Flagship 1 Irrigation (USD 16.2M) and Flagship 10 Export (USD 10.1M). Flagships 3, 7, 11, 13, 14 and 15 currently have no tracked financing. Key funders include the World Bank, AfDB, IFAD, EU, FCDO, IFC, TADB, CRDB Bank, AGRA, Gates Foundation and WorldFish.",
    tags: ["flagship", "funding", "gap", "world bank", "afdb", "tadb", "agra", "gates", "funders", "commercial", "processing"],
  },
];
