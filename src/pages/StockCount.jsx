import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useScanner } from "../context/ScannerContext";
import { useShop } from "../context/ShopContext";

export default function StockCount() {
  const { lastScan, successBeep, errorBeep } = useScanner();
  const { products, getStock, refreshAll } = useShop();

  const [counts, setCounts] = useState([]);
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [message, setMessage] = useState("");
  const [finder, setFinder] = useState("");

  const finderRef = useRef(null);
  const lastHandledScanIdRef = useRef("");

  const activeProducts = useMemo(
    () => products.filter((product) => product.active),
    [products],
  );

  async function loadCounts() {
    const { data, error } = await supabase
      .from("stock_counts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      setMessage(error.message);
      return;
    }

    const rows = data || [];
    setCounts(rows);

    const current = rows.find((row) =>
      ["OPEN", "SUBMITTED"].includes(row.status),
    );

    if (current && !activeId) setActiveId(current.id);
  }

  async function loadItems(id) {
    if (!id) {
      setItems([]);
      return;
    }

    const { data, error } = await supabase
      .from("stock_count_items")
      .select("*")
      .eq("stock_count_id", id)
      .order("product_id");

    if (error) setMessage(error.message);
    else setItems(data || []);
  }

  useEffect(() => {
    void loadCounts();
  }, []);

  useEffect(() => {
    void loadItems(activeId);
  }, [activeId]);

  const active = counts.find((count) => count.id === activeId);
  const activeStatus = active?.status || "";

  const itemByProductId = useMemo(
    () => Object.fromEntries(items.map((item) => [item.product_id, item])),
    [items],
  );

  const countableProducts = useMemo(
    () =>
      activeId
        ? activeProducts.filter((product) => Boolean(itemByProductId[product.id]))
        : activeProducts,
    [activeId, activeProducts, itemByProductId],
  );

  const searchResults = useMemo(() => {
    const query = finder.trim().toLowerCase();
    if (!query) return [];

    return countableProducts
      .map((product) => {
        const barcode = String(product.barcode || "").toLowerCase();
        const sku = String(product.sku || "").toLowerCase();

        const searchableFields = [
          product.name,
          product.brand,
          product.sku,
          product.barcode,
          product.category,
          product.subcategory,
          product.size,
          product.sizeMl ? `${product.sizeMl}` : "",
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        let score = 0;
        if (barcode && barcode === query) score = 100;
        else if (sku && sku === query) score = 95;
        else if (String(product.name || "").toLowerCase() === query) score = 90;
        else if (searchableFields.some((value) => value.startsWith(query))) score = 70;
        else if (searchableFields.some((value) => value.includes(query))) score = 50;

        return { product, score };
      })
      .filter((row) => row.score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          String(left.product.name).localeCompare(String(right.product.name)),
      )
      .slice(0, 8)
      .map((row) => row.product);
  }, [finder, countableProducts]);

  async function createCount() {
    const { data, error } = await supabase.rpc("create_stock_count", {
      p_notes: "Physical stock count",
    });

    setMessage(
      error
        ? error.message
        : "Stock count started. Scan each physical bottle or use search as fallback.",
    );

    if (!error) {
      setActiveId(data);
      await loadCounts();
      await loadItems(data);
      requestAnimationFrame(() => finderRef.current?.focus());
    }
  }

  async function incrementProduct(product) {
    if (!activeId || activeStatus !== "OPEN") {
      errorBeep();
      setMessage("Start or select an OPEN stock count before counting products.");
      return;
    }

    const item = itemByProductId[product.id];
    if (!item) {
      errorBeep();
      setMessage(
        "This product was not in the count snapshot. Start a new count if Product Master changed.",
      );
      return;
    }

    if (product.barcode) {
      const { data, error } = await supabase.rpc("stock_count_scan", {
        p_stock_count_id: activeId,
        p_barcode: product.barcode,
      });

      if (error) {
        errorBeep();
        setMessage(
          error.message === "PRODUCT_NOT_IN_COUNT_SNAPSHOT"
            ? "Product is not part of this stock-count snapshot."
            : error.message,
        );
        return;
      }

      successBeep();
      setMessage(
        `${data?.[0]?.product_name || product.name}: counted ${data?.[0]?.counted_quantity}`,
      );
    } else {
      const next = Number(item.counted_quantity ?? 0) + 1;
      const { error } = await supabase.rpc("set_stock_count_quantity", {
        p_stock_count_id: activeId,
        p_product_id: product.id,
        p_quantity: next,
      });

      if (error) {
        errorBeep();
        setMessage(error.message);
        return;
      }

      successBeep();
      setMessage(`${product.name}: counted ${next}`);
    }

    setFinder("");
    await loadItems(activeId);
    requestAnimationFrame(() => finderRef.current?.focus());
  }

  useEffect(() => {
    const scanId = lastScan?.id || "";
    if (!scanId) return;

    if (lastHandledScanIdRef.current === scanId) return;
    lastHandledScanIdRef.current = scanId;

    if (!activeId || activeStatus !== "OPEN") {
      errorBeep();
      setMessage("Start or select an OPEN stock count before scanning physical stock.");
      return;
    }

    void (async () => {
      const { data, error } = await supabase.rpc("stock_count_scan", {
        p_stock_count_id: activeId,
        p_barcode: lastScan.barcode,
      });

      if (error) {
        errorBeep();
        setMessage(
          error.message === "PRODUCT_NOT_IN_COUNT_SNAPSHOT"
            ? "Product is not part of this stock-count snapshot."
            : error.message,
        );
        return;
      }

      successBeep();
      setFinder("");
      setMessage(
        `${data?.[0]?.product_name || lastScan.barcode}: counted ${data?.[0]?.counted_quantity}`,
      );

      await loadItems(activeId);
      requestAnimationFrame(() => finderRef.current?.focus());
    })();
  }, [
    lastScan?.id,
    lastScan?.barcode,
    activeId,
    activeStatus,
    successBeep,
    errorBeep,
  ]);

  function handleFinderKeyDown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const query = finder.trim().toLowerCase();
    if (!query) return;

    const exact = countableProducts.find(
      (product) =>
        String(product.barcode || "").toLowerCase() === query ||
        String(product.sku || "").toLowerCase() === query,
    );

    if (exact) {
      void incrementProduct(exact);
      return;
    }

    if (searchResults.length === 1) {
      void incrementProduct(searchResults[0]);
      return;
    }

    setMessage(
      searchResults.length
        ? "Select the correct product from the search results."
        : "No matching product found.",
    );
  }

  async function setQuantity(item, quantity) {
    const numeric = Number(quantity);
    if (!Number.isInteger(numeric) || numeric < 0) {
      setMessage("Physical count must be a whole number zero or greater.");
      return;
    }

    const { error } = await supabase.rpc("set_stock_count_quantity", {
      p_stock_count_id: activeId,
      p_product_id: item.product_id,
      p_quantity: numeric,
    });

    if (error) setMessage(error.message);
    else await loadItems(activeId);
  }

  async function markUnseenZero() {
    if (
      !window.confirm(
        "Mark every NOT COUNTED product as physical quantity ZERO? Use only after the physical walk/count is complete.",
      )
    ) {
      return;
    }

    const { data, error } = await supabase.rpc("mark_unseen_stock_count_zero", {
      p_stock_count_id: activeId,
    });

    setMessage(
      error
        ? error.message
        : `${data} previously unseen SKU(s) explicitly marked as physical zero.`,
    );

    if (!error) await loadItems(activeId);
  }

  async function submitCount() {
    const { error } = await supabase.rpc("submit_stock_count", {
      p_stock_count_id: activeId,
    });

    setMessage(error ? error.message : "Count submitted for approval.");
    if (!error) await loadCounts();
  }

  async function approveCount() {
    if (
      !window.confirm(
        "Approve discrepancies and replace system stock with the physical counted stock?",
      )
    ) {
      return;
    }

    const { error } = await supabase.rpc("approve_stock_count", {
      p_stock_count_id: activeId,
    });

    setMessage(
      error
        ? error.message
        : "Stock count approved; inventory adjusted and audited.",
    );

    if (!error) {
      await Promise.all([loadCounts(), refreshAll()]);
      await loadItems(activeId);
    }
  }

  const baselineItems = useMemo(
    () =>
      activeProducts.map((product) => ({
        id: `baseline-${product.id}`,
        product_id: product.id,
        expected_quantity: getStock(product.id),
        counted_quantity: null,
        first_scanned_at: null,
      })),
    [activeProducts, getStock],
  );

  const visibleItems = activeId ? items : baselineItems;

  const summary = useMemo(
    () =>
      visibleItems.reduce(
        (state, item) => {
          state.total += 1;
          if (item.counted_quantity == null) state.unseen += 1;
          else if (item.counted_quantity === item.expected_quantity) state.match += 1;
          else if (item.counted_quantity < item.expected_quantity) state.short += 1;
          else state.excess += 1;
          return state;
        },
        { total: 0, unseen: 0, match: 0, short: 0, excess: 0 },
      ),
    [visibleItems],
  );

  return (
    <div className="stock-count-page">
      <div className="page-heading">
        <div>
          <h2>Physical Stock Count</h2>
          <p>
            Scan every physical bottle like POS. Search by barcode, SKU, name,
            brand, category, subcategory or size only when scanning is not available.
          </p>
        </div>

        {!counts.some((count) =>
          ["OPEN", "SUBMITTED"].includes(count.status),
        ) ? (
          <button className="primary-button" onClick={createCount}>
            Start Stock Count
          </button>
        ) : null}
      </div>

      {message ? <div className="purchase-message">{message}</div> : null}

      <div className="stats-grid">
        <div className="stat-card"><span>SKUs</span><strong>{summary.total}</strong></div>
        <div className="stat-card"><span>Matched</span><strong>{summary.match}</strong></div>
        <div className="stat-card"><span>Short</span><strong>{summary.short}</strong></div>
        <div className="stat-card"><span>Excess</span><strong>{summary.excess}</strong></div>
        <div className="stat-card"><span>Unseen</span><strong>{summary.unseen}</strong></div>
      </div>

      <section className="panel stock-count-scan-panel" style={{ marginTop: 16 }}>
        <div className="stock-count-scan-header">
          <div>
            <strong>Scan / Search Physical Stock</strong>
            <div className="muted-text">
              Scanner = primary. Search/manual quantity = fallback.
            </div>
          </div>
          <span className={activeStatus === "OPEN" ? "positive" : "muted-text"}>
            {activeStatus === "OPEN" ? "SCANNER READY" : "START AN OPEN COUNT"}
          </span>
        </div>

        <input
          ref={finderRef}
          className="pos-v5h-search-input"
          value={finder}
          disabled={activeStatus !== "OPEN"}
          onChange={(event) => setFinder(event.target.value)}
          onKeyDown={handleFinderKeyDown}
          placeholder={
            activeStatus === "OPEN"
              ? "Scan barcode, or search product / SKU / brand / category / size..."
              : "Start Stock Count to enable scan/search"
          }
          autoComplete="off"
          aria-label="Scan barcode or search physical stock"
        />

        {finder.trim() && activeStatus === "OPEN" ? (
          <div className="stock-count-search-results">
            {searchResults.length ? (
              searchResults.map((product) => {
                const item = itemByProductId[product.id];
                return (
                  <button
                    type="button"
                    className="stock-count-search-result"
                    key={product.id}
                    onClick={() => void incrementProduct(product)}
                  >
                    <span>
                      <strong>{product.name}</strong>
                      <small>
                        {[
                          product.brand,
                          product.sku,
                          product.barcode,
                          product.category,
                          product.subcategory,
                          product.size,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </small>
                    </span>
                    <span>
                      System {item?.expected_quantity ?? getStock(product.id)}
                      {" · "}
                      Counted {item?.counted_quantity ?? "—"}
                      {" · "}
                      <strong>Count +1</strong>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="muted-text">No matching count-snapshot product.</div>
            )}
          </div>
        ) : null}
      </section>

      <div className="panel stock-count-session-panel" style={{ marginTop: 16 }}>
        <label>
          Count Session
          <select
            value={activeId}
            onChange={(event) => setActiveId(event.target.value)}
          >
            <option value="">Current inventory baseline</option>
            {counts.map((count) => (
              <option key={count.id} value={count.id}>
                {count.count_number} · {count.status}
              </option>
            ))}
          </select>
        </label>

        {active ? (
          <div className="button-row" style={{ marginTop: 10 }}>
            {activeStatus === "OPEN" ? (
              <>
                <button className="secondary-button" onClick={markUnseenZero}>
                  Mark Unseen = 0
                </button>
                <button className="primary-button" onClick={submitCount}>
                  Submit Count
                </button>
              </>
            ) : null}
            {activeStatus === "SUBMITTED" ? (
              <button className="primary-button" onClick={approveCount}>
                Approve & Adjust Inventory
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        {!activeId ? (
          <div className="stock-count-guidance">
            <strong>No physical count session is open.</strong>
            <span>
              This is system stock only. Start Stock Count before physical counting.
            </span>
          </div>
        ) : null}

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>System</th>
                <th>Counted</th>
                <th>Count Status</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => {
                const product = products.find(
                  (row) => row.id === item.product_id,
                );
                const difference =
                  item.counted_quantity == null
                    ? null
                    : item.counted_quantity - item.expected_quantity;

                let countStatus = "NOT COUNTED";
                if (item.counted_quantity != null && item.first_scanned_at) {
                  countStatus = "COUNTED";
                } else if (item.counted_quantity === 0) {
                  countStatus = "MARKED ZERO";
                }

                return (
                  <tr key={item.id}>
                    <td>{product?.name || item.product_id.slice(0, 8)}</td>
                    <td>{item.expected_quantity}</td>
                    <td>
                      {activeId ? (
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.counted_quantity ?? ""}
                          placeholder="unseen"
                          disabled={activeStatus !== "OPEN"}
                          onChange={(event) => {
                            if (event.target.value !== "") {
                              void setQuantity(item, event.target.value);
                            }
                          }}
                        />
                      ) : (
                        <span className="muted-text">Not started</span>
                      )}
                    </td>
                    <td>{activeId ? countStatus : "BASELINE"}</td>
                    <td
                      className={
                        difference < 0
                          ? "negative"
                          : difference > 0
                            ? "positive"
                            : ""
                      }
                    >
                      {difference == null ? "—" : difference}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
