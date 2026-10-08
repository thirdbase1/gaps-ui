import React from "react";
import { createRoot } from "react-dom/client";
import "./site.css";
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions } from "@/registry/empty-state/empty-state";
import { WizardForm, WizardStep } from "@/registry/wizard-form/wizard-form";
import { SavedViews } from "@/registry/saved-views/saved-views";
import { OnboardingChecklist, OnboardingTask, useOnboarding } from "@/registry/onboarding-checklist/onboarding-checklist";
import { PreviewUploader } from "@/registry/preview-uploader/preview-uploader";
import { CommandPaletteViews, useCommandPaletteHotkey } from "@/registry/command-palette-views/command-palette-views";
import { ImportWizard, parseCsv } from "@/registry/import-wizard/import-wizard";
import { ShareDialog } from "@/registry/share-dialog/share-dialog";
import { Github, Sparkles } from "./icons";

const SAMPLE_CSV = `name,email,plan,seats
Ada Lovelace,ada@example.com,pro,3
Grace Hopper,grace@example.com,free,1
broken,bad-email,pro,2
Alan Turing,alan@example.com,team,12
`;

function Section({ id, title, blurb, children }) {
  return (
    <section id={id} className="demo-section">
      <div className="demo-head">
        <h2>{title}</h2>
        <p>{blurb}</p>
        <a className="install-chip" href={`https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/${id}.json`}>
          npx shadcn add {id}
        </a>
      </div>
      <div className="demo-stage">{children}</div>
    </section>
  );
}

function InputField({ label, required }) {
  const [v, setV] = React.useState("");
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <input
        className="flex h-9 w-full rounded-md border border-zinc-700 bg-transparent px-3 text-sm"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
    </div>
  );
}

export function App() {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  useCommandPaletteHotkey(setPaletteOpen);

  return (
    <div className="site">
      <header className="hero">
        <div className="hero-badge"><Sparkles /> 8 components · official shadcn registry format</div>
        <h1>gaps-ui</h1>
        <p className="hero-sub">The components shadcn/ui is missing. Copy them into your project — no npm dependency, no version hell. Everything below is a live demo.</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="https://github.com/thirdbase1/gaps-ui"><Github /> GitHub</a>
          <a className="btn" href="#empty-state">Browse demos ↓</a>
        </div>
        <nav className="toc">
          {["empty-state","wizard-form","saved-views","onboarding-checklist","preview-uploader","command-palette-views","import-wizard","share-dialog"].map(n => (
            <a key={n} href={`#${n}`}>{n}</a>
          ))}
        </nav>
      </header>

      <main>
        <Section id="empty-state" title="EmptyState" blurb="A proper placeholder for empty lists and dashboards — composable icon, title, description, actions.">
          <EmptyState>
            <EmptyStateIcon><span style={{fontSize: 32}}>📭</span></EmptyStateIcon>
            <EmptyStateTitle>No projects yet</EmptyStateTitle>
            <EmptyStateDescription>Create your first project to start tracking work with your team.</EmptyStateDescription>
            <EmptyStateActions>
              <button className="btn btn-primary">New project</button>
              <button className="btn">Import</button>
            </EmptyStateActions>
          </EmptyState>
        </Section>

        <Section id="wizard-form" title="WizardForm" blurb="Multi-step form shell with a step rail, per-step validation, back/next controls and submitting state.">
          <WizardForm
            steps={[
              { id: "account", title: "Account" },
              { id: "workspace", title: "Workspace" },
              { id: "review", title: "Review" },
            ]}
            onFinish={() => new Promise(r => setTimeout(r, 800))}
          >
            <WizardStep stepId="account">
              <InputField label="Full name" required />
              <InputField label="Email" required />
            </WizardStep>
            <WizardStep stepId="workspace">
              <InputField label="Workspace name" required />
            </WizardStep>
            <WizardStep stepId="review">
              <p className="text-sm text-zinc-400">All good? Hit Finish — the button shows a spinner while "submitting".</p>
            </WizardStep>
          </WizardForm>
        </Section>

        <Section id="saved-views" title="SavedViews" blurb="Combine filter chips, save the set under a name, switch between views. Views persist to localStorage under your key.">
          <SavedViews
            storageKey="demo-orders"
            chips={[
              { id: "status", label: "Status", options: ["open", "shipped", "cancelled"] },
              { id: "region", label: "Region", options: ["eu", "us", "apac"] },
            ]}
            onViewChange={(view) => console.log("apply", view)}
          />
        </Section>

        <Section id="onboarding-checklist" title="OnboardingChecklist" blurb="Dismissable getting-started card with progress. Click tasks to complete; state persists across reloads.">
          <OnboardingChecklist storageKey="demo-onboarding" title="Get started">
            <OnboardingTask id="workspace" label="Create your workspace" />
            <OnboardingTask id="invite" label="Invite a teammate" />
            <OnboardingTask id="repo" label="Connect your first repo" href="#preview-uploader" />
          </OnboardingChecklist>
        </Section>

        <Section id="preview-uploader" title="PreviewUploader" blurb="Drag & drop with image thumbnails, PDF detection, size formatting and per-file reject reasons.">
          <PreviewUploader maxSizeMb={5} onFilesSelected={(files) => console.log("selected", files)} />
        </Section>

        <Section id="command-palette-views" title="CommandPaletteViews" blurb="cmdk palette with a Views group — jump straight to saved filters. It's live: press the hotkey.">
          <p className="hint">Press <kbd>Ctrl</kbd>+<kbd>K</kbd> (or <kbd>⌘</kbd>+<kbd>K</kbd>) anywhere on this page.</p>
          <CommandPaletteViews
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            views={[{ id: "1", name: "My open bugs" }, { id: "2", name: "This sprint" }]}
            onViewSelect={(v) => console.log("view", v)}
            actions={[
              { id: "new", name: "Create new project", run: () => alert("new project") },
              { id: "invite", name: "Invite teammate", run: () => alert("invite") },
            ]}
          />
        </Section>

        <Section id="import-wizard" title="ImportWizard" blurb="CSV import in 3 steps: upload → map columns (auto-detected) → review with per-row validation. Try the sample file.">
          <div className="split">
            <div>
              <p className="hint">Sample CSV — includes one invalid row to show validation:</p>
              <button className="btn" onClick={() => {
                const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "users.csv";
                a.click();
              }}>Download users.csv</button>
              <pre className="csv-pre">{SAMPLE_CSV}</pre>
            </div>
            <ImportWizard
              fields={[
                { id: "name", label: "Name", required: true },
                { id: "email", label: "Email", required: true, validate: (v) => v.includes("@") || "Invalid email" },
                { id: "plan", label: "Plan" },
              ]}
              onImport={async (rows) => { await new Promise(r => setTimeout(r, 600)); alert(`Imported ${rows.length} valid rows`); }}
            />
          </div>
        </Section>

        <Section id="share-dialog" title="ShareDialog" blurb="Copy-link with clipboard fallback, invite-by-email with roles, member list. Fully interactive.">
          <div className="center">
            <ShareDialog
              shareUrl="https://app.example.com/p/demo-token-8f3k"
              onSendInvites={async (invites) => { await new Promise(r => setTimeout(r, 900)); console.log("sent", invites); }}
              existingMembers={[{ email: "ada@example.com", role: "editor" }, { email: "grace@example.com", role: "viewer" }]}
            />
          </div>
        </Section>
      </main>

      <footer className="footer">
        <p>gaps-ui · MIT · <a href="https://github.com/thirdbase1/gaps-ui">github.com/thirdbase1/gaps-ui</a></p>
      </footer>
    </div>
  );
}

export function mount(el) {
  createRoot(el).render(<App />);
}
if (typeof document !== "undefined" && document.getElementById("root")) {
  mount(document.getElementById("root"));
}
