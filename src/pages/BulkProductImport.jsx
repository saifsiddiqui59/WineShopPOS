import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";

const OCR_REVIEW_KEY = "wineshop_ocr_review_state";
const OCR_BULK_CREATED_KEY = "wineshop_ocr_bulk_created_products";

function blankRow(overrides = {}) {
  return {
    barcode: "",
    productName: "",
    brand: "",
    categoryId: "",
    subcategory: "",
    sizeMl: 750,
    alcoholPercentage: "",
    purchasePrice: 0,
    mrp: 0,
    sellingPrice: 0,
    minimumStock: 5,
    unitsPerCase: 12,
    ocrLineIndex: null,
    source: "MANUAL",
    ...overrides,
  };
}

function inferSizeMl(description) {
  const text = String(description || "");
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(ml|cl|l)\b/gi)];
  if (!matches.length) return 750;

  const [, rawValue, rawUnit] = matches[matches.length - 1];
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) return 750;

  const unit = rawUnit.toLowerCase();
  if (unit === "cl") return Math.round(value * 10);
  if (unit === "l") return Math.round(value * 1000);
  return Math.round(value);
}

function rowsFromOcrReview() {
  const raw = sessionStorage.getItem(OCR_REVIEW_KEY);
  if (!raw) return [];

  const state = JSON.parse(raw);
  const items = state?.result?.items || [];
  const resolution = state?.resolution || {};

  return items
    .map((item, index) => {
      const row = resolution[index] || {};
      if (row.productId) return null;

      return blankRow({
        productName: String(item?.description || "").trim(),
        sizeMl: inferSizeMl(item?.description),
        purchasePrice: Number(row.purchasePrice || item?.unitPrice || 0),
        unitsPerCase: Math.max(1, Number(row.unitsPerCase || 12)),
        ocrLineIndex: index,
        source: "OCR",
      });
    })
    .filter((row) => row && row.productName);
}

export default function BulkProductImport() {
  const { categories, refreshAll } = useShop();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [rows, setRows] = useState([blankRow()]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);

  const fromOcr = params.get("ocr") === "1";

  const activeCategories = useMemo(
    () => (categories || []).filter((item) => item.active !== false),
    [categories],
  );

  useEffect(() => {
    if (!fromOcr) return;

    try {
      const ocrRows = rowsFromOcrReview();
      if (ocrRows.length) {
        setRows(ocrRows);
        setMessage(
          `${ocrRows.length} unmatched OCR product line(s) loaded. Review Product Master fields, then bulk-create them.`,
        );
      } else {
        setRows([]);
        setMessage(
          "No unmatched OCR product lines were found. Return to Invoice OCR and review the invoice.",
        );
      }
    } catch (error) {
      setRows([]);
      setMessage(error?.message || "Unable to load the Invoice OCR review.");
    }
  }, [fromOcr]);

  function updateRow(index, field, value) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows((current) => [...current, blankRow()]);
  }

  function removeRow(index) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  async function createProducts() {
    setBusy(true);
    setMessage("");
    setResults([]);

    try {
      if (!rows.length) throw new Error("Add at least one product row.");

      const payload = rows.map((row) => ({
        barcode: String(row.barcode || "").trim() || null,
        product_name: String(row.productName || "").trim(),
        brand: String(row.brand || "").trim() || null,
        category_id: row.categoryId || null,
        subcategory: String(row.subcategory || "").trim() || null,
        size_ml: Number(row.sizeMl),
        alcohol_percentage:
          row.alcoholPercentage === "" ? null : Number(row.alcoholPercentage),
        purchase_price: Number(row.purchasePrice || 0),
        mrp: Number(row.mrp || 0),
        selling_price: Number(row.sellingPrice || 0),
        minimum_stock: Number(row.minimumStock || 0),
        units_per_case: Number(row.unitsPerCase || 1),
      }));

      const invalid = payload.findIndex(
        (row) =>
          !row.product_name ||
          !Number.isInteger(row.size_ml) ||
          row.size_ml <= 0 ||
          !Number.isInteger(row.units_per_case) ||
          row.units_per_case <= 0,
      );

      if (invalid >= 0) {
        throw new Error(
          `Row ${invalid + 1}: Product Name, Size and Units / Case are required.`,
        );
      }

      const { data, error } = await supabase.rpc("bulk_create_products", {
        p_items: payload,
      });
      if (error) throw error;

      const output = Array.isArray(data) ? data : [];
      setResults(output);
      await refreshAll();

      const success = output.filter((item) => item.status === "SUCCESS");
      const failed = output.filter((item) => item.status === "ERROR");

      const ocrCreated = success
        .map((item) => {
          const sourceRow = rows[Number(item.row) - 1];
          if (!sourceRow || sourceRow.ocrLineIndex == null) return null;
          return {
            lineIndex: sourceRow.ocrLineIndex,
            productId: item.product_id,
            sku: item.sku,
          };
        })
        .filter(Boolean);

      if (ocrCreated.length) {
        sessionStorage.setItem(
          OCR_BULK_CREATED_KEY,
          JSON.stringify(ocrCreated),
        );
      }

      setMessage(
        `${success.length} product(s) created; ${failed.length} row(s) need review. Inventory was not increased.`,
      );

      if (fromOcr && failed.length === 0 && ocrCreated.length) {
        navigate("/purchasing/ocr");
      }
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Bulk Product Import</h2>
          <p>
            Manual / Invoice OCR catalogue onboarding. Barcode is optional here
            only; SKU is generated automatically.
          </p>
        </div>
        <div className="button-row">
          {fromOcr ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/purchasing/ocr")}
            >
              Back to Invoice OCR
            </button>
          ) : null}
          <button type="button" className="secondary-button" onClick={addRow}>
            + Add Row
          </button>
        </div>
      </div>

      {message ? <div className="purchase-message">{message}</div> : null}

      <section className="panel">
        <p className="muted-text">
          Product creation does not receive stock. Physical quantity is posted
          only through Receive Stock after invoice review.
        </p>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Source</th>
                <th>Barcode optional</th>
                <th>Product Name *</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Size ml *</th>
                <th>ABV %</th>
                <th>Purchase</th>
                <th>MRP</th>
                <th>Selling</th>
                <th>Min Stock</th>
                <th>Units / Case *</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.source}-${row.ocrLineIndex ?? index}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{row.source}</td>
                  <td>
                    <input
                      value={row.barcode}
                      placeholder="Add later"
                      onChange={(event) =>
                        updateRow(index, "barcode", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={row.productName}
                      onChange={(event) =>
                        updateRow(index, "productName", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={row.brand}
                      onChange={(event) =>
                        updateRow(index, "brand", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={row.categoryId}
                      onChange={(event) =>
                        updateRow(index, "categoryId", event.target.value)
                      }
                    >
                      <option value="">Uncategorized</option>
                      {activeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={row.sizeMl}
                      onChange={(event) =>
                        updateRow(index, "sizeMl", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={row.alcoholPercentage}
                      onChange={(event) =>
                        updateRow(index, "alcoholPercentage", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.purchasePrice}
                      onChange={(event) =>
                        updateRow(index, "purchasePrice", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.mrp}
                      onChange={(event) =>
                        updateRow(index, "mrp", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.sellingPrice}
                      onChange={(event) =>
                        updateRow(index, "sellingPrice", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.minimumStock}
                      onChange={(event) =>
                        updateRow(index, "minimumStock", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={row.unitsPerCase}
                      onChange={(event) =>
                        updateRow(index, "unitsPerCase", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => removeRow(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="button-row" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="primary-button"
            onClick={createProducts}
            disabled={busy || !rows.length}
          >
            {busy
              ? "Creating..."
              : `Create ${rows.length} Product${rows.length === 1 ? "" : "s"}`}
          </button>
        </div>

        {results.length ? (
          <div style={{ marginTop: 16 }}>
            <h3>Bulk Import Result</h3>
            <ul>
              {results.map((item, index) => (
                <li key={`${item.row}-${index}`}>
                  Row {item.row}: {item.status}
                  {item.sku ? ` — ${item.sku}` : ""}
                  {item.message ? ` — ${item.message}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
