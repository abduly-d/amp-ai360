import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Kind = "api" | "open" | "model";

const KIND_META: Record<Kind, { label: string; color: string }> = {
  api: { label: "API-linked", color: "#1EA84C" },
  open: { label: "Open data", color: "#0F7DB8" },
  model: { label: "Model / AMP doc", color: "#B8860B" },
};

export const TAB_SOURCES: Record<string, { label: string; kind: Kind }> = {
  overview: { label: "World Bank Indicators API (live) · AMP 2050 policy targets", kind: "api" },
  commodity: { label: "MoA Weekly Market Bulletin · COPRA · TAHA · TMX", kind: "api" },
  regional: { label: "SAGCOT / AGCOT corridors · AMP 2050 regional scores", kind: "open" },
  flagships: { label: "AMP 2050 document · ATO delivery M&E", kind: "open" },
  scenarios: { label: "AMP 2050 scenario modelling (BAU vs Full AMP)", kind: "model" },
  caadp: { label: "AU CAADP / Malabo commitments · ReSAKSS Biennial Review", kind: "open" },
  forecast: { label: "AMP AI forecast model — indicative signals", kind: "model" },
  institutions: { label: "ATO / ministry delivery & budget-execution M&E", kind: "open" },
  investment: { label: "AMP 2050 Financing & Partnership Mapping (ATO) · OECD CRS for DP flows", kind: "open" },
  decision: { label: "Composite — flagship, CAADP, commodity & food-security alerts", kind: "model" },
};

export function SourceStrip({ tab }: { tab: string }) {
  const s = TAB_SOURCES[tab];
  if (!s) return null;
  const k = KIND_META[s.kind];
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge bg={k.color + "22"} color={k.color}>
        <Info className="mr-1 h-3 w-3" />
        {k.label}
      </Badge>
      <span>
        Data source: <span className="font-medium text-foreground">{s.label}</span>
      </span>
    </div>
  );
}
