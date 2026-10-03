"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * OnboardingChecklist — dismissable onboarding card with a progress ring
 * and per-task completion state, persisted to localStorage. Tasks can be
 * marked done programmatically (e.g. after the user actually performs the
 * action in-app) via the useOnboarding hook.
 *
 * const storageKey = "onboarding-main";
 * <OnboardingChecklist storageKey={storageKey} title="Get started">
 *   <OnboardingChecklist.Task id="profile" label="Complete your profile" />
 *   <OnboardingChecklist.Task id="invite" label="Invite a teammate" />
 *   <OnboardingChecklist.Task id="token" label="Create an API token" href="/settings/tokens" />
 * </OnboardingChecklist>
 *
 * // elsewhere in the app:
 * const { complete, isDone } = useOnboarding(storageKey);
 * complete("profile");
 */

export interface OnboardingTask {
  id: string;
  label: string;
  href?: string;
}

interface OnboardingContextValue {
  storageKey: string;
  done: Set<string>;
  complete: (id: string) => void;
  isDone: (id: string) => boolean;
}

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null);

function useCtx() {
  const ctx = React.useContext(OnboardingContext);
  if (!ctx)
    throw new Error("OnboardingChecklist parts must be used inside <OnboardingChecklist>");
  return ctx;
}

/** Programmatic access to the same persisted state the checklist renders. */
export function useOnboarding(storageKey: string) {
  const done = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(`onboarding:${storageKey}`);
      return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set<string>();
    }
  }, [storageKey]);
  // live re-read on every render pass via event, keeps hook + card in sync
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (detail.key === storageKey) {
        // force re-render by mutating a copy
        done.clear();
        try {
          const raw = localStorage.getItem(`onboarding:${storageKey}`);
          (JSON.parse(raw ?? "[]") as string[]).forEach((id) => done.add(id));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("onboarding-change", handler);
    return () => window.removeEventListener("onboarding-change", handler);
  }, [storageKey, done]);

  const complete = React.useCallback(
    (id: string) => {
      try {
        const raw = localStorage.getItem(`onboarding:${storageKey}`);
        const arr = new Set<string>((JSON.parse(raw ?? "[]") as string[]));
        arr.add(id);
        localStorage.setItem(
          `onboarding:${storageKey}`,
          JSON.stringify([...arr]),
        );
      } catch {
        /* ignore */
      }
      window.dispatchEvent(
        new CustomEvent("onboarding-change", { detail: { key: storageKey } }),
      );
    },
    [storageKey],
  );

  const isDone = React.useCallback((id: string) => done.has(id), [done]);
  return { complete, isDone };
}

export function OnboardingChecklist({
  storageKey,
  title = "Get started",
  className,
  children,
}: {
  storageKey: string;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = React.useState(false);
  const [done, setDone] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    try {
      if (localStorage.getItem(`onboarding-dismissed:${storageKey}`) === "1")
        setDismissed(true);
      const raw = localStorage.getItem(`onboarding:${storageKey}`);
      if (raw) setDone(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
    const handler = () => {
      try {
        const raw = localStorage.getItem(`onboarding:${storageKey}`);
        if (raw) setDone(new Set(JSON.parse(raw) as string[]));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("onboarding-change", handler);
    return () => window.removeEventListener("onboarding-change", handler);
  }, [storageKey]);

  if (dismissed) return null;

  const tasks = React.Children.toArray(children) as React.ReactElement[];
  const total = tasks.length;
  const completeCount = tasks.filter((t) => done.has(t.props.id)).length;
  const pct = total === 0 ? 0 : Math.round((completeCount / total) * 100);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(`onboarding-dismissed:${storageKey}`, "1");
    } catch {
      /* ignore */
    }
  };

  // progress ring
  const R = 12;
  const C = 2 * Math.PI * R;

  return (
    <OnboardingContext.Provider
      value={{
        storageKey,
        done,
        complete: (id: string) => {
          try {
            const raw = localStorage.getItem(`onboarding:${storageKey}`);
            const arr = new Set<string>(JSON.parse(raw ?? "[]") as string[]);
            arr.add(id);
            localStorage.setItem(
              `onboarding:${storageKey}`,
              JSON.stringify([...arr]),
            );
          } catch {
            /* ignore */
          }
          window.dispatchEvent(
            new CustomEvent("onboarding-change", { detail: { key: storageKey } }),
          );
        },
        isDone: (id: string) => done.has(id),
      }}
    >
      <div
        className={cn(
          "relative rounded-lg border bg-card p-4 shadow-sm",
          className,
        )}
      >
        <button
          aria-label="Dismiss onboarding"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="size-4" />
        </button>

        <div className="mb-3 flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
            <circle cx="16" cy="16" r={R} fill="none" strokeWidth="3" className="stroke-muted" />
            <circle
              cx="16"
              cy="16"
              r={R}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-primary transition-all duration-500"
              strokeDasharray={C}
              strokeDashoffset={C - (pct / 100) * C}
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {completeCount} of {total} complete
            </p>
          </div>
        </div>

        <ul className="space-y-1">{children}</ul>
      </div>
    </OnboardingContext.Provider>
  );
}

export function OnboardingTask({
  id,
  label,
  href,
}: {
  id: string;
  label: string;
  href?: string;
}) {
  const { done, complete } = useCtx();
  const isDone = done.has(id);

  return (
    <li
      className={cn(
        "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50",
        isDone && "text-muted-foreground",
      )}
    >
      <button
        type="button"
        onClick={() => complete(id)}
        className="flex items-center gap-2 text-left"
      >
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-full border",
            isDone ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
          )}
        >
          {isDone && (
            <svg viewBox="0 0 8 8" className="size-2 fill-current">
              <path d="M3.1 6.2 1 4.1l.9-.9 1.2 1.2L5.9 1.5l.9.9z" />
            </svg>
          )}
        </span>
        <span className={cn(isDone && "line-through opacity-70")}>{label}</span>
      </button>
      {href && !isDone && (
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
          <a href={href}>Open</a>
        </Button>
      )}
    </li>
  );
}
