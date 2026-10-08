#!/usr/bin/env node
/**
 * gaps-ui playground server — a REAL backend, not a demo.
 *
 * Real capabilities:
 *  - POST /api/imports   → stores uploaded rows in SQLite (real persistence)
 *  - GET  /api/imports   → lists past imports
 *  - GET  /api/imports/:id → one import with its rows
 *  - POST /api/shares    → creates a real share link (random token, stored)
 *  - GET  /s/:token      → the shared page (real, publicly reachable via tunnel)
 *  - GET  /api/shares/:token → share metadata
 *  - GET  /api/health
 *
 * Zero dependencies (node:sqlite is built into Node 22). Serves the built demo + a
 * real upload handling pipeline.
 */
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = "/home/agentuser/gaps-ui/playground";
const DIST = join(__dirname, "../demo/dist");
const DATA = join(__dirname, "data");
const PORT = Number(process.env.PORT || 8899);

// ---------- real SQLite persistence ----------
const db = new DatabaseSync(join(DATA, "playground.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS imports (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    skipped INTEGER NOT NULL DEFAULT 0,
    columns TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS import_rows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id TEXT NOT NULL REFERENCES imports(id),
    row_index INTEGER NOT NULL,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS shares (
    token TEXT PRIMARY KEY,
    resource_type TEXT NOT NULL,
    title TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const json = (res, code, body) => {
  const buf = Buffer.from(JSON.stringify(body));
  res.writeHead(code, { "content-type": "application/json", "content-length": buf.length });
  res.end(buf);
};

const readBody = (req, limit = 5 * 1024 * 1024) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error("Payload too large"), { code: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".csv": "text/csv",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  try {
    // ---------- health ----------
    if (path === "/api/health") return json(res, 200, { ok: true, ts: Date.now() });

    // ---------- imports: real persistence ----------
    if (path === "/api/imports" && req.method === "POST") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      const { fileName, rows, skipped = 0 } = body;
      if (!Array.isArray(rows) || !fileName) return json(res, 400, { error: "fileName and rows[] required" });
      const id = randomBytes(8).toString("hex");
      const columns = rows[0] ? Object.keys(rows[0]) : [];
      db.prepare("INSERT INTO imports (id, file_name, row_count, skipped, columns) VALUES (?, ?, ?, ?, ?)")
        .run(id, String(fileName).slice(0, 200), rows.length, skipped, JSON.stringify(columns));
      const ins = db.prepare("INSERT INTO import_rows (import_id, row_index, data) VALUES (?, ?, ?)");
      rows.forEach((r, i) => ins.run(id, i, JSON.stringify(r)));
      return json(res, 201, { id, row_count: rows.length, skipped });
    }
    if (path === "/api/imports" && req.method === "GET") {
      const rows = db.prepare("SELECT id, file_name, row_count, skipped, columns, created_at FROM imports ORDER BY created_at DESC LIMIT 100").all();
      return json(res, 200, rows.map(r => ({ ...r, columns: JSON.parse(r.columns) })));
    }
    const importMatch = path.match(/^\/api\/imports\/([a-f0-9]+)$/);
    if (importMatch && req.method === "GET") {
      const imp = db.prepare("SELECT * FROM imports WHERE id = ?").get(importMatch[1]);
      if (!imp) return json(res, 404, { error: "not found" });
      const rows = db.prepare("SELECT row_index, data FROM import_rows WHERE import_id = ? ORDER BY row_index").all(imp.id);
      return json(res, 200, { ...imp, columns: JSON.parse(imp.columns), rows: rows.map(r => JSON.parse(r.data)) });
    }

    // ---------- shares: real links ----------
    if (path === "/api/shares" && req.method === "POST") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      const { resourceType = "page", title = "Shared item", payload = {} } = body;
      const token = randomBytes(6).toString("base64url");
      db.prepare("INSERT INTO shares (token, resource_type, title, payload) VALUES (?, ?, ?, ?)")
        .run(token, String(resourceType).slice(0, 40), String(title).slice(0, 200), JSON.stringify(payload));
      const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
      return json(res, 201, { token, url: `${origin}/s/${token}` });
    }
    const shareMatch = path.match(/^\/api\/shares\/([\w-]+)$/);
    if (shareMatch && req.method === "GET") {
      const s = db.prepare("SELECT token, resource_type, title, payload, created_at FROM shares WHERE token = ?").get(shareMatch[1]);
      if (!s) return json(res, 404, { error: "not found" });
      return json(res, 200, { ...s, payload: JSON.parse(s.payload) });
    }

    // ---------- real shared page ----------
    const sPage = path.match(/^\/s\/([\w-]+)$/);
    if (sPage && req.method === "GET") {
      const s = db.prepare("SELECT * FROM shares WHERE token = ?").get(sPage[1]);
      if (!s) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("Share not found"); }
      const payload = JSON.stringify(JSON.parse(s.payload), null, 2);
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${s.title} · gaps-ui share</title>
<style>body{font-family:ui-sans-serif,system-ui;background:#0b0d10;color:#e6e8eb;margin:0;padding:48px 20px}
main{max-width:640px;margin:0 auto}h1{font-size:22px}.meta{color:#8b929c;font-size:13px;margin-bottom:24px}
pre{background:#12151a;border:1px solid #23272f;border-radius:10px;padding:16px;overflow:auto;font-size:12px}</style>
</head><body><main><h1>${s.title}</h1>
<p class="meta">Shared via gaps-ui playground · token <code>${s.token}</code> · ${s.created_at} UTC</p>
<pre>${payload.replace(/</g, "&lt;")}</pre></main></body></html>`;
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(html);
    }

    // ---------- static demo ----------
    if (req.method === "GET") {
      let file = normalize(join(DIST, path === "/" ? "index.html" : path));
      if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
      try {
        const st = await stat(file);
        if (st.isDirectory()) file = join(file, "index.html");
        const data = await readFile(file);
        res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
        return res.end(data);
      } catch { /* fallthrough to 404 */ }
    }
    json(res, 404, { error: "not found" });
  } catch (e) {
    json(res, e.code || 500, { error: e.message });
  }
});

server.listen(PORT, () => console.log(`gaps-ui playground on http://localhost:${PORT}`));
