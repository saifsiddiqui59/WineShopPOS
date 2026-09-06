import { useMemo, useState } from "react";
import { readSheet } from "read-excel-file/browser";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import {
  IMPORT_SCHEMAS,
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_ROWS,
  autoMapHeaders,
  csvTemplate,
  parseCsv,
  requiredMappingErrors,
  sha256File,
  tableToRows,
} from "../lib/onboardingImport";

function saveText(name, content) {
  const blob = new Blob([content], { type:"text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function issueText(issue) {
  const row = issue?.row ? `Row ${issue.row}: ` : "";
  const field = issue?.field ? `${issue.field} — ` : "";
  return `${row}${field}${issue?.message || "Review this row."}`;
}

export default function ShopImport() {
  const { refreshAll } = useShop();
  const [importType, setImportType] = useState("PRODUCTS_STOCK");
  const [duplicatePolicy, setDuplicatePolicy] = useState("SKIP");
  const [file, setFile] = useState(null);
  const [sourceHash, setSourceHash] = useState("");
  const [table, setTable] = useState([]);
  const [mapping, setMapping] = useState({});
  const [validation, setValidation] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const schema = IMPORT_SCHEMAS[importType];
  const headers = table[0] || [];
  const rows = useMemo(() => tableToRows(table, importType, mapping), [table, importType, mapping]);
  const mappingErrors = useMemo(() => requiredMappingErrors(importType, mapping), [importType, mapping]);

  function changeType(nextType) {
    setImportType(nextType);
    setValidation(null);
    setResult(null);
    setMessage("");
    setMapping(headers.length ? autoMapHeaders(headers, nextType) : {});
  }

  async function loadFile(nextFile) {
    setFile(null);
    setSourceHash("");
    setTable([]);
    setMapping({});
    setValidation(null);
    setResult(null);
    setMessage("");

    if (!nextFile) return;
    if (nextFile.size > MAX_IMPORT_FILE_BYTES) {
      setMessage("File is larger than 5 MB. Split the import into smaller batches.");
      return;
    }

    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx"].includes(extension)) {
      setMessage("Use CSV (.csv) or Excel (.xlsx). Legacy .xls and macro files are not accepted.");
      return;
    }

    setBusy(true);
    try {
      let nextTable;
      if (extension === "xlsx") {
        nextTable = await readSheet(nextFile);
      } else {
        nextTable = parseCsv(await nextFile.text());
      }

      if (!nextTable?.length || nextTable.length < 2) {
        throw new Error("The file must contain a header row and at least one data row.");
      }
      if (nextTable.length - 1 > MAX_IMPORT_ROWS) {
        throw new Error(`Maximum ${MAX_IMPORT_ROWS} data rows per import. Split the file and retry.`);
      }

      const hash = await sha256File(nextFile);
      setFile(nextFile);
      setSourceHash(hash);
      setTable(nextTable);
      setMapping(autoMapHeaders(nextTable[0] || [], importType));
      setMessage(
        extension === "xlsx"
          ? "Excel loaded. Verify barcode/UPC columns are formatted as Text if leading zeroes matter."
          : "CSV loaded. Review automatic column mapping before Dry Run.",
      );
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
  }

  function updateMapping(field, value) {
    setMapping((current) => ({ ...current, [field]: value === "" ? "" : Number(value) }));
    setValidation(null);
    setResult(null);
  }

  async function dryRun() {
    setValidation(null);
    setResult(null);
    if (!file) return setMessage("Choose a CSV or XLSX file first.");
    if (mappingErrors.length) return setMessage(mappingErrors.join(" "));
    if (!rows.length) return setMessage("No data rows are available after mapping.");

    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await supabase.rpc("onboarding_validate_import", {
        p_import_type:importType,
        p_rows:rows,
        p_duplicate_policy:duplicatePolicy,
      });
      if (error) throw error;
      setValidation(data);
      setMessage(
        data?.ok
          ? `Dry Run passed: ${data.rows_total} row(s), ${data.warning_count || 0} warning(s). Nothing was written.`
          : `Dry Run found ${data?.error_count || 0} error(s). Nothing was written.`,
      );
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
  }

  async function applyImport() {
    if (!validation?.ok) return setMessage("Run a successful Dry Run before importing.");
    if (!file || !sourceHash) return setMessage("File identity is missing. Reload the file.");

    setBusy(true);
    setResult(null);
    setMessage("");
    try {
      const { data, error } = await supabase.rpc("onboarding_apply_import", {
        p_import_type:importType,
        p_rows:rows,
        p_duplicate_policy:duplicatePolicy,
        p_source_name:file.name,
        p_source_hash:sourceHash,
      });
      if (error) throw error;
      setResult(data);

      if (!data?.ok || data?.applied === false) {
        setMessage(data?.message || data?.error_code || "Import was not applied.");
        return;
      }

      if (importType === "PRODUCTS_STOCK") await refreshAll();
      setMessage(
        `Import complete. Applied ${data.rows_applied || 0}; skipped ${data.rows_skipped || 0}; batch ${data.batch_id}.`,
      );
    } catch (error) {
      setMessage(error?.message || String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wsp-import-center">
      <div className="page-heading">
        <div>
          <h2>Existing Shop Import</h2>
          <p>Move an operating shop into WineShopPOS using CSV or Excel with Dry Run validation before any write.</p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => saveText(
            importType === "SUPPLIERS" ? "wineshoppos-suppliers-template.csv" : "wineshoppos-products-opening-stock-template.csv",
            csvTemplate(importType),
          )}
        >
          Download Template
        </button>
      </div>

      <section className="panel wsp-import-safety">
        <strong>Safe onboarding rules</strong>
        <ul>
          <li>Default duplicate policy is SKIP.</li>
          <li>Dry Run returns all detected row errors before Import is enabled.</li>
          <li>The same SHA-256 file cannot be applied twice to the same shop.</li>
          <li>Opening stock cannot overwrite non-zero live stock and is locked after the first completed WineShopPOS sale.</li>
          <li>Imports are shop-scoped and restricted to ADMIN / MANAGER.</li>
        </ul>
      </section>

      <div className="wsp-import-grid">
        <section className="panel">
          <h3>1. Import type</h3>
          <label>
            Data
            <select value={importType} onChange={(event) => changeType(event.target.value)}>
              <option value="PRODUCTS_STOCK">Products + Opening Stock</option>
              <option value="SUPPLIERS">Suppliers</option>
            </select>
          </label>

          <div className="wsp-import-disabled-card">
            <strong>Customers — prepared, currently disabled</strong>
            <span>Customer personal-data import stays disabled during the current pilot/privacy-disabled stage.</span>
          </div>

          <label>
            Duplicate handling
            <select
              value={duplicatePolicy}
              onChange={(event) => {
                setDuplicatePolicy(event.target.value);
                setValidation(null);
                setResult(null);
              }}
            >
              <option value="SKIP">SKIP existing records — safest</option>
              <option value="UPDATE">UPDATE matching records — preserve blank existing fields</option>
              <option value="ERROR">ERROR if duplicate exists</option>
            </select>
          </label>

          <label>
            CSV / Excel file
            <input
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => void loadFile(event.target.files?.[0] || null)}
            />
          </label>

          {file ? (
            <div className="wsp-import-file-meta">
              <strong>{file.name}</strong>
              <span>{rows.length} mapped row(s)</span>
              <span>SHA-256: {sourceHash.slice(0, 16)}…</span>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <h3>2. Map columns</h3>
          {!headers.length ? <p className="muted-text">Choose a file to start automatic mapping.</p> : null}
          <div className="wsp-import-mapping">
            {schema.fields.map((field) => (
              <label key={field.key}>
                {field.label}{field.required ? " *" : ""}
                <select
                  value={mapping[field.key] ?? ""}
                  onChange={(event) => updateMapping(field.key, event.target.value)}
                >
                  <option value="">Not mapped</option>
                  {headers.map((header, index) => (
                    <option key={`${index}-${header}`} value={index}>
                      {String(header || `Column ${index + 1}`)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          {mappingErrors.length ? (
            <div className="purchase-message error">{mappingErrors.join(" ")}</div>
          ) : null}
        </section>
      </div>

      <section className="panel">
        <div className="wsp-import-actions">
          <div>
            <h3>3. Dry Run → Import</h3>
            <p className="muted-text">Validation does not write business data. Import remains disabled until Dry Run passes.</p>
          </div>
          <div className="button-row">
            <button type="button" className="secondary-button" disabled={busy || !rows.length} onClick={dryRun}>
              {busy ? "Working…" : "Dry Run"}
            </button>
            <button type="button" className="primary-button" disabled={busy || !validation?.ok} onClick={applyImport}>
              Import Validated Rows
            </button>
          </div>
        </div>

        {message ? <div className="purchase-message">{message}</div> : null}

        {validation ? (
          <div className="wsp-import-results">
            <div className="metric-grid three">
              <div className="metric-card"><span>Rows</span><strong>{validation.rows_total || 0}</strong></div>
              <div className="metric-card"><span>Errors</span><strong>{validation.error_count || 0}</strong></div>
              <div className="metric-card"><span>Warnings</span><strong>{validation.warning_count || 0}</strong></div>
            </div>
            {(validation.errors || []).length ? (
              <div>
                <h4>Errors</h4>
                <ol>{validation.errors.map((issue, index) => <li key={`e-${index}`}>{issueText(issue)}</li>)}</ol>
              </div>
            ) : null}
            {(validation.warnings || []).length ? (
              <div>
                <h4>Warnings</h4>
                <ol>{validation.warnings.map((issue, index) => <li key={`w-${index}`}>{issueText(issue)}</li>)}</ol>
              </div>
            ) : null}
          </div>
        ) : null}

        {result?.batch_id ? (
          <div className="wsp-import-batch">
            <strong>Audit batch:</strong> {result.batch_id}
          </div>
        ) : null}
      </section>

      {rows.length ? (
        <section className="panel">
          <h3>Mapped preview — first 10 rows</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>{schema.fields.filter((f) => mapping[f.key] !== "" && mapping[f.key] != null).map((f) => <th key={f.key}>{f.label}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {schema.fields.filter((f) => mapping[f.key] !== "" && mapping[f.key] != null).map((f) => (
                      <td key={f.key}>{String(row[f.key] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
