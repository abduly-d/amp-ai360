"use client";

import { useEffect, useState } from "react";
import { LucideIcon, ArrowRight } from "lucide-react";

export interface LandingItem {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const PHOTOS = [
  { src: "/landing/farmer.jpg", cap: "Smallholder irrigation · Tanzania", pos: "70% 30%" },
  { src: "/landing/greenhouse.jpg", cap: "Horticulture · greenhouse production", pos: "center" },
  { src: "/landing/farmland.jpg", cap: "Commercial farmland · Tanzania", pos: "center" },
];

function Scene() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PHOTOS.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="absolute inset-0">
      {PHOTOS.map((p, k) => (
        <div
          key={p.src}
          className="absolute inset-0 bg-cover transition-opacity duration-1000"
          style={{ backgroundImage: `url(${p.src})`, backgroundPosition: p.pos, opacity: k === i ? 1 : 0 }}
        />
      ))}
      <div className="absolute bottom-4 left-4 z-10 rounded-full bg-[#0B1120]/50 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur">
        {PHOTOS[i].cap}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex h-2">
        <span className="flex-1" style={{ backgroundColor: "#1EB53A" }} />
        <span style={{ width: 30, backgroundColor: "#FCD116" }} />
        <span style={{ width: 10, backgroundColor: "#000" }} />
        <span style={{ width: 30, backgroundColor: "#FCD116" }} />
        <span className="flex-1" style={{ backgroundColor: "#00A3DD" }} />
      </div>
    </div>
  );
}

export function Landing({ items, onSelect }: { items: LandingItem[]; onSelect: (id: string) => void }) {
  return (
    <div className="mt-2 grid min-h-[460px] overflow-hidden rounded-2xl border shadow-sm md:grid-cols-2">
      <div className="relative min-h-[220px] overflow-hidden bg-[#0A5C2A] md:min-h-[460px]">
        <Scene />
      </div>
      <div className="flex flex-col bg-card p-7">
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Agriculture Transformation Office
          </div>
          <h1 className="mt-1 text-2xl font-bold">AMP Ai360</h1>
          <p className="text-sm text-muted-foreground">
            Tanzania Agriculture Master Plan Intelligence Platform. Select a module to begin.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="flex items-center gap-3 rounded-xl border bg-background px-3.5 py-2.5 text-left transition-colors hover:border-primary hover:bg-secondary"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <b className="text-sm">{t.label}</b>
                  <br />
                  <span className="text-[11px] text-muted-foreground">{t.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Powered by the Ministry of Agriculture &amp; the Ministry of Livestock &amp; Fisheries · Data:
          World Bank, MoA Weekly Bulletin, Bank of Tanzania, AMP 2050.
        </p>
      </div>
    </div>
  );
}
