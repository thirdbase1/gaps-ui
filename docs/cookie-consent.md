# CookieConsent

Cookie consent banner with accept/reject/custom categories, persisted decision and a useConsent hook.

## Usage

```tsx
<CookieConsent
  categories={[{ id: "analytics", label: "Analytics" }]}
  onDecision={(d) => analytics.setConsent(d)}
/>
```

## Props

| Prop | Type | Description |
|---|---|---|
| `categories` | `ConsentCategory[]` | Optional granular categories |
| `onDecision` | `(d: ConsentDecision) => void` | Called with the user's choice |
| `position` | `'bottom' | 'bottom-right'` | Placement (default bottom) |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/cookie-consent.json"
```
