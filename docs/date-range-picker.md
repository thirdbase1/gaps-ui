# DateRangePicker

From/to date range picker built on the shadcn Calendar with quick presets and clear.

## Usage

```tsx
const [range, setRange] = useState<DateRange>();
<DateRangePicker value={range} onChange={setRange} presets />
```

## Props

| Prop | Type | Description |
|---|---|---|
| `value` | `DateRange` | Controlled { from, to } |
| `onChange` | `(range: DateRange) => void` | Selection callback |
| `presets` | `boolean` | Show 7/30/90-day presets (default true) |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/date-range-picker.json"
```
