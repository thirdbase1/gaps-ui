"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Bookmark } from "lucide-react";

/**
 * CommandPaletteViews — a command palette (built on shadcn's Command /
 * cmdk) extended with a "Views" group: named filter snapshots users can
 * jump straight into. Register views statically or update them as state.
 *
 * <CommandPaletteViews
 *   open={open} onOpenChange={setOpen}
 *   views={[
 *     { id: "urgent", name: "Urgent orders", filters: { status: "open", priority: "high" } },
 *   ]}
 *   onViewSelect={(view) => applyFilters(view.filters)}
 *   actions={[{ id: "new", label: "Create order…", run: () => openDialog() }]}
 * />
 */

export interface PaletteView {
  id: string;
  name: string;
  /** Opaque snapshot your app interprets on select. */
  filters: Record<string, string>;
}

export interface PaletteAction {
  id: string;
  label: string;
  run: () => void;
}

export function CommandPaletteViews({
  open,
  onOpenChange,
  views = [],
  onViewSelect,
  actions = [],
  placeholder = "Type a command or search…",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  views?: PaletteView[];
  onViewSelect?: (view: PaletteView) => void;
  actions?: PaletteAction[];
  placeholder?: string;
  /** Extra command groups rendered after actions (any Command* nodes). */
  children?: React.ReactNode;
}) {
  const select = React.useCallback(
    (view: PaletteView) => {
      onViewSelect?.(view);
      onOpenChange(false);
    },
    [onViewSelect, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        {views.length > 0 && (
          <>
            <CommandGroup heading="Views">
              {views.map((view) => (
                <CommandItem
                  key={view.id}
                  value={`view ${view.name}`}
                  onSelect={() => select(view)}
                  className="gap-2"
                >
                  <Bookmark className="size-4 text-muted-foreground" />
                  <span>{view.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {actions.length > 0 && (
          <CommandGroup heading="Actions">
            {actions.map((action) => (
              <CommandItem
                key={action.id}
                value={action.label}
                onSelect={() => {
                  action.run();
                  onOpenChange(false);
                }}
              >
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {children}
        <CommandEmpty>No results found.</CommandEmpty>
      </CommandList>
    </CommandDialog>
  );
}

/** Convenience hook: Ctrl/Cmd+K to toggle the palette. */
export function useCommandPaletteHotkey(
  onOpenChange: (open: boolean) => void,
) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onOpenChange]);
}

