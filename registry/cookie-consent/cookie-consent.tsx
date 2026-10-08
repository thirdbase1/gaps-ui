"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

/**
 * CookieConsent — bottom banner with accept / reject / custom options,
 * persisted to localStorage so it never nags a user who decided.
 *
 * <CookieConsent
 *   onDecision={(d) => analytics.setConsent(d)}
 *   categories={[{ id: "analytics", label: "Analytics", required: false }]}
 * />
 */

export interface ConsentCategory {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface ConsentDecision {
  accepted: "all" | "none" | "custom";
  categories: Record<string, boolean>;
}

const STORAGE_KEY = "cookie-consent";

export function useConsent() {
  const [decision, setDecision] = React.useState<ConsentDecision | null>(null);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDecision(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  const decide = React.useCallback((d: ConsentDecision) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* ignore */ }
    setDecision(d);
  }, []);
  return { decision, decide };
}

export function CookieConsent({
  message = "We use cookies to improve your experience.",
  categories = [],
  onDecision,
  position = "bottom",
  className,
}: {
  message?: React.ReactNode;
  categories?: ConsentCategory[];
  onDecision?: (d: ConsentDecision) => void;
  position?: "bottom" | "bottom-right";
  className?: string;
}) {
  const { decision, decide } = useConsent();
  const [showCustom, setShowCustom] = React.useState(false);
  const [checks, setChecks] = React.useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.id, true])),
  );

  if (decision) return null;

  const commit = (accepted: ConsentDecision["accepted"]) => {
    const d: ConsentDecision = {
      accepted,
      categories:
        accepted === "all"
          ? Object.fromEntries(categories.map((c) => [c.id, true]))
          : accepted === "none"
            ? Object.fromEntries(categories.map((c) => [c.id, !!c.required]))
            : checks,
    };
    decide(d);
    onDecision?.(d);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={cn(
        "z-50 fixed w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-background p-4 shadow-lg",
        position === "bottom" && "bottom-4 left-1/2 -translate-x-1/2 sm:max-w-2xl",
        position === "bottom-right" && "bottom-4 right-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-sm">{message}</p>
          {showCustom && (
            <ul className="mt-3 space-y-2">
              {categories.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm">{c.label}</p>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </div>
                  <input
                    type="checkbox"
                    disabled={c.required}
                    checked={c.required || checks[c.id]}
                    onChange={(e) => setChecks((p) => ({ ...p, [c.id]: e.target.checked }))}
                    className="mt-1 size-4"
                    aria-label={c.label}
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => commit("all")}>Accept all</Button>
            <Button size="sm" variant="outline" onClick={() => commit("none")}>Reject</Button>
            {categories.length > 0 && !showCustom && (
              <Button size="sm" variant="ghost" onClick={() => setShowCustom(true)}>Customize</Button>
            )}
            {showCustom && (
              <Button size="sm" variant="secondary" onClick={() => commit("custom")}>Save choices</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
