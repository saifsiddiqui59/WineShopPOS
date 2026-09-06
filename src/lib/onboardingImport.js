export const MAX_IMPORT_ROWS = 2000;
export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;

export const IMPORT_SCHEMAS = {
  PRODUCTS_STOCK: {
    label: "Products + Opening Stock",
    fields: [
      { key: "product_name", label: "Product Name", required: true, aliases: ["product name","item name","item","product","description","product description"] },
      { key: "barcode", label: "Barcode / UPC / EAN", aliases: ["barcode","upc","ean","gtin","bar code","item barcode"] },
      { key: "brand", label: "Brand", aliases: ["brand","make","manufacturer"] },
      { key: "category", label: "Category", aliases: ["category","department","group"] },
      { key: "subcategory", label: "Subcategory", aliases: ["subcategory","sub category","sub-category"] },
      { key: "size_ml", label: "Size ml", required: true, aliases: ["size ml","size_ml","volume ml","volume","ml","bottle size","bottle size ml"] },
      { key: "alcohol_percentage", label: "ABV %", aliases: ["abv","abv %","alcohol %","alcohol percentage","alcohol_percentage"] },
      { key: "purchase_price", label: "Purchase Price", aliases: ["purchase price","purchase_price","cost","cost price","cp","purchase rate","buy price"] },
      { key: "mrp", label: "MRP", aliases: ["mrp","maximum retail price","list price"] },
      { key: "selling_price", label: "Selling Price", aliases: ["selling price","selling_price","sale price","retail price","sp","selling rate"] },
      { key: "minimum_stock", label: "Minimum Stock", aliases: ["minimum stock","minimum_stock","min stock","reorder level","reorder point"] },
      { key: "units_per_case", label: "Units / Case", required: true, aliases: ["units per case","units_per_case","case pack","pack qty","pack quantity","bottles per case","case qty"] },
      { key: "opening_stock", label: "Opening Stock", aliases: ["opening stock","opening_stock","stock","qty","quantity","on hand","on hand qty","current stock"] },
    ],
  },
  SUPPLIERS: {
    label: "Suppliers",
    fields: [
      { key: "supplier_name", label: "Supplier Name", required: true, aliases: ["supplier name","supplier","vendor","vendor name"] },
      { key: "contact_person", label: "Contact Person", aliases: ["contact person","contact","contact name"] },
      { key: "mobile", label: "Mobile", aliases: ["mobile","phone","phone number","mobile number","contact number"] },
      { key: "email", label: "Email", aliases: ["email","email id","e-mail"] },
      { key: "gst_number", label: "GST Number", aliases: ["gst","gst number","gstin","tax id"] },
      { key: "address", label: "Address", aliases: ["address","supplier address","vendor address"] },
    ],
  },
};

export function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9% ]+/g, "")
    .replace(/\s+/g, " ");
}

export function parseCsv(text) {
  const input = String(text ?? "").replace(/\r\n?/g, "\n");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      if (row.some((value) => String(value ?? "").trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted value.");
  row.push(cell);
  if (row.some((value) => String(value ?? "").trim() !== "")) rows.push(row);
  return rows;
}

export function autoMapHeaders(headers, importType) {
  const schema = IMPORT_SCHEMAS[importType];
  if (!schema) throw new Error(`Unsupported import type: ${importType}`);
  const normalizedHeaders = headers.map(normalizeHeader);
  const mapping = {};

  for (const field of schema.fields) {
    const accepted = new Set([field.key, field.label, ...(field.aliases || [])].map(normalizeHeader));
    const index = normalizedHeaders.findIndex((header) => accepted.has(header));
    if (index >= 0) mapping[field.key] = index;
  }
  return mapping;
}

function cellValue(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value).trim();
}

export function tableToRows(table, importType, mapping) {
  const schema = IMPORT_SCHEMAS[importType];
  if (!schema) throw new Error(`Unsupported import type: ${importType}`);
  if (!Array.isArray(table) || table.length < 2) return [];

  return table
    .slice(1)
    .filter((row) => Array.isArray(row) && row.some((value) => cellValue(value) !== ""))
    .map((row) => {
      const output = {};
      for (const field of schema.fields) {
        const index = mapping[field.key];
        if (index == null || index === "") continue;
        output[field.key] = cellValue(row[Number(index)]);
      }
      return output;
    });
}

export function requiredMappingErrors(importType, mapping) {
  const schema = IMPORT_SCHEMAS[importType];
  return schema.fields
    .filter((field) => field.required && (mapping[field.key] == null || mapping[field.key] === ""))
    .map((field) => `${field.label} is required.`);
}

export async function sha256File(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function csvTemplate(importType) {
  if (importType === "SUPPLIERS") {
    return [
      "supplier_name,contact_person,mobile,email,gst_number,address",
      'Example Distributor,Accounts Desk,9876543210,accounts@example.com,22AAAAA0000A1Z5,"Shop Road, City"',
    ].join("\n");
  }

  return [
    "product_name,barcode,brand,category,subcategory,size_ml,alcohol_percentage,purchase_price,mrp,selling_price,minimum_stock,units_per_case,opening_stock",
    "Kingfisher Premium 650 ml,8901234500011,Kingfisher,Beer,Lager,650,5,120,160,160,12,12,48",
  ].join("\n");
}
