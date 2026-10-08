# SavedViews

Filter chips with named views persisted to localStorage.

## Usage

```tsx
<SavedViews
  storageKey="orders"
  chips={[{ id: "status", label: "Status", options: ["open", "shipped"] }]}
  onViewChange={(v) => fetchOrders(v.filters)}
/>
```

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/saved-views.json"
```
