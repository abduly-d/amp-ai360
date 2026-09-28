# AMP AI360 — Tanzania Agriculture Master Plan & CAADP Executive Platform

A full-stack **Next.js 14 (App Router)** executive-intelligence application tracking Tanzania's
**Agriculture Master Plan (AMP 2050)** and its alignment with the **AU CAADP / Malabo Declaration**,
with an embedded **AI Executive Copilot** (RAG over the AMP 2050 & CAADP knowledge base).

Built with **TypeScript, Tailwind CSS, Shadcn-style UI, Recharts, Lucide Icons**, and optional
**Anthropic / OpenAI** integration.

## Quick start

```bash
npm install
npm run dev
```

Open the printed URL (defaults to http://localhost:3000; falls back to 3001 if busy).

The platform runs **fully offline** using deterministic local RAG over the indexed AMP 2050 & CAADP
document chunks. To enable higher-quality LLM-generated briefings, copy `.env.local.example` to
`.env.local` and add an `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`.

## What it delivers

### 9 executive views (tabbed) + always-available AI Copilot drawer
1. **Executive Overview** — KPI gauges (Ag GDP, exports, income, growth, undernourishment) with
   2022 baseline → 2030 target → 2050 vision, plus an auto-generated AI executive summary.
2. **Commodity Intelligence** — 20 priority commodities with production trends, farmgate price
   history and post-harvest losses.
3. **Regional Intelligence** — interactive SVG map of 26 regions (cropland, irrigation, stunting,
   AMP readiness score) with a ranked list.
4. **15 Flagship Tracker** — progress table with 🟢/🟡/🔴 status and cross-flagship dependency links.
5. **Vision 2030 & 2050** — Business-As-Usual vs Full AMP scenario charts.
6. **CAADP Alignment Matrix** — side-by-side AMP-vs-CAADP scorecard, alignment radar and
   compatibility badges (Exceeds / Aligned / Gap / Critical Gap).
7. **AI Commodity Forecast Engine** — price outlook, weather risk, trade signal and recommendation
   badges (BUY / STRENGTHEN RESERVES / EXPORT PUSH / …).
8. **Institutional Scorecard** — delivery & budget-execution matrix for MoA, MLF, TARI, TALIRI,
   TAFIRI, TMX, TADB, NFRA, ASA, SAGCOT, ATO.
9. **Executive Decision Room** — Red/Amber/Green daily alert console for the Minister's briefing.

### API layer (`/app/api`)
- `POST|GET /api/data/metrics` — priority fallback: **GOV_API (NBS/TMX/TRA) → Open Data
  (FAOSTAT 215 / World Bank `NV.AGR.TOTL.ZS` / WFP VAM) → AMP ground-truth vectors**. Reports the
  active source (drives the header ticker).
- `POST|GET /api/ai/search` — hybrid lexical search over AMP 2050 & CAADP document chunks.
- `POST|GET /api/ai/analyze` — RAG analysis with intent routing:
  - **Cross-flagship correlation** (e.g. Flagship 1 × Flagship 8)
  - **Target-path execution** (e.g. path to $6B exports by 2030)
  - **CAADP alignment mapping** (AMP vs Maputo/Malabo/Post-Malabo)
  - **General document RAG**
  Uses Anthropic/OpenAI when a key is present, otherwise the deterministic local engine.

## Project structure

```
app/
  layout.tsx  page.tsx  globals.css
  api/{data/metrics,ai/search,ai/analyze}/route.ts
components/
  header.tsx  ai-copilot-drawer.tsx  kpi-gauge.tsx
  ui/{card,badge,button,progress}.tsx
  views/{executive-overview,commodity-intelligence,regional-intelligence,
         flagship-tracker,vision-scenarios,caadp-alignment,forecast-engine,
         institutional-scorecard,decision-room}.tsx
lib/
  data/{amp-targets,commodities,regions,flagships,caadp,institutions,alerts,
        scenarios,forecast,knowledge-base}.ts
  ai/{retrieval,engine,types}.ts
  utils.ts
```

## Data provenance

All AMP figures use the AMP 2050 ground-truth baselines (Ag GDP $18B→$31.2B→$100B; growth
4.8%→10%; exports $1.2B→$6B→$20B; undernourishment 25%→15.1%→0% by 2042; poverty 26M→2M;
$5.5B public investment at a 3.5× benefit-cost ratio) and the CAADP Maputo/Malabo commitments
(≥10% budget, ≥6% growth, tripling intra-African trade, ending hunger/halving poverty, Post-Malabo
2026–2035 agenda). Open-data tiers reference FAOSTAT, the World Bank and WFP VAM.
