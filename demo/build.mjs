import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import esbuild from "esbuild";
import postcss from "postcss";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";

const root = path.resolve(import.meta.dirname, "..");
const demo = path.join(root, "demo");
const outDir = path.join(demo, "dist");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// 1. Bundle TSX with esbuild (tailwind classes pass through; CSS handled below)
await esbuild.build({
  entryPoints: [path.join(demo, "src/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  jsx: "automatic",
  outfile: path.join(outDir, "bundle.js"),
  alias: {
    "@": root,
    "@/lib": path.join(demo, "lib"),
    "@/components/ui": path.join(demo, "shadcn-ui"),
  },
  nodePaths: [path.join(demo, "node_modules")],
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".css": "css" },
});

// 2. Tailwind CSS: scan component sources + demo for classes
const content = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(f)) content.push(p);
  }
}
walk(path.join(root, "registry"));
walk(path.join(demo, "src"));

const css = `@tailwind base;
@tailwind components;
@tailwind utilities;
${fs.readFileSync(path.join(demo, "src/site.css"), "utf8")}`;

const result = await postcss([tailwind({ content }), autoprefixer]).process(css, { from: undefined });
fs.writeFileSync(path.join(outDir, "styles.css"), result.css);

// 3. index.html
fs.writeFileSync(path.join(outDir, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>gaps-ui — the components shadcn/ui is missing</title>
<meta name="description" content="8 production-ready shadcn-registry components: empty state, wizard form, saved views, onboarding checklist, preview uploader, command palette views, CSV import wizard, share dialog." />
<link rel="stylesheet" href="./styles.css" />
</head>
<body>
<div id="root"></div>
<script src="./bundle.js"></script>
</body>
</html>
`);

// 4. .nojekyll for GitHub Pages
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");

console.log("demo built ->", outDir, fs.readdirSync(outDir).join(", "));
