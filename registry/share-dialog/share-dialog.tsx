"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Copy, Link2, Loader2, Mail, X } from "lucide-react";

/**
 * ShareDialog — "share this thing" dialog for collaborative objects
 * (documents, projects, lists): copyable link with copy-to-clipboard,
 * invite-by-email list, and a permission picker per invite. Pure UI —
 * you wire the copy + send handlers to your backend.
 *
 * <ShareDialog
 *   shareUrl={`https://app.example.com/p/${token}`}
 *   onSendInvites={(invites) => api.invite(invites)}
 *   existingMembers={[{ email: "a@b.co", role: "editor" }]}
 * />
 */

export type ShareRole = "viewer" | "editor" | "admin";

export interface ShareInvite {
  email: string;
  role: ShareRole;
}

export interface ShareMember {
  email: string;
  role: ShareRole;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ShareDialog({
  shareUrl,
  onSendInvites,
  existingMembers = [],
  roles = ["viewer", "editor", "admin"] as ShareRole[],
  trigger,
  title = "Share",
  description = "Invite people or share a link.",
  className,
  children,
}: {
  shareUrl: string;
  onSendInvites?: (invites: ShareInvite[]) => Promise<void> | void;
  /** Already-member emails render in the list (and are rejected from invites). */
  existingMembers?: ShareMember[];
  roles?: ShareRole[];
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<ShareRole>("viewer");
  const [invites, setInvites] = React.useState<ShareInvite[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const memberEmails = new Set(existingMembers.map((m) => m.email.toLowerCase()));

  const addEmail = () => {
    const value = email.trim().toLowerCase();
    setError(null);
    if (!value) return;
    if (!EMAIL_RE.test(value)) {
      setError("That doesn't look like an email address.");
      return;
    }
    if (memberEmails.has(value)) {
      setError("Already a member.");
      return;
    }
    if (invites.some((i) => i.email === value)) {
      setError("Already added.");
      return;
    }
    setInvites((prev) => [...prev, { email: value, role }]);
    setEmail("");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // clipboard API unavailable (insecure context) — fall back
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const send = async () => {
    if (!onSendInvites || invites.length === 0) return;
    setSending(true);
    setError(null);
    try {
      await onSendInvites(invites);
      setSent(true);
      setInvites([]);
      window.setTimeout(() => setSent(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sending failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Link2 className="size-4" /> Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* link section */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Anyone with the link can access
          </Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="h-9 font-mono text-xs"
            />
            <Button size="sm" className="h-9 gap-1" onClick={copyLink}>
              {copied ? (
                <>
                  <Check className="size-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* invite section */}
        {onSendInvites && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Invite by email
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmail();
                  }
                }}
                placeholder="teammate@company.com"
                className="h-9"
              />
              <select
                aria-label="Permission"
                value={role}
                onChange={(e) => setRole(e.target.value as ShareRole)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={addEmail}
              >
                Add
              </Button>
            </div>

            {invites.length > 0 && (
              <ul className="space-y-1.5 rounded-md border p-2">
                {invites.map((inv) => (
                  <li
                    key={inv.email}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{inv.email}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <Badge variant="secondary">{inv.role}</Badge>
                      <button
                        aria-label={`Remove ${inv.email}`}
                        onClick={() =>
                          setInvites((prev) =>
                            prev.filter((p) => p.email !== inv.email),
                          )
                        }
                        className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full gap-1.5"
              onClick={send}
              disabled={invites.length === 0 || sending}
            >
              {sending && <Loader2 className="size-4 animate-spin" />}
              {sent ? (
                <>
                  <Check className="size-4" /> Sent
                </>
              ) : (
                `Send ${invites.length > 0 ? `${invites.length} invite${invites.length > 1 ? "s" : ""}` : "invites"}`
              )}
            </Button>
          </div>
        )}

        {/* existing members */}
        {existingMembers.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {existingMembers.length} member{existingMembers.length > 1 ? "s" : ""}
            </Label>
            <ul className="max-h-32 space-y-1 overflow-y-auto">
              {existingMembers.map((m) => (
                <li
                  key={m.email}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate text-muted-foreground">{m.email}</span>
                  <Badge variant="outline">{m.role}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {children}
      </DialogContent>
    </Dialog>
  );
}
