# CommandPaletteViews

cmdk command palette with a Views group and a Ctrl/Cmd+K hotkey hook.

## Usage

```tsx
const [open, setOpen] = useState(false);
useCommandPaletteHotkey(setOpen);
<CommandPaletteViews open={open} onOpenChange={setOpen} views={views} onViewSelect={jump} />
```

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/command-palette-views.json"
```
