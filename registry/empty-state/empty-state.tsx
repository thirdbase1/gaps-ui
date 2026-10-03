"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — centered placeholder for empty lists, tables and search
 * results. Composition-based so callers keep full control of markup.
 *
 * Usage:
 * <EmptyState>
 *   <EmptyState.Icon><InboxIcon /></EmptyState.Icon>
 *   <EmptyState.Title>No projects yet</EmptyState.Title>
 *   <EmptyState.Description>Create your first project to get started.</EmptyState.Description>
 *   <EmptyState.Actions>
 *     <Button>Create project</Button>
 *   </EmptyState.Actions>
 * </EmptyState>
 */
export function EmptyState({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyStateIcon({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyStateTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function EmptyStateDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("max-w-sm text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function EmptyStateActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-2 flex items-center gap-2", className)} {...props} />
  );
}
