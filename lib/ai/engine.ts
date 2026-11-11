import { retrieve, citationsFor, RetrievedChunk } from "./retrieval";
import { AnalysisMode, AnalysisResult, AnalysisTable } from "./types";
import { FLAGSHIPS, Flagship, flagshipProgress } from "@/lib/data/flagships";
import { CAADP_MATRIX, CaadpMetric, VERDICT_META } from "@/lib/data/caadp";
import { AMP_KPIS, KpiTarget } from "@/lib/data/amp-targets";
import { completeWithChain, type ProviderName } from "./providers";

export interface AnalysisContext {
  /** When true, use the supplied records even if a list is empty. */
  preferLive?: boolean;
  flagships?: Flagship[];
  kpis?: KpiTarget[];
  caadp?: CaadpMetric[];
  liveFacts?: string;
}

function resolveFacts(ctx?: AnalysisContext) {
  if (!ctx?.preferLive) {
    return { flagships: FLAGSHIPS, kpis: AMP_KPIS, caadp: CAADP_MATRIX, liveFacts: ctx?.liveFacts ?? "" };
  }
  return {
    flagships: ctx.flagships ?? [],
    kpis: ctx.kpis ?? [],
    caadp: ctx.caadp ?? [],
    liveFacts: ctx.liveFacts ?? "",
  };
}

// --------------------------------------------------------------------------
// Intent detection
// --------------------------------------------------------------------------
export function detectMode(query: string): AnalysisMode {
  const q = query.toLowerCase();
  if (/(correlat|interdepend|impact|relationship|between flagship|link)/.test(q))
    return "correlation";
  if (/(caadp|malabo|maputo|biennial|post-malabo|au commitment)/.test(q))
    return "caadp-alignment";
  if (/(how to|what is needed|achieve|hit|reach|bridge|close the gap|path to|get to)/.test(q))
    return "target-path";
  return "general";
}

function findFlagships(query: string, flagships: Flagship[] = FLAGSHIPS): Flagship[] {
  const q = query.toLowerCase();
  const found: Flagship[] = [];
  // explicit "flagship N"
  const nums = Array.from(q.matchAll(/flagship\s*(\d{1,2})/g)).map((m) => Number(m[1]));
  for (const n of nums) {
    const f = flagships.find((x) => x.id === n);
    if (f && !found.includes(f)) found.push(f);
  }
  // name keywords
  for (const f of flagships) {
    const key = f.name.toLowerCase().split(/[\s&(]/)[0];
    if (key.length > 3 && q.includes(key) && !found.includes(f)) found.push(f);
  }
  return found;
}

// --------------------------------------------------------------------------
// Deterministic (local-RAG) analysis for each mode
// --------------------------------------------------------------------------
function correlationAnalysis(query: string, chunks: RetrievedChunk[], flagships: Flagship[] = FLAGSHIPS): AnalysisResult {
  let picks = findFlagships(query, flagships);
  if (!picks.length) {
    return {
      mode: "correlation",
      provider: "local-rag",
      query,
      summary: "No flagship records are available to correlate yet.",
      keyPoints: ["Add flagships in Manage data, then ask again."],
      citations: citationsFor(chunks),
    };
  }
  if (picks.length < 2) {
    // default to a canonical correlation example
    const extra = flagships.filter((f) => [1, 2, 8].includes(f.id));
    for (const e of extra) if (!picks.includes(e)) picks.push(e);
    picks = picks.slice(0, 3);
  }

  const rows: string[][] = [];
  for (const a of picks) {
    for (const b of picks) {
      if (a.id >= b.id) continue;
      const linked = a.linkedTo.includes(b.id) || b.linkedTo.includes(a.id);
      const strength = linked ? "Strong (direct dependency)" : "Indirect (systemic)";
      rows.push([
        `F${a.id} ${a.name}`,
        `F${b.id} ${b.name}`,
        strength,
        linked
          ? "Co-investment compounds returns; sequence together."
          : "Second-order linkage via shared value chain.",
      ]);
    }
  }

  const table: AnalysisTable = {
    title: "Cross-Flagship Interdependency Matrix",
    columns: ["Flagship A", "Flagship B", "Linkage", "Implication"],
    rows,
  };

  const names = picks.map((p) => `Flagship ${p.id} (${p.name})`).join(", ");
  const avgProg = Math.round(
    picks.reduce((s, p) => s + flagshipProgress(p), 0) / picks.length
  );

  return {
    mode: "correlation",
    provider: "local-rag",
    query,
    summary: `Correlation analysis across ${names}. These flagships form a reinforcing productivity cluster: irrigation and soil health raise the yield response to certified seed, while commercial/block farming and mechanization convert that productivity into marketable surplus feeding processing and exports. Current combined delivery is ~${avgProg}% of target, so under-investment in any one node caps the returns of the others.`,
    keyPoints: [
      `${picks[0].name} is a foundational enabler — its ${flagshipProgress(picks[0])}% progress gates downstream returns.`,
      "Directly linked flagships should be sequenced and financed together to capture compounding effects.",
      `Weakest node in the cluster: ${picks
        .slice()
        .sort((a, b) => flagshipProgress(a) - flagshipProgress(b))[0].name} — prioritise to unlock the system.`,
      "A 10% lift in the enabling flagship typically yields an outsized effect on smallholder income via higher, more stable yields.",
    ],
    tables: [table],
    recommendations: [
      `Co-fund ${picks.map((p) => `F${p.id}`).join(" + ")} in the same delivery window rather than sequentially.`,
      "Set shared KPIs (yield/ha, marketed surplus) so cross-flagship gains are attributable.",
      "Route agri-finance (F11) to the out-grower segment linking these flagships.",
    ],
    citations: citationsFor(chunks),
  };
}

function targetPathAnalysis(query: string, chunks: RetrievedChunk[], kpis: KpiTarget[] = AMP_KPIS, flagships: Flagship[] = FLAGSHIPS): AnalysisResult {
  const q = query.toLowerCase();
  // Try to match a KPI the user is asking about.
  let kpi = kpis.find((k) =>
    q.includes(k.label.toLowerCase().split(" ")[0])
  );
  if (/export/.test(q)) kpi = kpis.find((k) => k.id === "net-exports");
  if (/growth|4.8|10%/.test(q)) kpi = kpis.find((k) => k.id === "ag-growth");
  if (/gdp/.test(q)) kpi = kpi ?? kpis.find((k) => k.id === "ag-gdp");
  if (!kpi) kpi = kpis.find((k) => k.id === "ag-growth") ?? kpis[0];
  if (!kpi) {
    return {
      mode: "target-path",
      provider: "local-rag",
      query,
      summary: "No indicators are recorded yet, so there is no target path to chart.",
      keyPoints: ["Add an indicator and at least one actual in Manage data."],
      citations: citationsFor(chunks),
    };
  }

  const gapTable: AnalysisTable = {
    title: `Gap-to-Target: ${kpi.label}`,
    columns: ["Milestone", "Value"],
    rows: [
      [`Baseline (${kpi.baselineYear})`, kpi.baselineLabel],
      ["Current", kpi.currentLabel ?? "—"],
      ["2030 Target", kpi.target2030Label],
      ["2050 Vision", kpi.target2050Label],
    ],
  };

  const enablers = flagships.filter((f) =>
    [1, 2, 3, 8, 9, 10, 11].includes(f.id)
  ).map((f) => `F${f.id} ${f.name} (${flagshipProgress(f)}%)`);

  return {
    mode: "target-path",
    provider: "local-rag",
    query,
    summary: `To move ${kpi.label} from ${kpi.currentLabel ?? kpi.baselineLabel} to the 2030 target of ${kpi.target2030Label}, AMP relies on a coordinated push across its productivity, processing and market-access flagships, backed by closing the public-investment gap (USD 5.5B, 2024–2030) and crowding in private capital at a 3.5x benefit-cost ratio.`,
    keyPoints: [
      `The binding constraint is execution and financing, not ambition — the target already exceeds the CAADP floor.`,
      `Lead enablers: ${enablers.slice(0, 4).join("; ")}.`,
      "Raise the agriculture budget share from ~5.9% toward the 10% Maputo commitment to fund the trajectory.",
      "De-risk private investment via TADB credit lines and index insurance (Flagship 11).",
    ],
    tables: [gapTable],
    recommendations: [
      "Sequence irrigation + seed + soil health to lift yields, then processing + trade to convert surplus to value.",
      "Fast-track shovel-ready commercial farming blocks (SAGCOT) to accelerate volume.",
      "Table a phased budget ramp to Cabinet targeting 8% next cycle, 10% by 2030.",
      "Stand up quarterly delivery reviews with flagship-level KPIs feeding the CAADP Biennial Review.",
    ],
    citations: citationsFor(chunks),
  };
}

function caadpAnalysis(query: string, chunks: RetrievedChunk[], matrix: CaadpMetric[] = CAADP_MATRIX): AnalysisResult {
  if (!matrix.length) {
    return {
      mode: "caadp-alignment",
      provider: "local-rag",
      query,
      summary: "No CAADP alignment items are recorded yet.",
      keyPoints: ["Add alignment items in Manage data to compare AMP with Malabo."],
      citations: citationsFor(chunks),
    };
  }
  const rows = matrix.map((m) => [
    m.dimension,
    m.caadpValueLabel,
    m.ampValueLabel,
    `${VERDICT_META[m.verdict].label} — ${m.badge}`,
  ]);
  const table: AnalysisTable = {
    title: "AMP 2050 vs CAADP / Malabo Alignment",
    columns: ["Dimension", "CAADP Commitment", "AMP Position", "Verdict"],
    rows,
  };

  const gaps = matrix.filter(
    (m) => m.verdict === "gap" || m.verdict === "critical-gap"
  );

  return {
    mode: "caadp-alignment",
    provider: "local-rag",
    query,
    summary:
      "AMP 2050 is broadly aligned with, and in several dimensions exceeds, the CAADP Maputo/Malabo commitments. AMP's 10% growth and 5x export ambitions surpass the ≥6% growth and trade-tripling commitments, and its climate flagship already beats the 30% resilience target. The principal compliance gap is the agriculture budget share (~5.9% vs the ≥10% Maputo commitment), followed by hardening M&E for the Biennial Review.",
    keyPoints: [
      "Exceeds CAADP on growth ambition (10% vs 6%) and is pre-positioned for the Post-Malabo 2026–2035 agenda.",
      "Aligned on trade, poverty and hunger — though AMP's hunger-eradication horizon (2042) extends beyond Malabo's 2025 deadline.",
      `Critical gap: budget allocation at ~5.9% against the ≥10% Maputo commitment.`,
      "Process gap: Biennial Review reporting needs stronger national M&E systems.",
    ],
    tables: [table],
    recommendations: gaps.map((g) => `${g.dimension}: ${g.badge} — ${g.commentary}`),
    citations: citationsFor(chunks),
  };
}

function generalAnalysis(query: string, chunks: RetrievedChunk[], liveFacts = ""): AnalysisResult {
  const top = chunks[0];
  const summary = top
    ? `${top.text}${liveFacts ? `\n\nWorking figures: ${liveFacts.split("\n").slice(2, 6).join(" ")}` : ""}`
    : "No matching AMP 2050 or CAADP section was found for that query. Try referencing a specific flagship, KPI, commodity, or CAADP commitment.";
  return {
    mode: "general",
    provider: "local-rag",
    query,
    summary,
    keyPoints: chunks.slice(0, 4).map((c) => `${c.title}: ${c.text.slice(0, 160)}…`),
    citations: citationsFor(chunks),
  };
}

export function localAnalyze(query: string, ctx?: AnalysisContext): AnalysisResult {
  const mode = detectMode(query);
  const chunks = retrieve(query, 4);
  const facts = resolveFacts(ctx);
  switch (mode) {
    case "correlation":
      return correlationAnalysis(query, chunks, facts.flagships);
    case "target-path":
      return targetPathAnalysis(query, chunks, facts.kpis, facts.flagships);
    case "caadp-alignment":
      return caadpAnalysis(query, chunks, facts.caadp);
    default:
      return generalAnalysis(query, chunks, facts.liveFacts);
  }
}

// --------------------------------------------------------------------------
// Optional LLM enhancement (Anthropic or OpenAI). Falls back silently.
// --------------------------------------------------------------------------
export function buildContext(query: string, liveFacts = ""): string {
  const chunks = retrieve(query, 5);
  const documents = chunks
    .map((c) => `[${c.source} · ${c.section}] ${c.title}\n${c.text}`)
    .join("\n\n");
  return [documents, liveFacts].filter(Boolean).join("\n\n");
}

const DEFAULT_SYSTEM_PROMPT = `You are the AMP AI360 Executive Copilot for Tanzania's Agriculture Master Plan (AMP 2050) and CAADP/Malabo alignment. Answer as a concise, decision-ready briefing for a Minister or executive. Ground every claim in the provided context. Prefer specific figures. When relevant, cover: cross-flagship correlations, actionable target-execution paths, and CAADP alignment. Always end with 2-4 concrete recommendations.`;

// To make the in-dashboard assistant answer like the "Tanzania AMP2050" custom
// GPT, paste that GPT's Instructions into AMP_GPT_INSTRUCTIONS in .env.local
// (and set OPENAI_API_KEY). The assistant then calls OpenAI with the same persona.
function systemPrompt(): string {
  return process.env.AMP_GPT_INSTRUCTIONS?.trim() || DEFAULT_SYSTEM_PROMPT;
}

export async function llmAnalyze(query: string, ctx?: AnalysisContext): Promise<AnalysisResult | null> {
  const facts = resolveFacts(ctx);
  const context = buildContext(query, facts.liveFacts);
  const chunks = retrieve(query, 5);
  const mode = detectMode(query);
  const userMsg = `Executive question:\n${query}\n\nGrounding context (AMP 2050 & CAADP knowledge base, plus the live working dataset):\n${context}\n\nRespond with: (1) a 3-4 sentence executive summary, (2) 3-5 key points as bullet lines prefixed with "- ", (3) 2-4 recommendations prefixed with "REC: ". Prefer the live working figures when they differ from the document text.`;

  try {
    const done = await completeWithChain({ system: systemPrompt(), user: userMsg });
    if (!done) return null;
    return parseLlmText(done.text, query, mode, chunks, done.provider);
  } catch {
    return null;
  }
}

function parseLlmText(
  text: string,
  query: string,
  mode: AnalysisMode,
  chunks: RetrievedChunk[],
  provider: ProviderName
): AnalysisResult {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const keyPoints: string[] = [];
  const recommendations: string[] = [];
  const summaryLines: string[] = [];
  for (const line of lines) {
    if (/^(chat request processed successfully|request processed successfully)\.?$/i.test(line)) continue;
    if (/^rec[:\-]/i.test(line)) recommendations.push(line.replace(/^rec[:\-]\s*/i, ""));
    else if (/^[-*•]/.test(line)) keyPoints.push(line.replace(/^[-*•]\s*/, ""));
    else summaryLines.push(line);
  }
  // Blend deterministic tables in for structure.
  const local = localAnalyze(query);
  return {
    mode,
    provider,
    query,
    summary: summaryLines.join(" ") || local.summary,
    keyPoints: keyPoints.length ? keyPoints : local.keyPoints,
    tables: local.tables,
    recommendations: recommendations.length ? recommendations : local.recommendations,
    citations: citationsFor(chunks),
  };
}
