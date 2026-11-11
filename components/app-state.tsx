"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DomainSnapshot } from "@/lib/domain/snapshot";
import type { DatasetId } from "@/lib/domain/datasets";

interface DomainValue {
  snapshot: DomainSnapshot;
  ready: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

const DomainContext = createContext<DomainValue | null>(null);

export function DomainProvider({ initial, children }: { initial: DomainSnapshot; children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/domain", { cache: "no-store" });
      if (res.ok) setSnapshot(await res.json());
    } finally {
      setRefreshing(false);
    }
  }

  const value = useMemo(() => ({ snapshot, ready: true, refreshing, refresh }), [snapshot, refreshing]);
  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

export function useDomain(): DomainValue {
  const value = useContext(DomainContext);
  if (!value) throw new Error("useDomain must be used inside the app shell");
  return value;
}

interface AuthValue {
  name: string | null;
  editingEnabled: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({
  initial,
  children,
}: {
  initial: { name: string | null; editingEnabled: boolean };
  children: React.ReactNode;
}) {
  const [name, setName] = useState(initial.name);
  const [editingEnabled, setEditingEnabled] = useState(initial.editingEnabled);

  async function refresh() {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setName(data.name ?? null);
    setEditingEnabled(Boolean(data.editingEnabled));
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setName(null);
  }

  const value = useMemo(() => ({ name, editingEnabled, refresh, signOut }), [name, editingEnabled]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside the app shell");
  return value;
}

export interface Filters {
  year: number;
  region: string;
  flagship: string;
  setFilter: (key: "year" | "region" | "flagship", value: string) => void;
  clear: () => void;
}

const FiltersContext = createContext<Filters | null>(null);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const year = Number(params.get("year")) || new Date().getFullYear();
  const region = params.get("region") ?? "";
  const flagship = params.get("flagship") ?? "";

  const value = useMemo<Filters>(() => {
    function write(next: URLSearchParams) {
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
    return {
      year,
      region,
      flagship,
      setFilter: (key, raw) => {
        const next = new URLSearchParams(params.toString());
        if (!raw) next.delete(key);
        else next.set(key, raw);
        write(next);
      },
      clear: () => {
        const next = new URLSearchParams(params.toString());
        next.delete("year");
        next.delete("region");
        next.delete("flagship");
        write(next);
      },
    };
  }, [year, region, flagship, params, pathname, router]);

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): Filters {
  const value = useContext(FiltersContext);
  if (!value) throw new Error("useFilters must be used inside the app shell");
  return value;
}

export async function saveRecord(dataset: DatasetId, method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) {
  const url = method === "DELETE" ? `/api/records/${dataset}?id=${encodeURIComponent(String(body.id ?? ""))}` : `/api/records/${dataset}`;
  const res = await fetch(url, {
    method,
    headers: method === "DELETE" ? undefined : { "content-type": "application/json" },
    body: method === "DELETE" ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = Array.isArray(data.errors) ? data.errors.map((error: { message?: string }) => error.message).filter(Boolean).join(" ") : "";
    throw new Error(details || data.error || "The change was not saved");
  }
  return data;
}
