import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  FileText,
  Flag,
  Gauge,
  Globe2,
  History,
  LayoutDashboard,
  LineChart,
  Map,
  Siren,
  Upload,
  Wallet,
  Wheat,
  Brain,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Executive overview", icon: LayoutDashboard, description: "Headline targets, open data, and the latest actuals" },
      { href: "/scenarios", label: "DIRA 2050", icon: LineChart, description: "Business as usual against the full AMP path" },
      { href: "/brief", label: "Executive brief", icon: FileText, description: "Printable briefing for meetings" },
    ],
  },
  {
    label: "Delivery",
    items: [
      { href: "/delivery/flagships", label: "Flagships", icon: Flag, description: "Fifteen programmes, progress, and status" },
      { href: "/delivery/kpis", label: "Indicators", icon: Gauge, description: "Baseline, target, and reported actuals" },
      { href: "/delivery/decision-room", label: "Decision room", icon: Siren, description: "Alerts for the ministerial briefing" },
    ],
  },
  {
    label: "Markets",
    items: [
      { href: "/markets/commodities", label: "Commodities", icon: Wheat, description: "Production, prices, and losses" },
      { href: "/markets/forecast", label: "Forecast", icon: Brain, description: "Price outlook and trade signals" },
    ],
  },
  {
    label: "Geography",
    items: [{ href: "/geography/regions", label: "Regions", icon: Map, description: "Corridors and regional readiness" }],
  },
  {
    label: "Alignment",
    items: [
      { href: "/alignment/caadp", label: "CAADP", icon: Globe2, description: "Malabo commitments against the AMP" },
      { href: "/alignment/institutions", label: "Institutions", icon: Building2, description: "Delivery and budget execution" },
      { href: "/alignment/investments", label: "Investments", icon: Wallet, description: "Partners, instruments, and the funding gap" },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "/data", label: "Manage data", icon: ClipboardList, description: "Create, edit, and delete working records" },
      { href: "/data/import", label: "Imports", icon: Upload, description: "CSV templates, import, and export" },
      { href: "/data/audit", label: "Audit log", icon: History, description: "Who changed what, and when" },
    ],
  },
];

export function crumbsFor(pathname: string): { href: string; label: string }[] {
  const match = NAV.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label }))).find((item) => item.href === pathname);
  if (!match || pathname === "/") return [{ href: "/", label: "Overview" }];
  return [
    { href: "/", label: "Overview" },
    { href: match.href, label: match.label },
  ];
}

export function pageMeta(pathname: string): { title: string; description: string } {
  const item = NAV.flatMap((group) => group.items).find((entry) => entry.href === pathname);
  return { title: item?.label ?? "AMP AI360", description: item?.description ?? "" };
}
