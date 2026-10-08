# NumberInput

Numeric input with steppers, min/max clamp, step, precision and keyboard arrows.

## Usage

```tsx
<NumberInput value={qty} onChange={setQty} min={0} max={99} suffix="pcs" />
```

## Props

| Prop | Type | Description |
|---|---|---|
| `value` | `number | null` | Current value |
| `onChange` | `(v: number | null) => void` | Change callback |
| `min / max` | `number` | Clamp bounds |
| `step` | `number` | Stepper increment (default 1) |
| `precision` | `number` | Decimal places to round to |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/number-input.json"
```
