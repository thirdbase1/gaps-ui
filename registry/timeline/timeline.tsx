"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, Loader2 } from "lucide-react";

/**
 * Timeline — vertical event/status timeline. Each item has a dot
 * (default / success / error / pending), title, description and timestamp.
 *
 * <Timeline>
 *   <TimelineItem title="Deploy started" timestamp="12:01" />
 *   <TimelineItem status="success" title="Build passed" timestamp="12:04" />
 * </Timeline>
 */

export type TimelineStatus = "default" | "success" | "error" | "pending";

export function Timeline({ className, children }: { className?: string; children: React.ReactNode }) {
  return <ol className={cn("relative space-y-6 border-l border-border pl-6", className)}>{children}</ol>;
}

const dotStyles: Record<TimelineStatus, string> = {
  default: "border-muted-foreground/40 bg-background",
  success: "border-emerald-500 bg-emerald-500 text-white",
  error: "border-red-500 bg-red-500 text-white",
  pending: "border-border bg-background",
};

export function TimelineItem({
  status = "default",
  title,
  description,
  timestamp,
  icon,
  className,
}: {
  status?: TimelineStatus;
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("relative", className)}>
      <span
        className={cn(
          "absolute -left-[31px] flex size-5 items-center justify-center rounded-full border-2",
          dotStyles[status],
        )}
      >
        {icon ??
          (status === "success" && <Check className="size-3" />) ??
          (status === "error" && <X className="size-3" />) ??
          (status === "pending" && <Loader2 className="size-3 animate-spin text-muted-foreground" />)}
      </span>
      <div className="flex flex-wrap items-baseline gap-2">
        <p className={cn("text-sm font-medium", status === "pending" && "text-muted-foreground")}>{title}</p>
        {timestamp && <time className="text-xs text-muted-foreground">{timestamp}</time>}
      </div>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </li>
  );
}
