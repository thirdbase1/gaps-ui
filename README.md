# gaps-ui

**The components shadcn/ui is missing.** A free, open-source [shadcn registry](https://ui.shadcn.com/docs/registry) of the components every product needs but no registry ships well: empty states, multi-step wizards, saved filter views, onboarding checklists, file uploaders with previews, and a command palette that knows your saved views.

Composable, accessible, built on Radix + Tailwind — the same primitives shadcn/ui uses. Copy the code into your project, own it forever. MIT.

## Why

shadcn/ui gives you the primitives (button, dialog, command…), and registries like [Kibo UI](https://kibo-ui.com) cover complex widgets. But there's a long tail of *product-level* components every app builds ad-hoc, badly, five times. gaps-ui ships those — production-quality, zero lock-in, in the exact shadcn registry format.

## Components

| Component | What it does |
|---|---|
| `empty-state` | Centered placeholder for empty lists/tables/search, with icon, title, description, actions |
| `wizard-form` | Multi-step form shell: step rail, per-step validation, animated transitions, finish state |
| `saved-views` | Filter bar with named, persistable views — combine chips, save, switch |
| `onboarding-checklist` | Dismissable get-started card with progress ring + programmatic `complete()` hook |
| `preview-uploader` | File input with thumbnails, pdf detection, size formatting, reject reasons, drag-drop |
| `command-palette-views` | cmdk palette with a "Views" group — jump straight to saved filters (Ctrl/Cmd+K hook included) |
| `import-wizard` | CSV import: 3 steps (upload → map columns with auto-detect → review), dependency-free parser, per-row validation, invalid rows skipped |
| `share-dialog` | Copy-link dialog with clipboard fallback, invite-by-email with roles, member list |

## Install

Using the shadcn CLI from your project root:

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/empty-state.json"
```

Or add everything:

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/registry.json"
```

Components land in your `components/` folder as regular code. `@/lib/utils` (the shadcn `cn` helper) and the listed shadcn dependencies are expected to exist — the CLI installs them for you.

## Usage

```tsx
import {
  EmptyState, EmptyStateIcon, EmptyStateTitle,
  EmptyStateDescription, EmptyStateActions,
} from "@/components/empty-state";

<EmptyState>
  <EmptyStateIcon><Inbox /></EmptyStateIcon>
  <EmptyStateTitle>No projects yet</EmptyStateTitle>
  <EmptyStateDescription>Create your first project to get started.</EmptyStateDescription>
  <EmptyStateActions><Button>Create project</Button></EmptyStateActions>
</EmptyState>
```

Each component folder contains full JSDoc usage docs at the top of the file.

## Principles

1. **Copy, not depend** — the shadcn model: the code becomes yours. No version churn.
2. **Radix + Tailwind only** — no new runtime dependencies beyond what shadcn already gives you.
3. **Product-level, not primitive-level** — we ship the things you'd otherwise hand-roll in every app.
4. **Accessible by default** — roles, keyboard handling, aria labels included.

## Roadmap

- [ ] `data-table-views` — saved views wired into TanStack Table
- [x] `import-wizard` — CSV import with column mapping + validation
- [x] `share-dialog` — permission picker with invite-by-email flow
- [ ] `diff-view` — before/after field comparison for admin/audit UIs

## License

MIT
