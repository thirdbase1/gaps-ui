"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

/**
 * NumberInput — numeric input with stepper buttons, min/max clamp,
 * step support, and optional decimal precision. Works with a plain
 * string value so it composes with any form library.
 *
 * <NumberInput value={qty} onChange={setQty} min={0} max={99} step={1} />
 */

export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  precision,
  prefix,
  suffix,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Decimal places to round to on blur/step. */
  precision?: number;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const [text, setText] = React.useState(
    value === null ? "" : String(value),
  );
  const focused = React.useRef(false);

  React.useEffect(() => {
    if (!focused.current) setText(value === null ? "" : String(value));
  }, [value]);

  const clampRound = (n: number) => {
    let out = Math.min(max, Math.max(min, n));
    if (precision !== undefined) out = Number(out.toFixed(precision));
    return out;
  };

  const commit = (t: string) => {
    if (t.trim() === "") { onChange(null); return; }
    const n = Number(t);
    if (Number.isNaN(n)) return;
    onChange(clampRound(n));
  };

  const bump = (dir: 1 | -1) => {
    const base = value ?? clampRound(0);
    const next = clampRound(base + dir * step);
    onChange(next);
    setText(String(next));
  };

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-input bg-transparent",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease"
        disabled={disabled || value === null && min > 0}
        onClick={() => bump(-1)}
        className="flex h-full w-9 items-center justify-center rounded-l-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Minus className="size-3.5" />
      </button>
      <div className="flex h-full min-w-14 flex-1 items-center justify-center gap-1 px-1">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <input
          aria-label={ariaLabel}
          inputMode="decimal"
          disabled={disabled}
          value={text}
          onFocus={() => { focused.current = true; }}
          onBlur={() => {
            focused.current = false;
            commit(text);
            if (text.trim() !== "" && !Number.isNaN(Number(text)) && value !== null) {
              setText(String(value));
            }
          }}
          onChange={(e) => {
            setText(e.target.value);
            commit(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); bump(1); }
            if (e.key === "ArrowDown") { e.preventDefault(); bump(-1); }
          }}
          className="w-full bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <button
        type="button"
        aria-label="Increase"
        disabled={disabled}
        onClick={() => bump(1)}
        className="flex h-full w-9 items-center justify-center rounded-r-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
