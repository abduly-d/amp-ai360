"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, Moon, Search, Sun, Wheat, X, LogOut, Brain, House } from "lucide-react";
import { NAV } from "@/lib/nav";
import { searchDomain } from "@/lib/domain/search";
import type { DomainSnapshot } from "@/lib/domain/snapshot";
import { AiCopilotDrawer } from "@/components/ai-copilot-drawer";
import { Button } from "@/components/ui/button";
import { AuthProvider, DomainProvider, FiltersProvider, useAuth, useDomain, useFilters } from "@/components/app-state";

export function Shell({
  snapshot,
  session,
  children,
}: {
  snapshot: DomainSnapshot;
  session: { name: string | null; editingEnabled: boolean };
  children: React.ReactNode;
}) {
  return (
    <DomainProvider initial={snapshot}>
      <AuthProvider initial={session}>
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading the workspace…</div>}>
          <FiltersProvider>
            <Frame>{children}</Frame>
          </FiltersProvider>
        </Suspense>
      </AuthProvider>
    </DomainProvider>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const welcomeOpen = useSearchParams().get("welcome") === "1";
  const { snapshot, refreshing } = useDomain();
  const { name } = useAuth();
  const filters = useFilters();
  const [navOpen, setNavOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [signInOpen, setSignInOpen] = useState(false);
  const hits = useMemo(() => searchDomain(snapshot, query), [snapshot, query]);

  useEffect(() => {
    setNavOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    const open = () => setAssistantOpen(true);
    window.addEventListener("amp-open-assistant", open);
    return () => window.removeEventListener("amp-open-assistant", open);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("amp-theme");
    const next = stored ? stored === "dark" : document.documentElement.classList.contains("dark");
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("amp-theme", next ? "dark" : "light");
  }

  const years = Array.from({ length: 12 }, (_, index) => 2019 + index);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16.5rem_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      {navOpen && (
        <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" aria-label="Close menu" onClick={() => setNavOpen(false)} />
      )}
      <aside
        id="app-sidebar"
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tz-green to-[#0A5C2A] text-white ring-2 ring-tz-gold/40">
            <Wheat className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">AMP AI360</p>
            <p className="text-[11px] text-muted-foreground">Agriculture Transformation Office</p>
          </div>
        </div>
        <nav aria-label="Primary" className="thin-scroll flex-1 space-y-4 overflow-y-auto px-3 py-4">
          <a
            href="/?welcome=1"
            aria-current={pathname === "/" && welcomeOpen ? "page" : undefined}
            className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${pathname === "/" && welcomeOpen ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
          >
            <House className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Welcome</span>
          </a>
          {NAV.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
              <ul className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = item.href === "/" ? pathname === "/" && !welcomeOpen : pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <p className="border-t px-4 py-3 text-[11px] text-muted-foreground">
          {snapshot.mode === "postgres" ? "Postgres" : "Local dataset"} · {snapshot.dbOk ? "connected" : "fallback"}
          {name ? ` · ${name}` : " · view only"}
        </p>
      </aside>

      <div className="min-w-0">
        <header className="no-print sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border lg:hidden"
              aria-expanded={navOpen}
              aria-controls="app-sidebar"
              onClick={() => setNavOpen((open) => !open)}
            >
              {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="sr-only">Menu</span>
            </button>
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search flagships, commodities, regions…"
                aria-label="Search the working dataset"
                className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-11 z-30 max-h-80 overflow-auto rounded-lg border bg-card shadow-lg">
                  {hits.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-muted-foreground">No matching records.</p>
                  ) : (
                    <ul>
                      {hits.map((hit) => (
                        <li key={`${hit.group}-${hit.title}`}>
                          <a href={hit.href} className="block px-3 py-2 hover:bg-secondary" onClick={() => setQuery("")}>
                            <span className="text-[10px] uppercase text-muted-foreground">{hit.group}</span>
                            <span className="block text-sm font-medium">{hit.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">{hit.snippet}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <EditorButton onSignIn={() => setSignInOpen(true)} />
            <Button variant="outline" size="sm" onClick={() => setAssistantOpen(true)}>
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Assistant</span>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t px-3 py-2 sm:px-4">
            <FilterSelect label="Year" value={String(filters.year)} onChange={(value) => filters.setFilter("year", value)}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect label="Region" value={filters.region} onChange={(value) => filters.setFilter("region", value)}>
              <option value="">All regions</option>
              {snapshot.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect label="Flagship" value={filters.flagship} onChange={(value) => filters.setFilter("flagship", value)}>
              <option value="">All flagships</option>
              {snapshot.flagships.map((flagship) => (
                <option key={flagship.id} value={flagship.id}>
                  F{flagship.id} · {flagship.name}
                </option>
              ))}
            </FilterSelect>
            {(filters.region || filters.flagship) && (
              <button className="text-xs text-primary hover:underline" onClick={filters.clear}>
                Clear filters
              </button>
            )}
            {refreshing && <span className="text-xs text-muted-foreground">Refreshing…</span>}
            {snapshot.warning && <span className="text-xs text-tz-gold">{snapshot.warning}</span>}
          </div>
        </header>
        <main id="main" className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5">
          {children}
        </main>
        <footer className="no-print border-t px-4 py-4 text-center text-xs text-muted-foreground">
          AMP AI360 for the Agriculture Transformation Office · Public AMP 2050 baselines, with team edits kept in the working dataset
        </footer>
      </div>
      <button
        onClick={() => setAssistantOpen(true)}
        className="no-print fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg"
        aria-label="Ask the AMP assistant"
      >
        <Brain className="h-6 w-6" />
      </button>
      <AiCopilotDrawer open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      {signInOpen && <SignInDialog onClose={() => setSignInOpen(false)} />}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select className="h-8 rounded-lg border bg-background px-2" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
        {children}
      </select>
    </label>
  );
}

function EditorButton({ onSignIn }: { onSignIn: () => void }) {
  const { name, editingEnabled, signOut } = useAuth();
  if (!editingEnabled) return <span className="text-xs text-muted-foreground">View only</span>;
  if (!name) {
    return (
      <Button size="sm" onClick={onSignIn}>
        Sign in
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" onClick={() => signOut()}>
      <LogOut className="h-4 w-4" />
      <span className="max-w-[8rem] truncate">{name}</span>
    </Button>
  );
}

function SignInDialog({ onClose }: { onClose: () => void }) {
  const { refresh } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not sign in");
      await refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="presentation" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border bg-card p-5 shadow-xl"
      >
        <h2 id="signin-title" className="text-base font-semibold">
          Editor sign-in
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Stakeholders can read without an account. Editing uses the shared editor password.</p>
        <label className="mt-4 block text-xs font-medium">
          Display name
          <input className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoFocus required />
        </label>
        <label className="mt-3 block text-xs font-medium">
          Password
          <input type="password" className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
}
