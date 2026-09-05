import { readFile,stat } from "node:fs/promises";
import { join } from "node:path";
function ok(v,m){if(!v)throw new Error(m)}
const app=await readFile("src/App.jsx","utf8");
const pages=[...app.matchAll(/import\s+\w+\s+from\s+"\.\/pages\/([^"]+)";/g)].map(m=>m[1]);
ok(pages.length>=35,`Only ${pages.length} routed pages found`);
ok(new Set(pages).size===pages.length,"Duplicate page import");
for(const page of pages){
  const file=join("src/pages",`${page}.jsx`);
  ok((await stat(file)).size>0,`Empty ${file}`);
  const s=await readFile(file,"utf8");
  ok(/export\s+default/.test(s),`No default export ${file}`);
  ok(!/^(<<<<<<<|=======|>>>>>>>)/m.test(s),`Conflict marker ${file}`);
}
const sortable=await readFile("src/components/ui/SortableTable.jsx","utf8");
ok(sortable.includes("const tableWidth ="),"SortableTable full-width fix missing");
const stock=await readFile("src/pages/StockCount.jsx","utf8");
ok(stock.includes("Current inventory baseline"),"StockCount baseline missing");
const intel=await readFile("src/pages/PurchaseIntelligence.jsx","utf8");
ok(!intel.includes('import AutomationHub from "./AutomationHub"'),"Purchase Intelligence still embeds OCR");
console.log(`ROUTED PAGE AUDIT PASS: ${pages.length} page modules`);
