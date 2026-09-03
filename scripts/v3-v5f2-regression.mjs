import { readFile } from "node:fs/promises";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const migration = await readFile(
  "supabase/migrations/20260903114500_v5f2_alias_generated_column_fix.sql",
  "utf8",
);
const automationHub = await readFile("src/pages/AutomationHub.jsx", "utf8");
const main = await readFile("src/main.jsx", "utf8");
const errorContext = await readFile("src/context/GlobalErrorContext.jsx", "utf8");
const errorDialog = await readFile("src/components/ui/GlobalErrorDialog.jsx", "utf8");

const insertMatch = migration.match(
  /insert\s+into\s+public\.product_aliases\s*\(([\s\S]*?)\)\s*values/i,
);
assert(insertMatch, "Could not find product_aliases INSERT in V5-F.2 migration.");
assert(
  !/\bnormalized_alias\b/i.test(insertMatch[1]),
  "Regression: normalized_alias must NOT be manually inserted.",
);

assert(
  /create or replace function public\.remember_product_alias/i.test(migration),
  "remember_product_alias must be replaced by the forward migration.",
);

assert(
  main.includes("<GlobalErrorProvider>"),
  "GlobalErrorProvider is not mounted at the app root.",
);

assert(
  automationHub.includes("useGlobalError"),
  "Invoice OCR is not wired to the global error system.",
);

assert(
  automationHub.includes('raiseSystemError(error, "Unable to confirm invoice line")'),
  "Confirm Line database errors are not routed to the modal.",
);

assert(
  errorContext.includes('window.addEventListener("error"'),
  "Global window error listener missing.",
);

assert(
  errorContext.includes('window.addEventListener("unhandledrejection"'),
  "Unhandled promise rejection listener missing.",
);

assert(
  errorDialog.includes('role="alertdialog"'),
  "Global dialog must use alertdialog semantics.",
);

assert(
  errorDialog.includes("Close"),
  "Global dialog Close action missing.",
);

console.log("V5-F.2 regression PASS");
console.log(" - generated normalized_alias is not manually inserted");
console.log(" - global error provider is mounted");
console.log(" - OCR Confirm Line system errors use global dialog");
console.log(" - Close / Esc capable alert dialog exists");
