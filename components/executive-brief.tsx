"use client";

import { flagshipProgress } from "@/lib/data/flagships";
import { investmentRollup } from "@/lib/domain/snapshot";
import { usd } from "@/lib/data/investments";
import { useDomain, useFilters } from "@/components/app-state";
import { Button } from "@/components/ui/button";

export function ExecutiveBrief() {
  const { snapshot } = useDomain();
  const filters = useFilters();
  const region = snapshot.regions.find((item) => item.id === filters.region);
  const flagships = snapshot.flagships.filter((item) => !filters.flagship || String(item.id) === filters.flagship);
  const alerts = snapshot.alerts.filter((item) => !filters.flagship || String(item.flagship ?? "") === filters.flagship);
  const roll = investmentRollup(snapshot.investments);
  const counts = {
    "on-track": flagships.filter((item) => item.status === "on-track").length,
    "at-risk": flagships.filter((item) => item.status === "at-risk").length,
    critical: flagships.filter((item) => item.status === "critical").length,
  };

  return (
    <article className="print-brief space-y-6">
      <div className="no-print flex justify-end">
        <Button type="button" onClick={() => window.print()}>
          Print / save PDF
        </Button>
      </div>
      <header className="border-b pb-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Agriculture Transformation Office · Meeting brief</p>
        <h1 className="mt-1 text-2xl font-bold">AMP 2050 executive brief</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · Year {filters.year}
          {region ? ` · ${region.name}` : ""} · Prepared for MoA, MLF, and development partners
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold">Indicators</h2>
        {snapshot.kpis.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No indicators have been recorded.</p>
        ) : (
          <table className="mt-2 w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1">Indicator</th>
                <th>Latest</th>
                <th>2030</th>
                <th>2050</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.kpis.map((kpi) => (
                <tr key={kpi.id} className="border-t">
                  <td className="py-1 pr-2">{kpi.label}</td>
                  <td>{kpi.currentLabel ?? "—"}</td>
                  <td>{kpi.target2030Label}</td>
                  <td>{kpi.target2050Label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold">Flagships · {counts["on-track"]} on track, {counts["at-risk"]} at risk, {counts.critical} critical</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {flagships.map((flagship) => (
            <li key={flagship.id}>
              F{flagship.id} {flagship.name}: {flagship.current.toLocaleString()} / {flagship.target.toLocaleString()} {flagship.unit} ({flagshipProgress(flagship)}%, {flagship.status})
            </li>
          ))}
          {flagships.length === 0 && <li className="text-muted-foreground">No flagships match this filter.</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Decision room</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {alerts.slice(0, 6).map((alert) => (
            <li key={alert.id}>
              <b className="uppercase">{alert.level}</b> — {alert.title}. {alert.recommendation}
            </li>
          ))}
          {alerts.length === 0 && <li className="text-muted-foreground">No alerts for this filter.</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Financing</h2>
        <p className="mt-2 text-sm">
          {roll.totals.n} investments · required {usd(roll.totals.req)} · secured {usd(roll.totals.sec)} · gap {usd(roll.totals.gap)}.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold">CAADP</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {snapshot.caadp.map((item) => (
            <li key={item.id}>
              {item.dimension}: {item.verdict} ({item.ampValueLabel} vs {item.caadpValueLabel})
            </li>
          ))}
        </ul>
      </section>
      <p className="text-xs text-muted-foreground">Figures are the working dataset. Seed values are the public AMP 2050 baselines; later rows carry the editor note and source.</p>
    </article>
  );
}
