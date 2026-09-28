import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  color,
  className,
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${v}%`, backgroundColor: color ?? "hsl(var(--primary))" }}
      />
    </div>
  );
}
