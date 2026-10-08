"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

/**
 * Rating — interactive star rating with half-step display support,
 * hover preview, keyboard arrows, and read-only mode.
 *
 * <Rating value={rating} onChange={setRating} max={5} allowClear />
 */

export function Rating({
  value,
  onChange,
  max = 5,
  allowClear = false,
  readOnly = false,
  size = "md",
  className,
  "aria-label": ariaLabel = "Rating",
}: {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  allowClear?: boolean;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const shown = hover ?? value;
  const sizes = { sm: "size-3.5", md: "size-5", lg: "size-7" } as const;

  return (
    <div
      role={readOnly ? "img" : "slider"}
      aria-label={ariaLabel}
      aria-valuenow={readOnly ? undefined : value}
      aria-valuemin={readOnly ? undefined : 0}
      aria-valuemax={readOnly ? undefined : max}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={(e) => {
        if (readOnly) return;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange?.(Math.min(max, value + 1)); }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange?.(Math.max(0, value - 1)); }
      }}
      onMouseLeave={() => setHover(null)}
      className={cn("inline-flex items-center gap-0.5", !readOnly && "cursor-pointer", className)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const filled = n <= Math.floor(shown);
        const partial = !filled && n - 1 < shown && shown % 1 !== 0;
        return (
          <button
            key={n}
            type="button"
            tabIndex={-1}
            disabled={readOnly}
            aria-hidden={readOnly}
            onMouseEnter={() => !readOnly && setHover(n)}
            onClick={() => {
              if (readOnly) return;
              if (allowClear && n === value) onChange?.(0);
              else onChange?.(n);
            }}
            className={cn("relative", readOnly && "pointer-events-none")}
          >
            <Star
              className={cn(
                sizes[size],
                filled || partial ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40",
              )}
            />
            {partial && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${(shown % 1) * 100}%` }}>
                <Star className={cn(sizes[size], "fill-amber-400 text-amber-400")} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
