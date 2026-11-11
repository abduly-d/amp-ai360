"use client";

import { usePathname } from "next/navigation";
import { crumbsFor } from "@/lib/nav";

export function PageHeader({
  title,
  description,
  updatedAt,
  updatedBy,
  actions,
}: {
  title: string;
  description?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);
  const stamp = updatedAt ? new Date(updatedAt) : null;
  const valid = stamp && !Number.isNaN(stamp.getTime());
  return (
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-1 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            {crumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden="true">/</span>}
                <a href={crumb.href} className="hover:text-foreground hover:underline">
                  {crumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          {valid ? (
            <>
              Last updated{" "}
              <time dateTime={stamp!.toISOString()}>
                {stamp!.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </time>
              {updatedBy ? ` · ${updatedBy}` : ""}
            </>
          ) : (
            "No edits recorded yet"
          )}
        </p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-10 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
