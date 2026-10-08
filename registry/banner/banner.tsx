"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Info, AlertTriangle, CircleCheck, CircleX } from "lucide-react";

/**
 * Banner — full-width announcement/alert strip above page content with
 * tone variants and dismiss (optionally persisted per id).
 *
 * <Banner tone="warning" dismissKey="maint-notice">Scheduled maintenance Sunday 02:00 UTC.</Banner>
 */

type Tone = "info" | "success" | "warning" | "error";

const tones: Record<Tone, { wrap: string; icon: React.ReactNode }> = {
  info: { wrap: "border-blue-500/30 bg-blue-500/10 text-blue-200", icon: <Info className="size-4" /> },
  success: { wrap: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200", icon: <CircleCheck className="size-4" /> },
  warning: { wrap: "border-amber-500/30 bg-amber-500/10 text-amber-200", icon: <AlertTriangle className="size-4" /> },
  error: { wrap: "border-red-500/30 bg-red-500/10 text-red-200", icon: <CircleX className="size-4" /> },
};

export function Banner({
  tone = "info",
  dismissKey,
  onDismiss,
  children,
  className,
}: {
  tone?: Tone;
  /** Persist dismissal in localStorage under this key. */
  dismissKey?: string;
  onDismiss?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (dismissKey && localStorage.getItem(`banner-dismissed:${dismissKey}`) === "1") setDismissed(true);
  }, [dismissKey]);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    if (dismissKey) try { localStorage.setItem(`banner-dismissed:${dismissKey}`, "1"); } catch { /* ignore */ }
    onDismiss?.();
  };

  return (
    <div
      role="status"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-sm",
        tones[tone].wrap,
        className,
      )}
    >
      <span className="shrink-0">{tones[tone].icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
      {dismissKey !== undefined && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="shrink-0 rounded-sm p-0.5 opacity-60 hover:opacity-100"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
