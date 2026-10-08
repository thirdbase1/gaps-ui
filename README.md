# gaps-ui

**The components shadcn/ui is missing.** A free, open-source [shadcn registry](https://ui.shadcn.com/docs/registry) of the components every product needs but no registry ships well: empty states, multi-step wizards, saved filter views, onboarding checklists, file uploaders with previews, and a command palette that knows your saved views.

Composable, accessible, built on Radix + Tailwind — the same primitives shadcn/ui uses. Copy the code into your project, own it forever. MIT.

## Why

shadcn/ui gives you the primitives (button, dialog, command…), and registries like [Kibo UI](https://kibo-ui.com) cover complex widgets. But there's a long tail of *product-level* components every app builds ad-hoc, badly, five times. gaps-ui ships those — production-quality, zero lock-in, in the exact shadcn registry format.

## Components

| Component | What it does |
|---|---|
| `empty-state` | Composable placeholder for empty data: icon, title, description, actions |
| `wizard-form` | Multi-step form shell: step rail, per-step validation, submitting state |
| `saved-views` | Filter chips + named views persisted to localStorage |
| `onboarding-checklist` | Dismissable getting-started checklist with progress + persistence |
| `preview-uploader` | Drag & drop uploader: image thumbnails, PDF detection, reject reasons |
| `command-palette-views` | cmdk palette with a Views group + Ctrl/Cmd+K hook |
| `import-wizard` | CSV import: upload → column mapping (auto-detect) → review; dependency-free parser, per-row validation |
| `share-dialog` | Copy-link, invite-by-email with roles, member list |
| `date-range-picker` | From/to date range picker with quick presets, built on shadcn Calendar |
| `number-input` | Numeric stepper input with min/max clamp, precision, keyboard arrows |
| `otp-input` | One-time-code input: auto-advance, paste, grouped boxes, completion callback |
| `tag-input` | Chips input with suggestions, max tags, validation, Backspace removal |
| `rating` | Star rating: hover preview, keyboard, partial fill, read-only |
| `timeline` | Vertical event timeline with status dots + timestamps |
| `kbd` | Keyboard key caps with platform-aware symbols (⌘ vs Ctrl) |
| `file-tree` | Tree navigation: expand/collapse, selection, per-node icons |
| `cookie-consent` | Consent banner with accept/reject/custom categories + useConsent hook |
| `stepper-nav` | Horizontal progress stepper with clickable completed steps |
| `banner` | Announcement/alert strip with tones + persistent dismiss |
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

## Scaling

New components are added as JSON specs in `specs/` — `python3 tools/generate.py` then emits the registry JSONs, docs, and index. The registry grows in batches; every item is typechecked (strict tsc) before shipping.

## Playground

A real backend (Node + SQLite, zero deps) backs the live playground: imports persist, share links are real URLs. `node playground/server.mjs` → http://localhost:8899.
