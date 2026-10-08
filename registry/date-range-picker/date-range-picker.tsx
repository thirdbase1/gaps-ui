"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

/**
 * DateRangePicker — a from/to date range picker built on the shadcn Calendar
 * with quick presets. Controlled or uncontrolled.
 *
 * <DateRangePicker value={range} onChange={setRange} presets />
 */

export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

function presetRange(days: number): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  presets = true,
  className,
  disabled,
}: {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  presets?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const [internal, setInternal] = React.useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [open, setOpen] = React.useState(false);
  const range = value ?? internal;

  const set = (r: DateRange | undefined) => {
    if (!value) setInternal(r);
    onChange?.(r ?? { from: undefined, to: undefined });
  };

  const label = range?.from
    ? range.to
      ? `${format(range.from, "LLL dd, y")} – ${format(range.to, "LLL dd, y")}`
      : format(range.from, "LLL dd, y")
    : placeholder;

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "justify-start text-left font-normal",
              !range?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(v: unknown) => set(v as DateRange)}
            numberOfMonths={2}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {presets && (
        <div className="flex gap-1">
          {([7, 30, 90] as const).map((d) => (
            <Button
              key={d}
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => set(presetRange(d))}
            >
              {d}d
            </Button>
          ))}
        </div>
      )}
      {range?.from && (
        <Button variant="ghost" size="sm" disabled={disabled} onClick={() => set(undefined)}>
          Clear
        </Button>
      )}
    </div>
  );
}
