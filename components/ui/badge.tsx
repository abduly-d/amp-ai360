import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  bg?: string;
}

export function Badge({ className, color, bg, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        !bg && "bg-secondary text-secondary-foreground",
        className
      )}
      style={{ ...(bg ? { backgroundColor: bg } : {}), ...(color ? { color } : {}), ...style }}
      {...props}
    />
  );
}
