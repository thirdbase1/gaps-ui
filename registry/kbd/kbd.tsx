"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Kbd — renders a keyboard key or key combo in visual key-cap style.
 *
 * <Kbd>⌘</Kbd> <Kbd>K</Kbd> — or a combo: <Kbd keys={["mod", "shift", "P"]} />
 */

const MAC_SYMBOLS: Record<string, string> = {
  mod: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
  enter: "↵",
  backspace: "⌫",
  esc: "⎋",
  tab: "⇥",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

export function Kbd({
  children,
  keys,
  className,
}: {
  children?: React.ReactNode;
  /** Render a combo, e.g. ["mod", "K"]. Symbols adapt to platform. */
  keys?: string[];
  className?: string;
}) {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const render = (k: string) => {
    const key = k.toLowerCase();
    if (isMac && MAC_SYMBOLS[key]) return MAC_SYMBOLS[key];
    if (key === "mod") return isMac ? "⌘" : "Ctrl";
    if (key === "esc") return "Esc";
    return k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1);
  };

  if (keys) {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="inline-flex h-5 min-w-5 select-none items-center justify-center rounded border border-border bg-muted px-1 font-sans text-[11px] font-medium text-foreground"
          >
            {render(k)}
          </kbd>
        ))}
      </span>
    );
  }
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 select-none items-center justify-center rounded border border-border bg-muted px-1 font-sans text-[11px] font-medium text-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
