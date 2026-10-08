"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/**
 * StepperNav — horizontal progress stepper with clickable completed steps.
 * Pairs with WizardForm or stands alone for status displays.
 *
 * <StepperNav steps={["Cart", "Shipping", "Payment", "Done"]} current={2} onStepClick={go} />
 */

export function StepperNav({
  steps,
  current,
  onStepClick,
  allowFutureClicks = false,
  className,
}: {
  steps: string[];
  /** Index of the current (in-progress) step. */
  current: number;
  onStepClick?: (index: number) => void;
  allowFutureClicks?: boolean;
  className?: string;
}) {
  return (
    <ol className={cn("flex w-full items-center", className)} aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = (done || allowFutureClicks) && onStepClick;
        return (
          <li key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "group flex items-center gap-2",
                clickable ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary",
                  !done && !active && "border-muted-foreground/30 text-muted-foreground",
                  clickable && "group-hover:ring-2 group-hover:ring-ring/30",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  active ? "font-medium" : done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn("mx-3 h-px flex-1", i < current ? "bg-primary" : "bg-border", i < steps.length - 1 && "min-w-6")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
