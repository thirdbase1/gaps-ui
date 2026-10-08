"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Minus } from "lucide-react";

/**
 * OTPInput — one-time-code input: N boxes, auto-advance, paste support,
 * arrow-key navigation, and a completion callback. Paste of a full code
 * fills every box at once.
 *
 * <OTPInput length={6} onComplete={(code) => verify(code)} />
 */

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  groupSize = 3,
  disabled,
  autoFocus = true,
  className,
}: {
  length?: number;
  value?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  /** Boxes per visual group; a dash renders between groups. 0 = no groups. */
  groupSize?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState("");
  const code = controlled ? value! : internal;
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const setAt = (i: number, ch: string) => {
    const next = (code.padEnd(length, " ").substring(0, i) + ch + code.padEnd(length, " ").substring(i + 1)).replace(/ /g, "").slice(0, length);
    // rebuild with per-index tracking: simpler — treat code as dense string
    if (!controlled) setInternal(next);
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
    return next;
  };

  const charAt = (i: number) => (i < code.length ? code[i] : "");

  const handle = (i: number, raw: string) => {
    const chars = raw.replace(/[^0-9a-zA-Z]/g, "");
    if (!chars) return;
    if (chars.length > 1) {
      // paste
      const pasted = chars.slice(0, length);
      if (!controlled) setInternal(pasted);
      onChange?.(pasted);
      if (pasted.length === length) onComplete?.(pasted);
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
      return;
    }
    const next = setAt(i, chars);
    if (i < length - 1) refs.current[i + 1]?.focus();
    else refs.current[length - 1]?.blur();
    void next;
  };

  const groups: number[][] = [];
  if (groupSize > 0) {
    for (let i = 0; i < length; i += groupSize) {
      groups.push(Array.from({ length: Math.min(groupSize, length - i) }, (_, k) => i + k));
    }
  } else {
    groups.push(Array.from({ length }, (_, i) => i));
  }

  return (
    <div className={cn("flex items-center gap-2", className)} role="group" aria-label="Verification code">
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <Minus className="size-4 text-muted-foreground" aria-hidden />}
          <div className="flex gap-1.5">
            {g.map((i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                disabled={disabled}
                autoFocus={autoFocus && i === 0}
                aria-label={`Digit ${i + 1}`}
                value={charAt(i)}
                onChange={(e) => handle(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    if (charAt(i)) {
                      const next = code.slice(0, i) + code.slice(i + 1);
                      if (!controlled) setInternal(next);
                      onChange?.(next);
                    } else if (i > 0) {
                      refs.current[i - 1]?.focus();
                      const next = code.slice(0, i - 1);
                      if (!controlled) setInternal(next);
                      onChange?.(next);
                    }
                  }
                  if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
                  if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
                }}
                onFocus={(e) => e.currentTarget.select()}
                className={cn(
                  "size-10 rounded-md border border-input bg-transparent text-center text-sm font-medium",
                  "focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
