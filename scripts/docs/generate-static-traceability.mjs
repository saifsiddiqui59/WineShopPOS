import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoots = ["src", "supabase/functions", "azure-functions"];
const migrationRoot = "supabase/migrations";
const outDir = "docs/versions/v3/reference/generated";

const codeExt = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const sqlExt = ".sql";

function walk(p) {
  if (!fs.existsSync(p)) return [];
  const stat = fs.statSync(p);
  if (stat.isFile()) return [p];
  return fs.readdirSync(p, { withFileTypes: true }).flatMap((e) =>
    walk(path.join(p, e.name))
  );
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function matches(text, regex) {
  const out = [];
  for (const m of text.matchAll(regex)) out.push(m[1]);
  return uniq(out);
}

const sourceRecords = [];
for (const base of sourceRoots) {
  for (const file of walk(base)) {
    if (!codeExt.has(path.extname(file))) continue;
    const text = fs.readFileSync(file, "utf8");

    const tables = matches(
      text,
      /\.from\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]\s*\)/g
    );

    const rpcs = matches(
      text,
      /\.rpc\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g
    );

    const edgeFunctions = matches(
      text,
      /\.functions\.invoke\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g
    );

    const storageBuckets = matches(
      text,
      /\.storage\.from\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]\s*\)/g
    );

    const browserKeys = uniq([
      ...matches(text, /(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*["'`]([^"'`]+)["'`]/g),
      ...matches(text, /indexedDB\.open\(\s*["'`]([^"'`]+)["'`]/g),
    ]);

    if (tables.length || rpcs.length || edgeFunctions.length || storageBuckets.length || browserKeys.length) {
      sourceRecords.push({
        file: file.replaceAll("\\", "/"),
        tables,
        rpcs,
        edgeFunctions,
        storageBuckets,
        browserKeys,
      });
    }
  }
}

const migrationFiles = walk(migrationRoot)
  .filter((f) => path.extname(f) === sqlExt)
  .sort();

const functionRecords = [];

for (const file of migrationFiles) {
  const text = fs.readFileSync(file, "utf8");
  const lower = text.toLowerCase();

  const functionNames = matches(
    text,
    /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z0-9_]+)/gi
  );

  const publicRelations = matches(
    text,
    /\bpublic\.([a-zA-Z][a-zA-Z0-9_]*)\b/g
  );

  for (const name of functionNames) {
    functionRecords.push({
      function: name,
      migration: file.replaceAll("\\", "/"),
      referencedPublicObjects: publicRelations.filter((x) => x !== name),
      note: "GENERATED_INFERENCE: relation/function names are static textual matches; verify transitive semantics against live database.",
    });
  }
}

fs.mkdirSync(outDir, { recursive: true });

const sourceMd = [
  "# Generated Source Data-Access Inventory",
  "",
  "Status: GENERATED_INFERENCE",
  "",
  "This file is machine-generated from source text. It is not authoritative until curated/verified.",
  "",
  "| Source | Direct tables/views | RPCs | Edge functions | Storage buckets | Browser keys |",
  "|---|---|---|---|---|---|",
  ...sourceRecords.map((r) =>
    `| \`${r.file}\` | ${r.tables.map(x=>`\`${x}\``).join(", ") || "-"} | ${r.rpcs.map(x=>`\`${x}\``).join(", ") || "-"} | ${r.edgeFunctions.map(x=>`\`${x}\``).join(", ") || "-"} | ${r.storageBuckets.map(x=>`\`${x}\``).join(", ") || "-"} | ${r.browserKeys.map(x=>`\`${x}\``).join(", ") || "-"} |`
  ),
  "",
].join("\n");

fs.writeFileSync(path.join(outDir, "SOURCE_DATA_ACCESS.md"), sourceMd);

const rpcMd = [
  "# Generated Migration Function Inventory",
  "",
  "Status: GENERATED_INFERENCE",
  "",
  "The object list is a static textual discovery aid. Use the curated RPC catalog/live schema for authoritative behavior.",
  "",
  "| Function | Migration | Public object names seen in same migration |",
  "|---|---|---|",
  ...functionRecords.map((r) =>
    `| \`${r.function}\` | \`${r.migration}\` | ${r.referencedPublicObjects.map(x=>`\`${x}\``).join(", ") || "-"} |`
  ),
  "",
].join("\n");

fs.writeFileSync(path.join(outDir, "MIGRATION_FUNCTION_INVENTORY.md"), rpcMd);

const jsonOut = {
  generatedAt: new Date().toISOString(),
  status: "GENERATED_INFERENCE",
  sourceRecords,
  functionRecords,
};
fs.writeFileSync(
  path.join(outDir, "traceability.generated.json"),
  JSON.stringify(jsonOut, null, 2) + "\n"
);

console.log(`Generated ${sourceRecords.length} source dependency records.`);
console.log(`Generated ${functionRecords.length} migration function records.`);
