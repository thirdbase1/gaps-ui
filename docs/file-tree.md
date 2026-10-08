# FileTree

Hierarchical tree navigation with expand/collapse, folders, selection and per-node icons.

## Usage

```tsx
<FileTree
  nodes={[{ id: "src", label: "src", children: [{ id: "app.tsx", label: "app.tsx" }] }]}
  onSelect={(n) => open(n.id)}
/>
```

## Props

| Prop | Type | Description |
|---|---|---|
| `nodes` | `TreeNode[]` | Tree data |
| `defaultExpanded` | `string[]` | Initially open folder ids |
| `onSelect` | `(node: TreeNode) => void` | File selection callback |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/file-tree.json"
```
