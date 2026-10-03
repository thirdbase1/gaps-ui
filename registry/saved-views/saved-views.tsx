"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, Check, ChevronDown, X } from "lucide-react";

/**
 * SavedViews — a filter bar where users combine filter chips, save the
 * current set under a name, and switch between named views. Views persist
 * to localStorage under a storage key you control.
 *
 * <SavedViews
 *   storageKey="orders-views"
 *   chips={[
 *     { id: "status", label: "Status", options: ["open","shipped"] },
 *     { id: "region", label: "Region", options: ["eu","us"] },
 *   ]}
 *   onViewChange={(view) => fetchOrders(view.filters)}
 * />
 */

export interface FilterChipDef {
  id: string;
  label: string;
  options: string[];
}

export type Filters = Record<string, string>;

export interface SavedView {
  id: string;
  name: string;
  filters: Filters;
}

interface SavedViewsContextValue {
  filters: Filters;
  views: SavedView[];
  activeViewId: string | null;
  setFilter: (chipId: string, value: string | null) => void;
  saveCurrent: (name: string) => void;
  applyView: (id: string | null) => void;
  deleteView: (id: string) => void;
  chips: FilterChipDef[];
}

const SavedViewsContext = React.createContext<SavedViewsContextValue | null>(null);

function useSavedViews() {
  const ctx = React.useContext(SavedViewsContext);
  if (!ctx) throw new Error("SavedViews parts must be used inside <SavedViews>");
  return ctx;
}

export function SavedViews({
  chips,
  storageKey,
  onViewChange,
  className,
  children,
}: {
  chips: FilterChipDef[];
  storageKey: string;
  onViewChange?: (view: { filters: Filters; name: string | null }) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const [filters, setFilters] = React.useState<Filters>({});
  const [activeViewId, setActiveViewId] = React.useState<string | null>(null);
  const [views, setViews] = React.useState<SavedView[]>([]);
  const [saveName, setSaveName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // load views once
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(`saved-views:${storageKey}`);
      if (raw) setViews(JSON.parse(raw));
    } catch {
      /* corrupted storage — start empty */
    }
  }, [storageKey]);

  const persist = (next: SavedView[]) => {
    setViews(next);
    try {
      localStorage.setItem(`saved-views:${storageKey}`, JSON.stringify(next));
    } catch {
      /* storage full/unavailable — views stay in-memory */
    }
  };

  const emit = React.useCallback(
    (f: Filters, name: string | null) => {
      onViewChange?.({ filters: f, name });
    },
    [onViewChange],
  );

  const setFilter = (chipId: string, value: string | null) => {
    setActiveViewId(null); // diverging from a named view
    setFilters((prev) => {
      const next = { ...prev };
      if (value === null) delete next[chipId];
      else next[chipId] = value;
      emit(next, null);
      return next;
    });
  };

  const saveCurrent = (name: string) => {
    const view: SavedView = {
      id: `v_${Date.now().toString(36)}`,
      name,
      filters: { ...filters },
    };
    persist([...views, view]);
    setActiveViewId(view.id);
    setSaving(false);
    setSaveName("");
  };

  const applyView = (id: string | null) => {
    if (id === null) {
      setActiveViewId(null);
      setFilters({});
      emit({}, null);
      return;
    }
    const view = views.find((v) => v.id === id);
    if (!view) return;
    setActiveViewId(view.id);
    setFilters({ ...view.filters });
    emit({ ...view.filters }, view.name);
  };

  const deleteView = (id: string) => {
    const next = views.filter((v) => v.id !== id);
    persist(next);
    if (activeViewId === id) applyView(null);
  };

  const activeName = activeViewId
    ? views.find((v) => v.id === activeViewId)?.name ?? null
    : null;

  return (
    <SavedViewsContext.Provider
      value={{ filters, views, activeViewId, setFilter, saveCurrent, applyView, deleteView, chips }}
    >
      <div className={cn("space-y-3", className)}>
        <div className="flex flex-wrap items-center gap-2">
          {/* active view name */}
          {activeName && (
            <Badge variant="secondary" className="gap-1">
              <Bookmark className="size-3" /> {activeName}
            </Badge>
          )}

          {/* filter chips */}
          {chips.map((chip) => (
            <DropdownMenu key={chip.id}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  {chip.label}
                  {filters[chip.id] && (
                    <Badge variant="secondary" className="ml-1 px-1.5">
                      {filters[chip.id]}
                    </Badge>
                  )}
                  <ChevronDown className="size-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{chip.label}</DropdownMenuLabel>
                {chip.options.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => {
                      setFilter(chip.id, filters[chip.id] === opt ? null : opt);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        filters[chip.id] === opt ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {opt}
                  </DropdownMenuItem>
                ))}
                {filters[chip.id] && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilter(chip.id, null)}>
                      Clear
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {Object.keys(filters).length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => applyView(null)}>
              <X className="size-4" /> Clear all
            </Button>
          )}

          {/* save current */}
          {Object.keys(filters).length > 0 && (
            <div className="ml-auto flex items-center gap-1">
              {saving ? (
                <>
                  <input
                    autoFocus
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && saveName.trim()) saveCurrent(saveName.trim());
                      if (e.key === "Escape") setSaving(false);
                    }}
                    placeholder="View name…"
                    className="h-8 w-36 rounded-md border bg-background px-2 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveName.trim() && saveCurrent(saveName.trim())}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setSaving(true)}>
                  <Bookmark className="size-4" /> Save view
                </Button>
              )}
            </div>
          )}
        </div>

        {/* saved view switcher */}
        {views.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Views:</span>
            {views.map((v) => (
              <Badge
                key={v.id}
                variant={activeViewId === v.id ? "default" : "outline"}
                className="cursor-pointer gap-1"
                onClick={() => applyView(v.id)}
              >
                {v.name}
                <X
                  className="size-3 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteView(v.id);
                  }}
                />
              </Badge>
            ))}
          </div>
        )}

        {children}
      </div>
    </SavedViewsContext.Provider>
  );
}
