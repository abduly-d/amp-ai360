"use client";

import { PageHeader } from "@/components/page-header";
import { QuickEntry } from "@/components/quick-entry";
import { EmptyState } from "@/components/page-header";
import { useDomain, useFilters } from "@/components/app-state";
import { datasetUpdatedAt } from "@/lib/domain/snapshot";
import { progressTo2030 } from "@/lib/data/amp-targets";

export default function KpisPage() {
  const { snapshot } = useDomain();
  const { year } = useFilters();
  return (
    <>
      <PageHeader
        title="Indicators"
        description="Baseline, 2030 and 2050 targets, plus the actual entered for the selected year."
        updatedAt={datasetUpdatedAt(snapshot, ["kpis", "kpi_actuals"])}
        updatedBy={snapshot.meta.kpi_actuals.updatedBy}
      />
      <div className="mb-4">
        <QuickEntry dataset="kpi_actuals" title="Enter an actual" help="add a year, value, note, and source for an indicator" preset={{ year: String(year) }} />
      </div>
      {snapshot.kpis.length === 0 ? (
        <EmptyState title="No indicators" body="Add an indicator from Manage data. Actuals attach to its id." />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Indicator</th>
                <th className="px-3 py-2">Baseline</th>
                <th className="px-3 py-2">{year} actual</th>
                <th className="px-3 py-2">2030</th>
                <th className="px-3 py-2">To 2030</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.kpis.map((kpi) => {
                const actual = kpi.actuals.find((row) => Number(row.year) === year);
                return (
                  <tr key={kpi.id} className="border-t">
                    <td className="px-3 py-2">
                      <b>{kpi.label}</b>
                      <span className="block text-xs text-muted-foreground">{kpi.id}</span>
                    </td>
                    <td className="px-3 py-2">{kpi.baselineLabel}</td>
                    <td className="px-3 py-2">{actual ? String(actual.label || actual.value) : "—"}</td>
                    <td className="px-3 py-2">{kpi.target2030Label}</td>
                    <td className="px-3 py-2">{progressTo2030(kpi)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
