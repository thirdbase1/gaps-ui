"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";

/**
 * FileTree — hierarchical tree navigation with expand/collapse,
 * selected-file callback, and optional per-node icons.
 *
 * <FileTree
 *   nodes={[{ id: "src", label: "src", children: [{ id: "a.ts", label: "a.ts" }] }]}
 *   onSelect={(node) => open(node.id)}
 * />
 */

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

function Node({
  node,
  depth,
  selectedId,
  onSelect,
  expanded,
  toggle,
}: {
  node: TreeNode;
  depth: number;
  selectedId: string | null;
  onSelect?: (node: TreeNode) => void;
  expanded: Set<string>;
  toggle: (id: string) => void;
}) {
  const isFolder = !!node.children?.length;
  const open = expanded.has(node.id);
  const selected = selectedId === node.id;

  return (
    <li>
      <button
        type="button"
        onClick={() => (isFolder ? toggle(node.id) : onSelect?.(node))}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm",
          selected ? "bg-muted text-foreground" : "hover:bg-muted/60",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        aria-expanded={isFolder ? open : undefined}
      >
        {isFolder ? (
          open ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />
        ) : <span className="size-3.5" />}
        {isFolder ? (
          open ? <FolderOpen className="size-4 text-amber-400" /> : <Folder className="size-4 text-amber-400" />
        ) : <File className="size-4 text-muted-foreground" />}
        <span className="truncate">{node.label}</span>
      </button>
      {isFolder && open && node.children && (
        <ul role="group">
          {node.children.map((c) => (
            <Node key={c.id} node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} expanded={expanded} toggle={toggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({
  nodes,
  defaultExpanded = [],
  onSelect,
  className,
}: {
  nodes: TreeNode[];
  defaultExpanded?: string[];
  onSelect?: (node: TreeNode) => void;
  className?: string;
}) {
  const [expanded, setExpanded] = React.useState(new Set(defaultExpanded));
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ul role="tree" className={cn("space-y-0.5", className)}>
      {nodes.map((n) => (
        <Node
          key={n.id}
          node={n}
          depth={0}
          selectedId={selectedId}
          onSelect={(node) => { setSelectedId(node.id); onSelect?.(node); }}
          expanded={expanded}
          toggle={toggle}
        />
      ))}
    </ul>
  );
}
