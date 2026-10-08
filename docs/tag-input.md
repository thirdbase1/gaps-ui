# TagInput

Chips input with suggestions, max tags, validation and Backspace removal.

## Usage

```tsx
<TagInput value={tags} onChange={setTags} suggestions={allTags} maxTags={10} />
```

## Props

| Prop | Type | Description |
|---|---|---|
| `value` | `string[]` | Current tags |
| `onChange` | `(tags: string[]) => void` | Change callback |
| `suggestions` | `string[]` | Suggested tags shown while typing |
| `maxTags` | `number` | Upper bound |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/tag-input.json"
```
