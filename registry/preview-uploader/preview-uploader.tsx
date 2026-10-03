"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, X } from "lucide-react";

/**
 * PreviewUploader — file input with thumbnail previews, image/pdf
 * detection, size formatting, per-file remove buttons and reject reasons
 * for invalid type/size. Controlled or uncontrolled.
 *
 * <PreviewUploader
 *   accept="image/*,application/pdf"
 *   maxSizeMb={10}
 *   onFilesSelected={(files) => upload(files)}
 * />
 */

export interface PreviewFile {
  id: string;
  file: File;
  previewUrl?: string; // images only
  error?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PreviewUploader({
  accept,
  maxSizeMb,
  multiple = true,
  onFilesSelected,
  className,
}: {
  accept?: string;
  /** Max size per file in MB; oversized files get a reject reason. */
  maxSizeMb?: number;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [items, setItems] = React.useState<PreviewFile[]>([]);
  const [dragOver, setDragOver] = React.useState(false);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next: PreviewFile[] = [];
    for (const file of Array.from(fileList)) {
      let error: string | undefined;
      if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
        error = `Too large (max ${maxSizeMb} MB)`;
      }
      const isImage = file.type.startsWith("image/");
      next.push({
        id: `${file.name}_${file.size}_${Date.now().toString(36)}`,
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        error,
      });
    }
    setItems((prev) => {
      const merged = multiple ? [...prev, ...next] : next.slice(0, 1);
      // revoke unselected previews
      const kept = new Set(merged.map((i) => i.id));
      prev.forEach((p) => {
        if (p.previewUrl && !kept.has(p.id)) URL.revokeObjectURL(p.previewUrl);
      });
      return merged;
    });
    onFilesSelected?.(next.filter((n) => !n.error).map((n) => n.file));
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  React.useEffect(() => {
    // revoke previews on unmount
    return () => {
      itemsRef.current.forEach((i) => {
        if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const itemsRef = React.useRef<PreviewFile[]>([]);
  itemsRef.current = items;

  const hasErrors = items.some((i) => i.error);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Add files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors",
          dragOver && "border-primary bg-primary/5",
        )}
      >
        <span className="font-medium text-foreground">
          Click to upload or drag files here
        </span>
        {maxSizeMb && <span className="text-xs">Max {maxSizeMb} MB per file</span>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "group relative flex flex-col gap-1.5 rounded-md border p-2",
                item.error && "border-destructive/50 bg-destructive/5",
              )}
            >
              <button
                aria-label={`Remove ${item.file.name}`}
                onClick={() => remove(item.id)}
                className="absolute right-1 top-1 rounded-sm bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
              <div className="flex h-16 items-center justify-center overflow-hidden rounded bg-muted">
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : item.file.type === "application/pdf" ? (
                  <FileText className="size-6 text-muted-foreground" />
                ) : (
                  <ImageIcon className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium" title={item.file.name}>
                  {item.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(item.file.size)}
                </p>
                {item.error && (
                  <p className="text-xs text-destructive">{item.error}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasErrors && (
        <p className="text-xs text-destructive">
          Some files were rejected — remove them before uploading.
        </p>
      )}
    </div>
  );
}
