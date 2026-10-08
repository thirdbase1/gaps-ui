# StepperNav

Horizontal progress stepper with clickable completed steps; pairs with WizardForm.

## Usage

```tsx
<StepperNav steps={["Cart", "Shipping", "Payment", "Done"]} current={2} onStepClick={go} />
```

## Props

| Prop | Type | Description |
|---|---|---|
| `steps` | `string[]` | Step labels |
| `current` | `number` | Current step index |
| `onStepClick` | `(i: number) => void` | Click handler for completed steps |

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/stepper-nav.json"
```
