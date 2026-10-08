# OnboardingChecklist

Dismissable getting-started checklist with progress and localStorage persistence.

## Usage

```tsx
<OnboardingChecklist storageKey="onboarding" title="Get started">
  <OnboardingTask id="invite" label="Invite a teammate" />
  <OnboardingTask id="repo" label="Connect a repo" href="/settings" />
</OnboardingChecklist>
```

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/onboarding-checklist.json"
```
