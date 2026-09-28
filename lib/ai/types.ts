export type AnalysisMode =
  | "correlation"
  | "target-path"
  | "caadp-alignment"
  | "general";

export interface AnalysisTable {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface AnalysisResult {
  mode: AnalysisMode;
  provider: "anthropic" | "openai" | "local-rag";
  query: string;
  summary: string;
  keyPoints: string[];
  tables?: AnalysisTable[];
  recommendations?: string[];
  citations: string[];
}
