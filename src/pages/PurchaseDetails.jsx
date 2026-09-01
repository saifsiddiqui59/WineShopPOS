import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getInvoiceReadUrl } from "../lib/invoiceClient";
import { resolveInvoiceUnitsPerCase } from "../lib/invoicePack";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export default function PurchaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { products } = useShop();
  const [purchase, setPurchase] = useState(null);
  const [ingestion, setIngestion] = useState(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setBusy(true);
      setMessage("");
      const { data: p, error: pe } = await supabase
        .from("purchases")
        .select(`id,purchase_number,supplier_id,supplier_name_snapshot,invoice_number,invoice_date,subtotal,tax,total,status,notes,created_at,
          freight_amount,transport_amount,handling_amount,loading_unloading_amount,supplier_discount_amount,invoice_discount_amount,
          miscellaneous_amount,rounding_adjustment,total_landed_cost,landed_cost_method,landed_cost_finalized_at,
          purchase_items(id,product_id,quantity,purchase_unit,case_count,units_per_case,loose_bottles,purchase_price,line_total,
            batch_number,expiry_date,allocated_landed_cost,landed_unit_cost)`)
        .eq("id", id)
        .single();
      if (!active) return;
      if (pe) {
        setMessage(pe.message || "Unable to load purchase receipt.");
        setPurchase(null);
        setBusy(false);
        return;
      }
      setPurchase(p);

      const { data: rows, error: ie } = await supabase
        .from("invoice_ingestions")
        .select("id,purchase_id,source,original_file_name,stored_file_name,received_at,review_status,extracted_supplier_name,extracted_invoice_number,extracted_invoice_date,extracted_total,normalized_invoice")
        .eq("purchase_id", id)
        .order("received_at", { ascending: false })
        .limit(1);
      if (!active) return;
      if (ie) setMessage(`Purchase loaded, but invoice evidence could not be loaded: ${ie.message}`);
      setIngestion(rows?.[0] || null);
      setBusy(false);
    }
    load();
    return () => { active = false; };
  }, [id]);

  const productById = useMemo(
    () => Object.fromEntries((products || []).map((p) => [p.id, p])),
    [products],
  );

  const postedUnits = useMemo(
    () => (purchase?.purchase_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [purchase],
  );

  const ocrPackAudit = useMemo(() => {
    const items = ingestion?.normalized_invoice?.items || [];
    if (!items.length) return { units: null, complete: false, rows: [] };
    const rows = items.map((item) => {
      const pack = resolveInvoiceUnitsPerCase(item, null);
      const cases = Number(item.caseCount || 0);
      const loose = Number(item.looseBottles || 0);
      const strong = pack.source !== "DEFAULT_REVIEW" && cases > 0;
      return {
        description: item.description || "OCR line",
        cases,
        unitsPerCase: pack.value,
        source: pack.source,
        expectedUnits: strong ? cases * pack.value + loose : null,
        strong,
        amount: Number(item.amount || 0),
        ratePerCase: Number(item.ratePerCase || item.unitPrice || 0),
        batchNumber: item.batchNumber || "",
      };
    });
    const complete = rows.every((row) => row.strong && Number.isFinite(row.expectedUnits));
    return {
      rows,
      complete,
      units: complete ? rows.reduce((sum, row) => sum + row.expectedUnits, 0) : null,
    };
  }, [ingestion]);

  async function viewOriginal() {
    if (!ingestion?.id) return;
    setMessage("");
    try {
      const r = await getInvoiceReadUrl({ token: session?.access_token, ingestionId: ingestion.id });
      window.open(r.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMessage(error.message || "Unable to open original invoice.");
    }
  }

  if (busy) return <div className="panel">Loading purchase receipt...</div>;
  if (!purchase) return <div className="panel">{message || "Purchase not found."}</div>;

  const productValue = Number(purchase.total || 0);
  const landedTotal = purchase.total_landed_cost == null ? productValue : Number(purchase.total_landed_cost || 0);
  const extractedTotal = ingestion?.extracted_total == null ? null : Number(ingestion.extracted_total);
  const financialMatch = extractedTotal == null || Math.abs(extractedTotal - landedTotal) <= 1;
  const unitMatch = ocrPackAudit.units == null || ocrPackAudit.units === postedUnits;

  return <div>
    <div className="page-heading">
      <div>
        <h2>Purchase Verification</h2>
        <p>Compare the original supplier invoice, OCR evidence and the exact stock receipt posted to WineShopPOS.</p>
      </div>
      <div className="button-row">
        {ingestion ? <button type="button" className="primary-button" onClick={viewOriginal}>View Original Invoice</button> : null}
        <button type="button" className="secondary-button" onClick={() => navigate("/purchasing/invoices")}>Invoice Inbox</button>
      </div>
    </div>

    {message ? <div className="purchase-message">{message}</div> : null}
    {!ingestion ? <div className="purchase-message">No retained original invoice is linked to this purchase. Older/manual receipts may require the physical invoice for verification.</div> : null}

    <section className="panel">
      <div className="metric-grid four">
        <div className="metric-card"><span>Purchase</span><strong>{purchase.purchase_number}</strong></div>
        <div className="metric-card"><span>Supplier Invoice</span><strong>{purchase.invoice_number || "—"}</strong></div>
        <div className="metric-card"><span>Invoice Date</span><strong>{purchase.invoice_date || "—"}</strong></div>
        <div className="metric-card"><span>Status</span><strong>{purchase.status || "POSTED"}</strong></div>
      </div>
      <div className="metric-grid four" style={{ marginTop: 12 }}>
        <div className="metric-card"><span>Posted Bottles</span><strong>{postedUnits}</strong></div>
        <div className="metric-card"><span>OCR Expected Bottles</span><strong>{ocrPackAudit.units == null ? "Needs review" : ocrPackAudit.units}</strong></div>
        <div className="metric-card"><span>Product Value</span><strong>{money.format(productValue)}</strong></div>
        <div className="metric-card"><span>Landed / Invoice Total</span><strong>{money.format(landedTotal)}</strong></div>
      </div>
      <div className="metric-grid four" style={{ marginTop: 12 }}>
        <div className="metric-card"><span>OCR Printed Total</span><strong>{extractedTotal == null ? "—" : money.format(extractedTotal)}</strong></div>
        <div className="metric-card"><span>Financial Check</span><strong>{financialMatch ? "MATCH" : "REVIEW"}</strong></div>
        <div className="metric-card"><span>Quantity Check</span><strong>{unitMatch ? "MATCH" : "REVIEW"}</strong></div>
        <div className="metric-card"><span>Evidence</span><strong>{ingestion ? "Original retained" : "No linked image"}</strong></div>
      </div>
      {!financialMatch || !unitMatch ? (
        <div className="purchase-message" style={{ marginTop: 14 }}>
          REVIEW REQUIRED: posted receipt does not match the retained OCR evidence. Do not silently edit historical inventory; use an audited correction/reversal workflow.
        </div>
      ) : null}
    </section>

    <section className="panel" style={{ marginTop: 16 }}>
      <h3>Posted Purchase Lines</h3>
      <div className="data-table-wrapper"><table className="data-table">
        <thead><tr><th>Product</th><th>Cases</th><th>Bottles/Case</th><th>Loose</th><th>Final Bottles</th><th>Price/Bottle</th><th>Batch</th><th>Expiry</th><th>Line Value</th></tr></thead>
        <tbody>
          {(purchase.purchase_items || []).map((item) => <tr key={item.id}>
            <td>{productById[item.product_id]?.name || item.product_id}</td>
            <td>{item.case_count ?? 0}</td>
            <td>{item.units_per_case ?? 1}</td>
            <td>{item.loose_bottles ?? 0}</td>
            <td><strong>{item.quantity}</strong></td>
            <td>{money.format(Number(item.purchase_price || 0))}</td>
            <td>{item.batch_number || "—"}</td>
            <td>{item.expiry_date || "—"}</td>
            <td>{money.format(Number(item.line_total || 0))}</td>
          </tr>)}
        </tbody>
      </table></div>
    </section>

    {ocrPackAudit.rows.length ? <section className="panel" style={{ marginTop: 16 }}>
      <h3>OCR Evidence Used for Physical Cross-check</h3>
      <p className="muted-text">This is retained extraction evidence, not a second inventory posting. Uncertain pack inference remains visibly marked for review.</p>
      <div className="data-table-wrapper"><table className="data-table">
        <thead><tr><th>OCR Description</th><th>Cases</th><th>Pack Hint</th><th>Expected Bottles</th><th>Rate/Case</th><th>Amount</th><th>Batch OCR</th></tr></thead>
        <tbody>{ocrPackAudit.rows.map((row, index) => <tr key={index}>
          <td>{row.description}</td>
          <td>{row.cases || "—"}</td>
          <td>{row.strong ? `${row.unitsPerCase} · ${row.source}` : "Review"}</td>
          <td>{row.expectedUnits ?? "Review"}</td>
          <td>{row.ratePerCase ? money.format(row.ratePerCase) : "—"}</td>
          <td>{row.amount ? money.format(row.amount) : "—"}</td>
          <td>{row.batchNumber || "—"}</td>
        </tr>)}</tbody>
      </table></div>
    </section> : null}

    <section className="panel" style={{ marginTop: 16 }}>
      <h3>Landed-cost Adjustments Posted</h3>
      <div className="metric-grid four">
        <div className="metric-card"><span>Freight</span><strong>{money.format(Number(purchase.freight_amount || 0))}</strong></div>
        <div className="metric-card"><span>Transport/Handling</span><strong>{money.format(Number(purchase.transport_amount || 0) + Number(purchase.handling_amount || 0) + Number(purchase.loading_unloading_amount || 0))}</strong></div>
        <div className="metric-card"><span>Discounts</span><strong>{money.format(Number(purchase.supplier_discount_amount || 0) + Number(purchase.invoice_discount_amount || 0))}</strong></div>
        <div className="metric-card"><span>Misc / Round</span><strong>{money.format(Number(purchase.miscellaneous_amount || 0) + Number(purchase.rounding_adjustment || 0))}</strong></div>
      </div>
    </section>
  </div>;
}
