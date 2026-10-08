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

// Real backend — same origin as this page.
const api = {
  importRows: async (fileName, rows, skipped) => {
    const r = await fetch("/api/imports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fileName, rows, skipped }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Import failed");
    return r.json();
  },
  listImports: async () => (await fetch("/api/imports")).json(),
  createShare: async (payload) => {
    const r = await fetch("/api/shares", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Share failed");
    return r.json();
  },
};

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

function ImportsList() {
  const [imports, setImports] = React.useState([]);
  const [err, setErr] = React.useState(null);
  const refresh = React.useCallback(async () => {
    try { setImports(await api.listImports()); } catch (e) { setErr(e.message); }
  }, []);
  React.useEffect(() => { refresh(); const t = setInterval(refresh, 4000); return () => clearInterval(t); }, [refresh]);
  if (err) return <p className="text-sm text-red-400">Backend error: {err}</p>;
  if (imports.length === 0)
    return <EmptyState><EmptyStateIcon><span style={{fontSize:28}}>🗄️</span></EmptyStateIcon><EmptyStateTitle>No imports yet</EmptyStateTitle><EmptyStateDescription>Run the ImportWizard above — rows land in a real SQLite database on the server.</EmptyStateDescription></EmptyState>;
  return (
    <table className="w-full text-sm">
      <thead><tr className="text-left text-zinc-400">
        <th className="py-1.5 pr-3">File</th><th className="py-1.5 pr-3">Rows</th><th className="py-1.5 pr-3">Skipped</th><th className="py-1.5 pr-3">Columns</th><th className="py-1.5">When (UTC)</th>
      </tr></thead>
      <tbody>
        {imports.map((i) => (
          <tr key={i.id} className="border-t border-zinc-800">
            <td className="py-1.5 pr-3">{i.file_name}</td>
            <td className="py-1.5 pr-3">{i.row_count}</td>
            <td className="py-1.5 pr-3">{i.skipped}</td>
            <td className="py-1.5 pr-3 text-zinc-400">{i.columns.join(", ")}</td>
            <td className="py-1.5 text-zinc-400">{i.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function App() {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  useCommandPaletteHotkey(setPaletteOpen);
  const [importLog, setImportLog] = React.useState(null);
  const [importing, setImporting] = React.useState(false);
  const [importErr, setImportErr] = React.useState(null);
  const [lastShare, setLastShare] = React.useState(null);

  const doImport = async (rows) => {
    setImporting(true); setImportErr(null);
    try {
      const res = await api.importRows("playground-upload.csv", rows, 0);
      setImportLog(`Saved to server: import ${res.id} (${res.row_count} rows in SQLite)`);
    } catch (e) { setImportErr(e.message); }
    setImporting(false);
  };

  const sharePage = async () => {
    const res = await api.createShare({ resourceType: "playground", title: "gaps-ui playground", payload: { sharedAt: new Date().toISOString(), note: "Real share link — this URL works for anyone." } });
    setLastShare(res.url);
  };

  return (
    <div className="site">
      <header className="hero">
        <div className="hero-badge"><Sparkles /> 8 components · real backend · real persistence</div>
        <h1>gaps-ui</h1>
        <p className="hero-sub">The components shadcn/ui is missing — wired to a real server. Imports persist to SQLite, share links are real URLs. No fake actions.</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="https://github.com/thirdbase1/gaps-ui"><Github /> GitHub</a>
          <a className="btn" href="#empty-state">Browse demos ↓</a>
        </div>
        <nav className="toc">
          {["empty-state","wizard-form","saved-views","onboarding-checklist","preview-uploader","command-palette-views","import-wizard","imports","share-dialog"].map(n => (
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
            steps={[{ id: "account", title: "Account" }, { id: "workspace", title: "Workspace" }, { id: "review", title: "Review" }]}
            onFinish={() => new Promise(r => setTimeout(r, 800))}
          >
            <WizardStep stepId="account"><InputField label="Full name" required /><InputField label="Email" required /></WizardStep>
            <WizardStep stepId="workspace"><InputField label="Workspace name" required /></WizardStep>
            <WizardStep stepId="review"><p className="text-sm text-zinc-400">All good? Hit Finish — the button shows a spinner while "submitting".</p></WizardStep>
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

        <Section id="import-wizard" title="ImportWizard → real database" blurb="CSV import in 3 steps. Finishing writes the rows to SQLite on the server — check the Imports table below.">
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
              {importLog && <p className="text-sm text-green-400">{importLog}</p>}
              {importErr && <p className="text-sm text-red-400">{importErr}</p>}
              {importing && <p className="text-sm text-zinc-400">Writing to server…</p>}
            </div>
            <ImportWizard
              fields={[
                { id: "name", label: "Name", required: true },
                { id: "email", label: "Email", required: true, validate: (v) => v.includes("@") || "Invalid email" },
                { id: "plan", label: "Plan" },
              ]}
              onImport={doImport}
            />
          </div>
        </Section>

        <Section id="imports" title="Imports — server state" blurb="Live view of the real SQLite database backing this playground. Rows you import above appear here.">
          <ImportsList />
        </Section>

        <Section id="share-dialog" title="ShareDialog → real links" blurb="The dialog creates a real share token on the server and copies a URL that anyone can open.">
          <div className="center">
            <ShareDialog
              shareUrl={lastShare || "https://this-box.tunnel/s/…"}
              onSendInvites={async (invites) => {
                const res = await api.createShare({ resourceType: "invite", title: `Invite for ${invites.length} teammate(s)`, payload: { invites } });
                setLastShare(res.url);
              }}
              existingMembers={[{ email: "ada@example.com", role: "editor" }, { email: "grace@example.com", role: "viewer" }]}
            />
          </div>
          <div className="mt-4">
            <button className="btn" onClick={sharePage}>Create a real share link now</button>
            {lastShare && (
              <p className="hint mt-2">Last share URL: <a href={lastShare} target="_blank" rel="noreferrer">{lastShare}</a> — open it, it's real.</p>
            )}
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
