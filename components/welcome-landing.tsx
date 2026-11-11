"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Brain,
  Building2,
  ClipboardList,
  Flag,
  Gauge,
  Globe2,
  LineChart,
  Map,
  Siren,
  Wallet,
  Wheat,
  LayoutDashboard,
} from "lucide-react";
import { LANDING_PHOTOS, type LandingPhoto } from "@/lib/landing-photos";

const MODULES: { href: string; label: string; subtitle: string; icon: typeof Flag }[] = [
  { href: "/", label: "Executive overview", subtitle: "KPIs versus 2030 and 2050 targets", icon: LayoutDashboard },
  { href: "/delivery/flagships", label: "15 Flagship tracker", subtitle: "Progress and status of the AMP programmes", icon: Flag },
  { href: "/delivery/kpis", label: "Indicators", subtitle: "Baseline, targets, and reported actuals", icon: Gauge },
  { href: "/markets/commodities", label: "Commodity intelligence", subtitle: "Production, prices, and post-harvest losses", icon: Wheat },
  { href: "/geography/regions", label: "Regional intelligence", subtitle: "Corridors and readiness across 26 regions", icon: Map },
  { href: "/alignment/caadp", label: "CAADP alignment", subtitle: "Malabo commitments against the AMP", icon: Globe2 },
  { href: "/alignment/institutions", label: "Institutional scorecard", subtitle: "Ministries, agencies, and commodity boards", icon: Building2 },
  { href: "/markets/forecast", label: "AI forecast engine", subtitle: "Price outlook and trade signals", icon: Brain },
  { href: "/scenarios", label: "DIRA 2050", subtitle: "Business as usual against the full AMP path", icon: LineChart },
  { href: "/delivery/decision-room", label: "Decision room", subtitle: "Alerts for the ministerial briefing", icon: Siren },
  { href: "/alignment/investments", label: "Investments and partners", subtitle: "Financing, instruments, and the funding gap", icon: Wallet },
  { href: "/data", label: "Manage data", subtitle: "Edit records, import CSV, and read the audit log", icon: ClipboardList },
];

export function WelcomeLanding({
  onEnter,
  onOpenAssistant,
}: {
  onEnter: (href: string) => void;
  onOpenAssistant: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-lg lg:grid lg:h-[calc(100vh-9.5rem)] lg:min-h-[34rem] lg:grid-cols-2">
      <PhotoPanel photos={LANDING_PHOTOS} />
      <div className="flex min-h-0 flex-col px-4 py-5 sm:px-6 sm:py-6 lg:h-full">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tz-gold">Agriculture Transformation Office</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">AMP Ai360</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tanzania Agriculture Master Plan Intelligence Platform. Select a module to begin.
        </p>
        <ul className="thin-scroll mt-4 max-h-[52vh] min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
          {MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href + item.label}>
                <a
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    onEnter(item.href);
                  }}
                  className="flex items-center gap-3 rounded-xl border bg-background/50 px-3 py-2.5 text-left transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </a>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={onOpenAssistant}
              className="flex w-full items-center gap-3 rounded-xl border bg-background/50 px-3 py-2.5 text-left transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Brain className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">AI copilot</span>
                <span className="block truncate text-xs text-muted-foreground">Ask about the live dataset and the AMP knowledge base</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          </li>
        </ul>
        <button
          type="button"
          onClick={() => onEnter("/")}
          className="mt-4 inline-flex h-10 shrink-0 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip / Enter dashboard
        </button>
      </div>
    </section>
  );
}

function PhotoPanel({ photos }: { photos: LandingPhoto[] }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const photo = photos[index];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [reduceMotion, index, photos.length]);

  return (
    <div className="relative h-72 sm:h-96 lg:h-full">
      {photos.map((item, itemIndex) => {
        const active = itemIndex === index;
        return (
          <div
            key={item.src}
            className={`absolute inset-0 overflow-hidden transition-opacity ${reduceMotion ? "duration-0" : "duration-1000"} ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={!active}
          >
            <Image
              src={item.src}
              alt={active ? item.alt : ""}
              fill
              priority={itemIndex === 0}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={`object-cover ${active && !reduceMotion ? "amp-kenburns" : ""}`}
            />
          </div>
        );
      })}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 text-white">
        <p className="text-sm font-semibold" aria-live="polite">
          {photo.caption}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-white/85">
          Photo: {photo.author}.{" "}
          <a href={photo.licenceUrl} className="underline" target="_blank" rel="noopener noreferrer">
            {photo.licence}
          </a>
          .{" "}
          <a href={photo.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
            Source
          </a>
          .{" "}
          <a href="/photos/CREDITS.md" className="underline">
            All credits
          </a>
        </p>
        <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Photographs">
          {photos.map((item, itemIndex) => (
            <button
              key={item.src}
              type="button"
              role="tab"
              aria-selected={itemIndex === index}
              aria-label={`Show photo ${itemIndex + 1}: ${item.caption}`}
              onClick={() => setIndex(itemIndex)}
              className={`h-2.5 w-2.5 rounded-full ${itemIndex === index ? "bg-white" : "bg-white/45"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
