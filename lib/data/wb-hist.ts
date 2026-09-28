// Embedded World Bank historical series (Tanzania, 2005–2025) so the date
// picker moves the whole dashboard by year — instantly and offline. Live fetch
// (in /api/data/metrics) refines the current year with the freshest value.

import { OPEN_DATA_SNAPSHOT, OpenSignal, formatWbValue } from "./open-data";

export const WB_HIST: Record<string, Record<string, number>> = {
  "NV.AGR.TOTL.CD": { "2005": 4534248882, "2006": 4407192472, "2007": 5081564805, "2008": 6921415997, "2009": 7654495292, "2010": 8189668523, "2011": 8656266903, "2012": 10527547073, "2013": 12229725050, "2014": 12897863809, "2015": 12681272814, "2016": 13660159873, "2017": 15318383777, "2018": 15886136433, "2019": 16229639462, "2020": 16685594759, "2021": 17514435491, "2022": 18374441350, "2023": 18720174199, "2024": 18476245533, "2025": 20651404035 },
  "NV.AGR.TOTL.ZS": { "2005": 24.65, "2006": 23.67, "2007": 23.25, "2008": 24.77, "2009": 26.04, "2010": 25.58, "2011": 24.98, "2012": 26.55, "2013": 26.79, "2014": 25.8, "2015": 26.75, "2016": 27.44, "2017": 28.75, "2018": 27.87, "2019": 26.59, "2020": 25.25, "2021": 24.79, "2022": 24.26, "2023": 23.69, "2024": 23.32, "2025": 22.91 },
  "NV.AGR.TOTL.KD.ZG": { "2005": 5.15, "2006": 3.44, "2007": 3.74, "2008": 7.22, "2009": 4.21, "2010": 3.2, "2011": 2.48, "2012": 3.37, "2013": 2.76, "2014": 6.89, "2015": 5.35, "2016": 4.76, "2017": 5.91, "2018": 3.44, "2019": 3.5, "2020": 3.07, "2021": 3.7, "2022": 3.8, "2023": 3.1, "2024": 3.74, "2025": 3.57 },
  "NY.GDP.MKTP.CD": { "2005": 18395383647, "2006": 18619859795, "2007": 21860434823, "2008": 27947821398, "2009": 29400573554, "2010": 32012892919, "2011": 34657140096, "2012": 39650394363, "2013": 45648857242, "2014": 49986726461, "2015": 47413919817, "2016": 49774409374, "2017": 53274884533, "2018": 57003712892, "2019": 61026731926, "2020": 66068737786, "2021": 70655628148, "2022": 75749121847, "2023": 79030935638, "2024": 79235713445, "2025": 90143496090 },
  "SN.ITK.DEFC.ZS": { "2005": 28.5, "2006": 27, "2007": 25.9, "2008": 25.1, "2009": 24.6, "2010": 23.7, "2011": 22.7, "2012": 21.7, "2013": 21.2, "2014": 21.1, "2015": 21.3, "2016": 21.9, "2017": 22.6, "2018": 22.9, "2019": 23, "2020": 22.8, "2021": 22.4, "2022": 21.4, "2023": 20.2 },
  "SI.POV.NAHC": { "2007": 34.4, "2011": 28.2, "2018": 26.4 },
  "AG.PRD.CREL.MT": { "2005": 5394302, "2006": 5745560, "2007": 6402080, "2008": 7651930, "2009": 5807305, "2010": 8643198, "2011": 7955143, "2012": 8119819, "2013": 8867188, "2014": 10874542, "2015": 10054818, "2016": 10797277, "2017": 10346519, "2018": 10831072, "2019": 10408438, "2020": 12488723, "2021": 12390738, "2022": 11933597, "2023": 12789232 },
  "AG.YLD.CREL.KG": { "2005": 1101.6, "2006": 1326.7, "2007": 1427.3, "2008": 1333.9, "2009": 1110.4, "2010": 1647.9, "2011": 1390.4, "2012": 1314.8, "2013": 1418, "2014": 1669.1, "2015": 1617.2, "2016": 1711.1, "2017": 1692, "2018": 1938.5, "2019": 1883.5, "2020": 1869.5, "2021": 1782.3, "2022": 1815.4, "2023": 1961.1 },
  "SP.RUR.TOTL": { "2005": 29501678, "2006": 30070432, "2007": 30632420, "2008": 31168102, "2009": 31635341, "2010": 32137984, "2011": 32742656, "2012": 33404597, "2013": 34141487, "2014": 34921640, "2015": 35787219, "2016": 36730728, "2017": 37677729, "2018": 38581253, "2019": 39441529, "2020": 40330625, "2021": 41248158, "2022": 42176917, "2023": 42985142, "2024": 43763014, "2025": 44526214 },
  "SP.POP.TOTL": { "2005": 39182076, "2006": 40294902, "2007": 41435512, "2008": 42570728, "2009": 43633982, "2010": 44758488, "2011": 46029367, "2012": 47374260, "2013": 48824128, "2014": 50351512, "2015": 52020962, "2016": 53824013, "2017": 55652890, "2018": 57437145, "2019": 59174891, "2020": 60972798, "2021": 62830412, "2022": 64711821, "2023": 66617606, "2024": 68560157, "2025": 70545865 },
};

// KPI id ← World Bank indicator, for driving the gauges by year.
export const KPI_BY_CODE: Record<string, string> = {
  "NV.AGR.TOTL.CD": "ag-gdp",
  "NV.AGR.TOTL.KD.ZG": "ag-growth",
  "SN.ITK.DEFC.ZS": "undernourishment",
};

export function histPick(code: string, year: number): { value: number; year: number } | null {
  const s = WB_HIST[code];
  if (!s) return null;
  const yrs = Object.keys(s).map(Number).sort((a, b) => a - b);
  let py: number | null = null;
  for (const y of yrs) if (y <= year) py = y;
  if (py == null) py = yrs[0];
  return { value: s[py], year: py };
}

// Build the open-data signal cards for a given year from embedded history.
export function signalsForYear(year: number): OpenSignal[] {
  return OPEN_DATA_SNAPSHOT.map((s) => {
    const h = histPick(s.code, year);
    if (!h || h.value == null) return s;
    return { ...s, value: h.value, valueLabel: formatWbValue(s.code, h.value), year: h.year };
  });
}

// WB raw units → KPI units (Ag GDP is measured in USD billions; % are 1:1).
const KPI_SCALE: Record<string, number> = { "NV.AGR.TOTL.CD": 1e9 };

// KPI current-value overrides for a given year: { kpiId: {value,label,year} }.
export function kpiOverridesForYear(year: number): Record<string, { value: number; label: string; year: number }> {
  const out: Record<string, { value: number; label: string; year: number }> = {};
  for (const [code, id] of Object.entries(KPI_BY_CODE)) {
    const h = histPick(code, year);
    if (h && h.value != null) {
      out[id] = { value: h.value / (KPI_SCALE[code] ?? 1), label: formatWbValue(code, h.value), year: h.year };
    }
  }
  return out;
}
