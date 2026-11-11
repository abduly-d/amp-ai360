import type { DomainSnapshot } from "./snapshot";

export interface SearchHit {
  href: string;
  title: string;
  group: string;
  snippet: string;
}

export function searchDomain(snapshot: DomainSnapshot, query: string, limit = 12): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  const push = (hit: SearchHit, haystack: string) => {
    if (haystack.toLowerCase().includes(q)) hits.push(hit);
  };

  for (const kpi of snapshot.kpis) {
    push(
      { href: "/delivery/kpis", title: kpi.label, group: "Indicators", snippet: kpi.currentLabel ?? kpi.baselineLabel },
      `${kpi.label} ${kpi.description} ${kpi.id}`
    );
  }
  for (const flagship of snapshot.flagships) {
    push(
      { href: `/delivery/flagships?flagship=${flagship.id}`, title: `F${flagship.id} ${flagship.name}`, group: "Flagships", snippet: flagship.targetLabel },
      `${flagship.name} ${flagship.summary} ${flagship.lead}`
    );
  }
  for (const commodity of snapshot.commodities) {
    push(
      { href: "/markets/commodities", title: commodity.name, group: "Commodities", snippet: commodity.category },
      `${commodity.name} ${commodity.note} ${commodity.keyRegions.join(" ")}`
    );
  }
  for (const region of snapshot.regions) {
    push(
      { href: `/geography/regions?region=${region.id}`, title: region.name, group: "Regions", snippet: `${region.zone} · score ${region.ampScore}` },
      `${region.name} ${region.zone} ${region.leadCommodities.join(" ")}`
    );
  }
  for (const item of snapshot.caadp) {
    push(
      { href: "/alignment/caadp", title: item.dimension, group: "CAADP", snippet: item.badge },
      `${item.dimension} ${item.commentary} ${item.ampPosition}`
    );
  }
  for (const institution of snapshot.institutions) {
    push(
      { href: "/alignment/institutions", title: `${institution.acronym} · ${institution.name}`, group: "Institutions", snippet: institution.mandate },
      `${institution.acronym} ${institution.name} ${institution.mandate}`
    );
  }
  for (const alert of snapshot.alerts) {
    push(
      { href: "/delivery/decision-room", title: alert.title, group: "Decision room", snippet: alert.category },
      `${alert.title} ${alert.detail} ${alert.recommendation}`
    );
  }
  for (const investment of snapshot.investments) {
    push(
      { href: "/alignment/investments", title: investment.name, group: "Investments", snippet: `${investment.funder} · ${investment.region}` },
      `${investment.name} ${investment.funder} ${investment.region} ${investment.mda}`
    );
  }
  return hits.slice(0, limit);
}
