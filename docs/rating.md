# Rating

Interactive star rating with hover preview, keyboard arrows, partial fill and read-only mode.

## Usage

```tsx
<Rating value={rating} onChange={setRating} allowClear />
```

## Props

| Prop | Type | Description |
|---|---|---|
| `value` | `number` | Current rating |
| `onChange` | `(v: number) => void` | Change callback |
| `max` | `number` | Number of stars (default 5) |
| `readOnly` | `boolean` | Display-only mode |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/rating.json"
```
