# OTPInput

One-time-code input with auto-advance, paste support, grouped boxes and completion callback.

## Usage

```tsx
<OTPInput length={6} onComplete={(code) => verify(code)} />
```

## Props

| Prop | Type | Description |
|---|---|---|
| `length` | `number` | Number of code boxes (default 6) |
| `onComplete` | `(code: string) => void` | Called when all boxes are filled |
| `groupSize` | `number` | Boxes per visual group (default 3) |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/otp-input.json"
```
