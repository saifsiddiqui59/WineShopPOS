import fs from "node:fs";

function bounds(polygon = []) {
  const points = [];
  if (polygon.length && typeof polygon[0] === "number") {
    for (let i = 0; i + 1 < polygon.length; i += 2) {
      points.push([Number(polygon[i]), Number(polygon[i + 1])]);
    }
  } else {
    for (const p of polygon || []) {
      const x = Number(p?.x);
      const y = Number(p?.y);
      if (Number.isFinite(x) && Number.isFinite(y)) points.push([x, y]);
    }
  }
  if (!points.length) return null;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  return {
    left, right, top, bottom,
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    width: Math.max(0.0001, right - left),
    height: Math.max(0.0001, bottom - top),
  };
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function looksMoney(value) {
  const text = String(value || "").trim();
  if (!text || /[a-z]/i.test(text)) return false;
  return /\d/.test(text);
}

function labelRelevant(value) {
  const n = normalize(value);
  return /\b(discount|freight|tcs|total|outstanding|cd|tp fees|stamp|round off|net amount|amount due)\b/.test(n);
}

function moneyNodes(page) {
  return (page.lines || [])
    .map((line, index) => {
      const b = bounds(line.polygon || []);
      return b ? { index, text: String(line.content || ""), ...b } : null;
    })
    .filter(Boolean)
    .filter((row) => looksMoney(row.text));
}

const fixturePath = process.argv[2];
const outputPath = process.argv[3];
if (!fixturePath || !outputPath) {
  throw new Error("Usage: node inspect-v5-azure-finance-fixture.mjs <fixture> <report.md>");
}

const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const ar = fixture.azureEvidence?.analyzeResult || {};
const out = [];

out.push("# B-3339 Azure Geometry Diagnostic");
out.push("");
out.push(`Source: \`${fixture.sourceFileName}\``);
out.push(`Raw Azure SHA-256: \`${fixture.rawResultSha256}\``);
out.push(`Captured: \`${fixture.capturedAt}\``);
out.push("");
out.push("This report is generated from real Azure Document Intelligence evidence. It does not contain expected-value geometry invented by the test.");
out.push("");

for (const page of ar.pages || []) {
  const width = Number(page.width || 1);
  const height = Number(page.height || 1);
  const allMoney = moneyNodes(page);
  const labels = (page.lines || [])
    .map((line, index) => {
      const b = bounds(line.polygon || []);
      return b ? { index, text: String(line.content || ""), ...b } : null;
    })
    .filter(Boolean)
    .filter((row) => labelRelevant(row.text));

  if (!labels.length) continue;

  out.push(`## Page ${page.pageNumber ?? "?"}`);
  out.push("");
  out.push(`Page size: ${width} × ${height} ${page.unit || ""}`);
  out.push("");

  for (const label of labels) {
    out.push(`### Label line ${label.index}: \`${label.text.replace(/`/g, "'")}\``);
    out.push("");
    out.push(
      `Bounds: left=${label.left.toFixed(4)}, right=${label.right.toFixed(4)}, ` +
      `top=${label.top.toFixed(4)}, bottom=${label.bottom.toFixed(4)}, ` +
      `center=(${label.x.toFixed(4)}, ${label.y.toFixed(4)})`,
    );
    out.push("");

    const ranked = allMoney
      .filter((money) => money.index !== label.index)
      .map((money) => {
        const dx = (money.x - label.x) / width;
        const dy = (money.y - label.y) / height;
        const below = money.top >= label.bottom;
        const right = money.left >= label.right;
        const horizontalOverlap =
          Math.max(0, Math.min(label.right, money.right) - Math.max(label.left, money.left)) /
          Math.max(0.0001, Math.min(label.width, money.width));
        const verticalOverlap =
          Math.max(0, Math.min(label.bottom, money.bottom) - Math.max(label.top, money.top)) /
          Math.max(0.0001, Math.min(label.height, money.height));
        const distance = Math.sqrt(dx * dx + dy * dy);
        return {
          ...money,
          dx,
          dy,
          below,
          right,
          horizontalOverlap,
          verticalOverlap,
          distance,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    out.push("| money line | text | dx/page | dy/page | below | right | X-overlap | Y-overlap |");
    out.push("|---:|---|---:|---:|:---:|:---:|---:|---:|");
    for (const money of ranked) {
      out.push(
        `| ${money.index} | \`${money.text.replace(/`/g, "'")}\` | ` +
        `${money.dx.toFixed(4)} | ${money.dy.toFixed(4)} | ` +
        `${money.below ? "Y" : "N"} | ${money.right ? "Y" : "N"} | ` +
        `${money.horizontalOverlap.toFixed(3)} | ${money.verticalOverlap.toFixed(3)} |`,
      );
    }
    out.push("");
  }
}

out.push("## Relevant semantic-table cells");
out.push("");
out.push("| table | row | col | content | bounds |");
out.push("|---:|---:|---:|---|---|");
(ar.tables || []).forEach((table, tableIndex) => {
  for (const cell of table.cells || []) {
    if (!labelRelevant(cell.content) && !looksMoney(cell.content)) continue;
    const region = cell.boundingRegions?.[0];
    const b = bounds(region?.polygon || []);
    const box = b
      ? `${b.left.toFixed(3)},${b.top.toFixed(3)} → ${b.right.toFixed(3)},${b.bottom.toFixed(3)}`
      : "";
    out.push(
      `| ${tableIndex} | ${cell.rowIndex ?? ""} | ${cell.columnIndex ?? ""} | ` +
      `\`${String(cell.content || "").replace(/\r?\n/g, " / ").replace(/`/g, "'")}\` | ${box} |`,
    );
  }
});
out.push("");

out.push("## Relevant key/value pairs");
out.push("");
out.push("| key | value |");
out.push("|---|---|");
for (const pair of ar.keyValuePairs || []) {
  const key = String(pair.key?.content || "");
  const value = String(pair.value?.content || "");
  if (!labelRelevant(key) && !labelRelevant(value)) continue;
  out.push(
    `| \`${key.replace(/\r?\n/g, " / ").replace(/`/g, "'")}\` | ` +
    `\`${value.replace(/\r?\n/g, " / ").replace(/`/g, "'")}\` |`,
  );
}
out.push("");

fs.writeFileSync(outputPath, out.join("\n") + "\n");
console.log(outputPath);
