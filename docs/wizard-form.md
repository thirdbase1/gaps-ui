# WizardForm

Multi-step form shell with a step rail, per-step validation and submitting state.

## Usage

```tsx
<WizardForm steps={[{ id: "a", title: "Account" }, { id: "b", title: "Review" }]} onFinish={submit}>
  <WizardStep stepId="a">{/* fields */}</WizardStep>
  <WizardStep stepId="b">{/* review */}</WizardStep>
</WizardForm>
```

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/wizard-form.json"
```
