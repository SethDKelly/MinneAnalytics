import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const bundleRoot = path.join(repoRoot, "docs", "concept-design", "knowledge");
const errors = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function rel(file) {
  return path.relative(bundleRoot, file).split(path.sep).join("/");
}

function frontmatter(content) {
  if (!content.startsWith("---\n")) return null;
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return content.slice(4, end);
}

function hasField(yaml, key) {
  return new RegExp(`^${key}:\\s*.+$`, "m").test(yaml);
}

function localMarkdownLinks(content) {
  const links = [];
  const re = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of content.matchAll(re)) links.push(match[1].trim());
  return links;
}

if (!fs.existsSync(bundleRoot)) {
  console.error("OKF bundle root not found: docs/concept-design/knowledge");
  process.exit(1);
}

for (const file of walk(bundleRoot).filter((p) => p.endsWith(".md"))) {
  const content = fs.readFileSync(file, "utf8");
  const name = path.basename(file);
  const relative = rel(file);
  const isRootIndex = relative === "index.md";

  if (name === "index.md") {
    const fm = frontmatter(content);
    if (isRootIndex) {
      if (!fm || !/^okf_version:\s*["']?0\.2["']?\s*$/m.test(fm)) {
        errors.push(`${relative}: root index.md must declare okf_version: 0.2`);
      }
    } else if (fm) {
      errors.push(`${relative}: nested OKF index.md must not contain frontmatter`);
    }
  } else if (name === "log.md") {
    if (frontmatter(content)) {
      errors.push(`${relative}: OKF log.md must not contain frontmatter`);
    }
  } else {
    const fm = frontmatter(content);
    if (!fm) {
      errors.push(`${relative}: concept document must begin with YAML frontmatter`);
    } else {
      if (!hasField(fm, "type")) errors.push(`${relative}: frontmatter requires non-empty type`);
      if (hasField(fm, "authority") && !/^authority:\s*(canonical|supporting|historical)\s*$/m.test(fm)) {
        errors.push(`${relative}: authority must be canonical, supporting, or historical`);
      }
      if (hasField(fm, "status") && !/^status:\s*(draft|stable|deprecated)\s*$/m.test(fm)) {
        errors.push(`${relative}: status must be draft, stable, or deprecated`);
      }
    }
  }

  for (const raw of localMarkdownLinks(content)) {
    if (/^(https?:|mailto:|#)/.test(raw)) continue;
    const targetText = raw.split("#", 1)[0].split("?", 1)[0];
    if (!targetText) continue;

    let target;
    if (targetText.startsWith("/")) {
      target = path.join(bundleRoot, targetText.slice(1));
    } else {
      target = path.resolve(path.dirname(file), targetText);
    }

    if (targetText.endsWith("/")) target = path.join(target, "index.md");
    if (!fs.existsSync(target)) {
      errors.push(`${relative}: broken local link -> ${raw}`);
    }
  }
}

if (errors.length) {
  console.error("OKF knowledge validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("OKF knowledge validation passed.");
