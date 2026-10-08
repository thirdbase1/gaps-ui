# Banner

Full-width announcement/alert strip with tone variants and dismissable persistence.

## Usage

```tsx
<Banner tone="warning" dismissKey="maintenance">Scheduled maintenance Sunday 02:00 UTC.</Banner>
```

## Props

| Prop | Type | Description |
|---|---|---|
| `tone` | `'info' | 'success' | 'warning' | 'error'` | Visual tone (default info) |
| `dismissKey` | `string` | localStorage key; enabling adds a dismiss button |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/banner.json"
```
