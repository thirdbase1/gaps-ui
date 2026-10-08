#!/usr/bin/env python3
"""gaps-ui registry generator.

Reads specs/*.json (registry-item specs) and emits:
  - registry/<name>/<name>.tsx        (component source, from spec["template"])
  - public/r/<name>.json              (official registry-item JSON with embedded content)
  - public/r/registry.json            (index)
  - docs/<name>.md                    (doc page per component)

Keeps the registry consistent and lets us scale to hundreds of components without
hand-maintaining JSON. Components themselves are written by hand in specs; the
generator handles all boilerplate (JSON schema, embedding, docs stub, index).
"""
import json, os, sys, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_specs():
    specs = []
    d = os.path.join(ROOT, "specs")
    for f in sorted(os.listdir(d)):
        if f.endswith(".json"):
            specs.append(json.load(open(os.path.join(d, f))))
    return specs

def render_registry_item(spec):
    files = []
    for f in spec["files"]:
        src = open(os.path.join(ROOT, f["path"])).read()
        files.append({"path": f["path"], "type": "registry:component", "content": src})
    out = {"$schema": "https://ui.shadcn.com/schema/registry-item.json"}
    out["name"] = spec["name"]
    out["type"] = "registry:component"
    out["title"] = spec["title"]
    out["description"] = spec["description"]
    out["registryDependencies"] = spec.get("registryDependencies", [])
    out["dependencies"] = spec.get("dependencies", [])
    out["files"] = files
    return out

def doc_for(spec):
    lines = [f"# {spec['title']}", "", spec["description"], ""]
    if spec.get("usage"):
        lines += ["## Usage", "", "```tsx", spec["usage"].strip(), "```", ""]
    if spec.get("props"):
        lines += ["## Props", "", "| Prop | Type | Description |", "|---|---|---|"]
        for p in spec["props"]:
            lines.append(f"| `{p[0]}` | `{p[1]}` | {p[2]} |")
        lines.append("")
    lines += ["## Install", "", "```bash",
              f'npx shadcn@latest add "https://raw.githubusercontent.com/thirdbase1/gaps-ui/main/public/r/{spec["name"]}.json"',
              "```", ""]
    return "\n".join(lines)

def main():
    specs = load_specs()
    index = {"$schema": "https://ui.shadcn.com/schema/registry.json",
             "name": "gaps-ui",
             "homepage": "https://thirdbase1.github.io/gaps-ui/",
             "items": []}
    for spec in specs:
        item = {k: spec[k] for k in ("name", "type", "title", "description") if k in spec}
        item["registryDependencies"] = spec.get("registryDependencies", [])
        item["dependencies"] = spec.get("dependencies", [])
        item["files"] = [{"path": f["path"], "type": "registry:component"} for f in spec["files"]]
        index["items"].append(item)

        os.makedirs(os.path.join(ROOT, "public/r"), exist_ok=True)
        os.makedirs(os.path.join(ROOT, "docs"), exist_ok=True)
        json.dump(render_registry_item(spec), open(os.path.join(ROOT, f"public/r/{spec['name']}.json"), "w"), indent=2)
        with open(os.path.join(ROOT, f"docs/{spec['name']}.md"), "w") as fh:
            fh.write(doc_for(spec))

    json.dump(index, open(os.path.join(ROOT, "registry.json"), "w"), indent=2)
    json.dump(index, open(os.path.join(ROOT, "public/r/registry.json"), "w"), indent=2)
    print(f"generated {len(specs)} registry items:")
    for s in specs:
        print("  -", s["name"])

if __name__ == "__main__":
    main()
