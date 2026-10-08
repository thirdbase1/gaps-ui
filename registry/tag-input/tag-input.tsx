"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

/**
 * TagInput — type and press Enter/comma to add chips; Backspace on an
 * empty input removes the last tag. Optional suggestion list.
 *
 * <TagInput value={tags} onChange={setTags} suggestions={["bug","feat"]} />
 */

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag…",
  suggestions = [],
  maxTags,
  validate,
  disabled,
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  /** Return true to accept, or an error string. */
  validate?: (tag: string) => true | string;
  disabled?: boolean;
  className?: string;
}) {
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,+$/, "");
    setError(null);
    if (!tag) return;
    if (maxTags !== undefined && value.length >= maxTags) { setError(`Max ${maxTags} tags.`); return; }
    if (value.includes(tag)) { setError("Already added."); return; }
    if (validate) {
      const res = validate(tag);
      if (res !== true) { setError(res); return; }
    }
    onChange([...value, tag]);
    setText("");
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const open = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(text.toLowerCase()) && text.length > 0,
  );

  return (
    <div className={cn("space-y-1", className)}>
      <div
        role="listbox"
        aria-label="Tags"
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={(e) => { e.stopPropagation(); remove(tag); }}
                className="rounded-sm hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={inputRef}
          disabled={disabled}
          value={text}
          placeholder={value.length === 0 ? placeholder : ""}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); }
            if (e.key === "Backspace" && !text && value.length > 0) remove(value[value.length - 1]);
          }}
          onBlur={() => add(text)}
          className="min-w-20 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {open.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {open.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
