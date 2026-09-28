import { KNOWLEDGE_BASE, DocChunk } from "@/lib/data/knowledge-base";

export interface RetrievedChunk extends DocChunk {
  score: number;
}

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
  "how", "what", "does", "do", "with", "by", "at", "from", "as", "that", "this",
  "it", "be", "can", "will", "we", "i", "you", "our", "their", "between", "into",
  "about", "impact", "affect", "vs",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9%$.\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

// Lightweight lexical retriever over the indexed AMP + CAADP document chunks.
export function retrieve(query: string, k = 4): RetrievedChunk[] {
  const qTokens = tokenize(query);
  const qSet = new Set(qTokens);

  const scored = KNOWLEDGE_BASE.map((chunk) => {
    const haystack = tokenize(chunk.text + " " + chunk.title + " " + chunk.section);
    const hayCounts = new Map<string, number>();
    for (const t of haystack) hayCounts.set(t, (hayCounts.get(t) ?? 0) + 1);

    let score = 0;
    for (const t of qSet) {
      if (hayCounts.has(t)) score += 1 + Math.min(2, hayCounts.get(t)! * 0.3);
    }
    // Tag boosts — tags are curated retrieval anchors.
    for (const tag of chunk.tags) {
      const tagTokens = tag.split(/\s+/);
      if (tagTokens.every((tt) => qSet.has(tt))) score += 2.5;
      else if (qSet.has(tag)) score += 2.5;
    }
    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function citationsFor(chunks: RetrievedChunk[]): string[] {
  return chunks.map(
    (c) => `${c.source === "AMP_2050" ? "AMP 2050" : "CAADP/Malabo"} — ${c.section}`
  );
}
