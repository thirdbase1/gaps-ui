# ShareDialog

Share dialog with copy-link, invite-by-email with roles and a member list.

## Usage

```tsx
<ShareDialog
  shareUrl={url}
  onSendInvites={(invites) => api.invite(invites)}
  existingMembers={members}
/>
```

## Install

```bash
npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/share-dialog.json"
```
