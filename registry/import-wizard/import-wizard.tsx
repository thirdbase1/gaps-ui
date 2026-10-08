"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, Upload } from "lucide-react";

/**
 * ImportWizard — CSV import with column mapping, live preview and
 * per-row validation, in three steps: Upload → Map → Review & Import.
 * You own the parsing-free contract: hand it parsed rows, it handles the UX.
 *
 * <ImportWizard
 *   fields={[
 *     { id: "email", label: "Email", required: true, validate: (v) => v.includes("@") || "Invalid email" },
 *     { id: "name",  label: "Full name" },
 *   ]}
 *   onImport={(rows) => fetch("/api/import", { method: "POST", body: JSON.stringify(rows) })}
 * />
 *
 * Row shape after mapping: Record<fieldId, string>[].
 */

export interface ImportFieldDef {
  id: string;
  label: string;
  required?: boolean;
  /** Return true, or a string error message. */
  validate?: (value: string) => true | string;
}

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

/** Minimal RFC-4180-ish CSV parser (quotes, escaped quotes, CRLF). No deps. */
export function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, ""); // strip BOM
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  const headers = rows.shift() ?? [];
  return { headers, rows };
}

interface ImportWizardContextValue {
  step: 1 | 2 | 3;
  csv: ParsedCsv | null;
  mapping: Record<string, string | null>; // fieldId -> header
  mappedRows: Record<string, string>[];
  invalidRowIndexes: number[];
}

const ImportWizardContext = React.createContext<ImportWizardContextValue | null>(null);

function useImportWizard() {
  const ctx = React.useContext(ImportWizardContext);
  if (!ctx) throw new Error("ImportWizard parts must be used inside <ImportWizard>");
  return ctx;
}

export function ImportWizard({
  fields,
  onImport,
  maxRows = 5_000,
  className,
  children,
}: {
  fields: ImportFieldDef[];
  onImport: (rows: Record<string, string>[]) => void | Promise<void>;
  /** Guard-rail cap; rows beyond this are rejected at parse. */
  maxRows?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [csv, setCsv] = React.useState<ParsedCsv | null>(null);
  const [csvError, setCsvError] = React.useState<string | null>(null);
  const [mapping, setMapping] = React.useState<Record<string, string | null>>({});
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // auto-map on parse: exact/normalized header match
  const autoMap = React.useCallback(
    (headers: string[]) => {
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const next: Record<string, string | null> = {};
      for (const f of fields) {
        const hit =
          headers.find((h) => norm(h) === norm(f.id)) ??
          headers.find((h) => norm(h) === norm(f.label));
        next[f.id] = hit ?? null;
      }
      return next;
    },
    [fields],
  );

  const loadFile = async (file: File | undefined) => {
    setCsvError(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      if (file.size > 10 * 1024 * 1024) {
        setCsvError("File too large (max 10 MB).");
        return;
      }
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0) {
        setCsvError("No header row found.");
        return;
      }
      if (parsed.rows.length === 0) {
        setCsvError("No data rows found.");
        return;
      }
      if (parsed.rows.length > maxRows) {
        setCsvError(`Too many rows (${parsed.rows.length}); max is ${maxRows}.`);
        return;
      }
      setCsv(parsed);
      setMapping(autoMap(parsed.headers));
      setStep(2);
    } catch {
      setCsvError("Could not read the file.");
    }
  };

  const mappedRows = React.useMemo(() => {
    if (!csv) return [];
    const requiredMissing = fields.some((f) => f.required && !mapping[f.id]);
    if (requiredMissing) return [];
    return csv.rows.map((row) => {
      const out: Record<string, string> = {};
      for (const f of fields) {
        const h = mapping[f.id];
        const idx = h ? csv.headers.indexOf(h) : -1;
        out[f.id] = idx >= 0 ? (row[idx] ?? "").trim() : "";
      }
      return out;
    });
  }, [csv, mapping, fields]);

  const invalidRowIndexes = React.useMemo(() => {
    const bad: number[] = [];
    mappedRows.forEach((row, i) => {
      for (const f of fields) {
        const v = row[f.id] ?? "";
        if (f.required && !v) {
          bad.push(i);
          break;
        }
        if (v && f.validate) {
          const res = f.validate(v);
          if (res !== true) {
            bad.push(i);
            break;
          }
        }
      }
    });
    return bad;
  }, [mappedRows, fields]);

  const goStep3 = () => {
    if (!csv) return;
    const requiredMissing = fields.some((f) => f.required && !mapping[f.id]);
    if (requiredMissing) return;
    setStep(3);
  };

  const runImport = async () => {
    setImporting(true);
    try {
      await onImport(mappedRows.filter((_, i) => !invalidRowIndexes.includes(i)));
      setDone(true);
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setCsv(null);
    setMapping({});
    setFileName(null);
    setDone(false);
    setCsvError(null);
  };

  const ctx: ImportWizardContextValue = {
    step,
    csv,
    mapping,
    mappedRows,
    invalidRowIndexes,
  };

  const requiredMissing = fields.some((f) => f.required && !mapping[f.id]);

  return (
    <ImportWizardContext.Provider value={ctx}>
      <div className={cn("w-full max-w-3xl space-y-4", className)}>
        {/* step indicator */}
        <ol className="flex items-center gap-2 text-sm">
          {(["Upload", "Map columns", "Review"] as const).map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            return (
              <li key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    step === n
                      ? "bg-primary text-primary-foreground"
                      : step > n
                        ? "bg-primary/15 text-primary"
                        : "border text-muted-foreground",
                  )}
                >
                  {step > n ? <Check className="size-3.5" /> : n}
                </span>
                <span className={cn(step === n ? "font-medium" : "text-muted-foreground")}>
                  {label}
                </span>
                {i < 2 && <span className="mx-1 h-px w-8 bg-border" aria-hidden />}
              </li>
            );
          })}
        </ol>

        {done ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <Check className="size-8 text-primary" />
            <p className="text-sm font-medium">Import complete.</p>
            <Button variant="outline" size="sm" onClick={reset}>
              Import another file
            </Button>
          </div>
        ) : step === 1 ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload CSV"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              loadFile(e.dataTransfer.files?.[0]);
            }}
            className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
          >
            <Upload className="mb-1 size-5" />
            <span className="font-medium text-foreground">
              Upload a CSV file
            </span>
            <span className="text-xs">
              First row must be headers · max {maxRows.toLocaleString()} rows
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => loadFile(e.target.files?.[0])}
            />
          </div>
        ) : null}

        {csvError && (
          <p role="alert" className="text-sm text-destructive">
            {csvError}
          </p>
        )}

        {/* step 2: mapping */}
        {!done && step === 2 && csv && (
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="size-4" /> {fileName} — {csv.rows.length.toLocaleString()} rows,
              {" "}{csv.headers.length} columns
            </p>
            <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm">
                    {f.label}
                    {f.required && <span className="text-destructive"> *</span>}
                  </span>
                  <span aria-hidden className="text-muted-foreground">←</span>
                  <Select
                    value={mapping[f.id] ?? ""}
                    onValueChange={(v: string) =>
                      setMapping((prev) => ({ ...prev, [f.id]: v || null }))
                    }
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Select column…" />
                    </SelectTrigger>
                    <SelectContent>
                      {csv.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {requiredMissing && (
              <p className="text-sm text-amber-600">
                Map every required field to continue.
              </p>
            )}
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  setCsv(null);
                }}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={goStep3} disabled={requiredMissing}>
                Continue <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* step 3: review */}
        {!done && step === 3 && csv && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <span>
                <strong className="font-semibold">
                  {(mappedRows.length - invalidRowIndexes.length).toLocaleString()}
                </strong>{" "}
                valid rows
              </span>
              {invalidRowIndexes.length > 0 && (
                <span className="text-destructive">
                  <strong className="font-semibold">
                    {invalidRowIndexes.length.toLocaleString()}
                  </strong>{" "}
                  will be skipped (invalid)
                </span>
              )}
            </div>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {fields.map((f) => (
                      <th key={f.id} className="px-3 py-2 text-left font-medium">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.slice(0, 5).map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-t",
                        invalidRowIndexes.includes(i) && "opacity-50",
                      )}
                    >
                      {fields.map((f) => (
                        <td key={f.id} className="max-w-48 truncate px-3 py-1.5">
                          {row[f.id] || <span className="text-muted-foreground">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing first 5 of {mappedRows.length.toLocaleString()} rows.
            </p>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={runImport} disabled={importing || mappedRows.length === invalidRowIndexes.length}>
                {importing && <Loader2 className="size-4 animate-spin" />}
                Import{" "}
                {(mappedRows.length - invalidRowIndexes.length).toLocaleString()} rows
              </Button>
            </div>
          </div>
        )}

        {children}
      </div>
    </ImportWizardContext.Provider>
  );
}
