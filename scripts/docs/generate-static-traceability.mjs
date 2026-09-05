import fs from "node:fs";
import path from "node:path";
const version=fs.readFileSync("docs/CURRENT_VERSION","utf8").trim();
const outDir=`docs/versions/${version}/reference/generated`;
const roots=["src","supabase/functions","azure-functions"];
const exts=new Set([".js",".jsx",".ts",".tsx",".mjs",".cjs"]);
function walk(p){if(!fs.existsSync(p))return[];const s=fs.statSync(p);if(s.isFile())return[p];return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>walk(path.join(p,e.name)));}
function uniq(a){return[...new Set(a.filter(Boolean))].sort();}
function hits(text,re){return uniq([...text.matchAll(re)].map(m=>m[1]));}
const rows=[];
for(const root of roots){for(const file of walk(root)){if(!exts.has(path.extname(file)))continue;const text=fs.readFileSync(file,"utf8");const tables=hits(text,/\.from\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]\s*\)/g);const rpcs=hits(text,/\.rpc\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g);const edge=hits(text,/\.functions\.invoke\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g);const buckets=hits(text,/\.storage\.from\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]\s*\)/g);if(tables.length||rpcs.length||edge.length||buckets.length)rows.push({file:file.replaceAll("\\","/"),tables,rpcs,edge,buckets});}}
fs.mkdirSync(outDir,{recursive:true});
const md=[`# ${version.toUpperCase()} Generated Source Dependency Inventory`,"","Status: GENERATED_INFERENCE","","| Source | Direct tables/views | RPCs | Edge functions | Storage buckets |","|---|---|---|---|---|",...rows.map(r=>`| \`${r.file}\` | ${r.tables.map(x=>`\`${x}\``).join(", ")||"-"} | ${r.rpcs.map(x=>`\`${x}\``).join(", ")||"-"} | ${r.edge.map(x=>`\`${x}\``).join(", ")||"-"} | ${r.buckets.map(x=>`\`${x}\``).join(", ")||"-"} |`),""].join("\n");
fs.writeFileSync(path.join(outDir,"SOURCE_DATA_ACCESS.md"),md);
fs.writeFileSync(path.join(outDir,"traceability.generated.json"),JSON.stringify({version,generatedAt:new Date().toISOString(),rows},null,2)+"\n");
console.log(`Generated ${rows.length} source dependency records for ${version}.`);
