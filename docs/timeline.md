# Timeline

Vertical event timeline with status dots (success, error, pending) and timestamps.

## Usage

```tsx
<Timeline>
  <TimelineItem title="Deploy started" timestamp="12:01" />
  <TimelineItem status="success" title="Build passed" timestamp="12:04" />
  <TimelineItem status="error" title="Smoke test failed" timestamp="12:06" />
</Timeline>
```

## Props

| Prop | Type | Description |
|---|---|---|
| `status` | `'default' | 'success' | 'error' | 'pending'` | Dot style per item |
| `title` | `ReactNode` | Item title |
| `timestamp` | `ReactNode` | Right-aligned time |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/timeline.json"
```
