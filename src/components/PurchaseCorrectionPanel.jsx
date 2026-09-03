import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import SortableTable from "./ui/SortableTable";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function PurchaseCorrectionPanel({ purchase, products = [] }) {
  const { refreshAll } = useShop();
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products],
  );

  useEffect(() => {
    let active = true;
    async function loadHistory() {
      if (!purchase?.id) return;
      const { data, error } = await supabase.rpc("get_purchase_item_corrections", {
        p_purchase_id: purchase.id,
      });
      if (!active) return;
      if (!error) setHistory(data || []);
    }
    loadHistory();
    return () => { active = false; };
  }, [purchase?.id]);

  function start(item) {
    setMessage("");
    setEditing({
      itemId: item.id,
      productId: item.product_id,
      caseCount: Number(item.case_count || 0),
      unitsPerCase: Number(item.units_per_case || 1),
      looseBottles: Number(item.loose_bottles || 0),
      lineTotal: Number(item.line_total || 0),
      oldQuantity: Number(item.quantity || 0),
      reason: "",
      updateProductMaster: true,
    });
  }

  const correctedQuantity = editing
    ? Number(editing.caseCount || 0) * Number(editing.unitsPerCase || 1)
      + Number(editing.looseBottles || 0)
    : 0;
  const correctedPrice = editing && correctedQuantity > 0
    ? Number(editing.lineTotal || 0) / correctedQuantity
    : 0;
  const delta = editing ? correctedQuantity - editing.oldQuantity : 0;

  async function submit() {
    if (!editing || correctedQuantity <= 0) return;
    if (String(editing.reason || "").trim().length < 4) {
      setMessage("Enter a correction reason.");
      return;
    }

    const product = productById[editing.productId];
    const ok = window.confirm(
      `Correct ${product?.name || "this product"}?\n\n`
      + `Final bottles: ${editing.oldQuantity} → ${correctedQuantity}\n`
      + `Price/bottle: ${money.format(correctedPrice)}\n`
      + `Inventory change: ${delta >= 0 ? "+" : ""}${delta}\n\n`
      + `The supplier line value remains ${money.format(editing.lineTotal)}.`
    );
    if (!ok) return;

    setBusy(true);
    setMessage("");
    const { error } = await supabase.rpc("correct_received_purchase_item", {
      p_purchase_item_id: editing.itemId,
      p_case_count: Number(editing.caseCount),
      p_units_per_case: Number(editing.unitsPerCase),
      p_loose_bottles: Number(editing.looseBottles),
      p_reason: String(editing.reason).trim(),
      p_update_product_master: Boolean(editing.updateProductMaster),
    });
    if (error) {
      setBusy(false);
      setMessage(error.message || "Unable to correct purchase line.");
      return;
    }

    await refreshAll();
    setBusy(false);
    window.location.reload();
  }

  if (!purchase || purchase.status !== "RECEIVED") return null;

  return <section id="purchase-correction" className="panel verification-target" style={{ marginTop: 16 }}>
    <div className="panel-header">
      <div>
        <h3>Completed Purchase Correction</h3>
        <p>
          Audited correction only. Supplier line value stays fixed; quantity,
          per-bottle cost, inventory and unconsumed FIFO receipt lot move together.
        </p>
      </div>
    </div>

    {message ? <div className="purchase-message">{message}</div> : null}

    <div className="data-table-wrapper">
      <SortableTable className="data-table" showSerial={false} resizeKey="completed-purchase-correction" defaultColumnWidths={[300,95,145,120,125,125,100]}>
        <thead>
          <tr>
            <th>Product</th><th>Size (ml)</th><th>Posted Pack</th><th>Posted Bottles</th>
            <th>Line Value</th><th>Price/Bottle</th><th data-sort="false">Action</th>
          </tr>
        </thead>
        <tbody>
          {(purchase.purchase_items || []).map((item) => (
            <tr key={item.id}>
              <td>{productById[item.product_id]?.name || item.product_id}</td>
              <td>{productById[item.product_id]?.sizeMl || "—"}</td>
              <td>{item.case_count || 0} × {item.units_per_case || 1} + {item.loose_bottles || 0}</td>
              <td>{item.quantity}</td>
              <td>{money.format(Number(item.line_total || 0))}</td>
              <td>{money.format(Number(item.purchase_price || 0))}</td>
              <td>
                <button type="button" className="secondary-button" onClick={() => start(item)}>
                  Correct
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </SortableTable>
    </div>

    {editing ? <div className="purchase-correction-editor" style={{ marginTop: 16 }}>
      <h4>Correct {productById[editing.productId]?.name || "purchase line"}</h4>
      <div className="form-grid">
        <label>Cases
          <input type="number" min="0" value={editing.caseCount}
            onChange={(e) => setEditing((x) => ({ ...x, caseCount: e.target.value }))}/>
        </label>
        <label>Bottles / Case
          <input type="number" min="1" value={editing.unitsPerCase}
            onChange={(e) => setEditing((x) => ({ ...x, unitsPerCase: e.target.value }))}/>
        </label>
        <label>Loose Bottles
          <input type="number" min="0" value={editing.looseBottles}
            onChange={(e) => setEditing((x) => ({ ...x, looseBottles: e.target.value }))}/>
        </label>
        <label>Reason
          <input value={editing.reason} placeholder="e.g. CAN pack was 24, not 12"
            onChange={(e) => setEditing((x) => ({ ...x, reason: e.target.value }))}/>
        </label>
      </div>

      <div className="metric-grid four" style={{ marginTop: 12 }}>
        <div className="metric-card"><span>Correct Bottles</span><strong>{correctedQuantity}</strong></div>
        <div className="metric-card"><span>Inventory Delta</span><strong>{delta >= 0 ? "+" : ""}{delta}</strong></div>
        <div className="metric-card"><span>Line Value Fixed</span><strong>{money.format(editing.lineTotal)}</strong></div>
        <div className="metric-card"><span>Correct Price/Bottle</span><strong>{money.format(correctedPrice)}</strong></div>
      </div>

      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <input type="checkbox" checked={editing.updateProductMaster}
          onChange={(e) => setEditing((x) => ({ ...x, updateProductMaster: e.target.checked }))}/>
        Also update Product Master bottles/case and purchase price
      </label>

      <div className="button-row" style={{ marginTop: 12 }}>
        <button type="button" className="primary-button" disabled={busy} onClick={submit}>
          {busy ? "Correcting..." : "Confirm Audited Correction"}
        </button>
        <button type="button" className="secondary-button" disabled={busy} onClick={() => setEditing(null)}>
          Cancel
        </button>
      </div>
      <p className="muted-text" style={{ marginTop: 10 }}>
        If any unit from this FIFO receipt lot has already been consumed, the database blocks this simple correction.
      </p>
    </div> : null}

    {history.length ? <div id="correction-history" className="verification-target" style={{ marginTop: 18 }}>
      <h4>Correction History</h4>
      <div className="data-table-wrapper">
        <SortableTable className="data-table" showSerial={false} resizeKey="purchase-correction-history" defaultColumnWidths={[180,280,110,420]}>
          <thead><tr><th>Time</th><th>Product</th><th>Qty Delta</th><th>Reason</th></tr></thead>
          <tbody>{history.map((row) => <tr key={row.id}>
            <td>{new Date(row.created_at).toLocaleString()}</td>
            <td>{productById[row.product_id]?.name || row.product_id}</td>
            <td>{row.quantity_delta >= 0 ? "+" : ""}{row.quantity_delta}</td>
            <td>{row.reason}</td>
          </tr>)}</tbody>
        </SortableTable>
      </div>
    </div> : null}
  </section>;
}
