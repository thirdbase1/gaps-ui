"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

/**
 * WizardForm — multi-step form shell with a step rail, per-step
 * validation, and back/next controls. You render each step's fields;
 * WizardForm handles step state, transition, and completion.
 *
 * const steps = [
 *   { id: "account", title: "Account", validate: () => errors.account === undefined },
 *   { id: "profile", title: "Profile" },
 *   { id: "done", title: "Review" },
 * ];
 * <WizardForm steps={steps} onFinish={submit}>
 *   <WizardForm.Step stepId="account">...</WizardForm.Step>
 *   <WizardForm.Step stepId="profile">...</WizardForm.Step>
 *   <WizardForm.Step stepId="done">...</WizardForm.Step>
 * </WizardForm>
 */

export interface WizardStepDef {
  id: string;
  title: string;
  /** Return true (or a promise) to allow advancing past this step. */
  validate?: () => boolean | Promise<boolean>;
}

interface WizardFormContextValue {
  currentStep: string;
  currentIndex: number;
  steps: WizardStepDef[];
  direction: "forward" | "back";
  completed: Set<string>;
  isSubmitting: boolean;
}

const WizardFormContext = React.createContext<WizardFormContextValue | null>(
  null,
);

function useWizard() {
  const ctx = React.useContext(WizardFormContext);
  if (!ctx) throw new Error("WizardForm parts must be used inside <WizardForm>");
  return ctx;
}

export function WizardForm({
  steps,
  onFinish,
  className,
  children,
}: {
  steps: WizardStepDef[];
  onFinish: () => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<"forward" | "back">("forward");
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const go = React.useCallback(
    async (delta: 1 | -1) => {
      setError(null);
      const next = index + delta;
      if (next < 0 || next >= steps.length) return;
      if (delta === 1) {
        const step = steps[index];
        if (step.validate) {
          try {
            const ok = await step.validate();
            if (!ok) {
              setError(`Step "${step.title}" is not valid yet.`);
              return;
            }
          } catch {
            setError(`Step "${step.title}" could not be validated.`);
            return;
          }
        }
        setCompleted((prev) => new Set(prev).add(step.id));
      }
      setDirection(delta === 1 ? "forward" : "back");
      setIndex(next);
    },
    [index, steps],
  );

  const handleFinish = React.useCallback(async () => {
    const last = steps[index];
    if (last?.validate) {
      const ok = await last.validate();
      if (!ok) {
        setError(`Step "${last.title}" is not valid yet.`);
        return;
      }
      setCompleted((prev) => new Set(prev).add(last.id));
    }
    setIsSubmitting(true);
    try {
      await onFinish();
    } finally {
      setIsSubmitting(false);
    }
  }, [index, steps, onFinish]);

  const isLast = index === steps.length - 1;

  return (
    <WizardFormContext.Provider
      value={{
        currentStep: steps[index].id,
        currentIndex: index,
        steps,
        direction,
        completed,
        isSubmitting,
      }}
    >
      <div className={cn("w-full max-w-2xl", className)}>
        {/* step rail */}
        <ol className="mb-6 flex items-center gap-2">
          {steps.map((step, i) => {
            const state =
              completed.has(step.id) || i < index
                ? "done"
                : i === index
                  ? "active"
                  : "todo";
            return (
              <li key={step.id} className="flex flex-1 items-center gap-2">
                <span
                  aria-current={state === "active" ? "step" : undefined}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    state === "done" &&
                      "bg-primary text-primary-foreground",
                    state === "active" &&
                      "border-2 border-primary text-primary",
                    state === "todo" &&
                      "border border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {state === "done" ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-sm sm:block",
                    state === "active"
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
                {i < steps.length - 1 && (
                  <span className="h-px flex-1 bg-border" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>

        {/* step body */}
        <div
          key={steps[index].id}
          className={cn(
            "animate-in",
            direction === "forward" ? "slide-in-from-right-4" : "slide-in-from-left-4",
          )}
        >
          {children}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* controls */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => go(-1)}
            disabled={index === 0 || isSubmitting}
          >
            <ChevronLeft className="size-4" /> Back
          </Button>
          {isLast ? (
            <Button type="button" onClick={handleFinish} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Finish
            </Button>
          ) : (
            <Button type="button" onClick={() => go(1)}>
              Next <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </WizardFormContext.Provider>
  );
}

export function WizardStep({
  stepId,
  children,
}: {
  stepId: string;
  children: React.ReactNode;
}) {
  const { currentStep } = useWizard();
  if (currentStep !== stepId) return null;
  return <div className="space-y-4">{children}</div>;
}
