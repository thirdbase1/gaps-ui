# ImportWizard

CSV import in 3 steps: upload, column mapping with auto-detect, review with per-row validation. Dependency-free parser included.

## Usage

```tsx
<ImportWizard
  fields={[
    { id: "email", label: "Email", required: true, validate: (v) => v.includes("@") || "Invalid email" },
  ]}
  onImport={(rows) => api.import(rows)}
/>
```

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/import-wizard.json"
```
