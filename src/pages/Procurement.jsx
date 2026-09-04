import SortableTable from "../components/ui/SortableTable";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import FeatureTierBadge from "../components/ui/FeatureTierBadge";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import SupplierEditor from "../components/SupplierEditor";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const line = () => ({ productId: "", quantity: 12, purchasePrice: 0 });

export default function Procurement() {
  const { products, suppliers, refreshAll } = useShop();
  const [orders, setOrders] = useState([]);
  const [balances, setBalances] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([line()]);
  const [expected, setExpected] = useState("");
  const [message, setMessage] = useState("");
  const [supplierEditor, setSupplierEditor] = useState({ open: false, supplier: null });
  const [payment, setPayment] = useState({ supplierId: "", amount: "", method: "BANK_TRANSFER", reference: "" });
  const [receive, setReceive] = useState({
    poId: "",
    invoice: "",
    date: new Date().toISOString().slice(0, 10),
    freightAmount: 0,
    transportAmount: 0,
    handlingAmount: 0,
    loadingUnloadingAmount: 0,
    supplierDiscountAmount: 0,
    invoiceDiscountAmount: 0,
    miscellaneousAmount: 0,
    roundingAdjustment: 0,
  });
  const [ret, setRet] = useState({ supplierId: "", productId: "", qty: 1, reason: "Damaged/incorrect supply" });

  async function load() {
    const [po, b] = await Promise.all([
      supabase.from("purchase_orders").select("*,purchase_order_items(*)").order("created_at", { ascending: false }).limit(150),
      supabase.rpc("supplier_balances"),
    ]);
    if (po.error || b.error) setMessage("Unable to load procurement data.");
    else { setOrders(po.data || []); setBalances(b.data || []); }
  }

  useEffect(() => { load(); }, []);

  function update(index, key, value) {
    setItems((current) => current.map((row, rowIndex) => rowIndex === index ? {
      ...row,
      [key]: value,
      ...(key === "productId" ? { purchasePrice: products.find((p) => p.id === value)?.purchasePrice || 0 } : {}),
    } : row));
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.purchasePrice || 0), 0), [items]);
  const receiveAdjustment = useMemo(() =>
    Number(receive.freightAmount || 0)
    + Number(receive.transportAmount || 0)
    + Number(receive.handlingAmount || 0)
    + Number(receive.loadingUnloadingAmount || 0)
    + Number(receive.miscellaneousAmount || 0)
    - Number(receive.supplierDiscountAmount || 0)
    - Number(receive.invoiceDiscountAmount || 0)
    + Number(receive.roundingAdjustment || 0),
  [receive]);
  const selectedSupplier = suppliers.find((supplier) => supplier.id === supplierId) || null;

  async function supplierSaved(saved) {
    await refreshAll();
    if (saved?.id) setSupplierId(saved.id);
    setMessage(saved?.supplier_name ? `Supplier “${saved.supplier_name}” saved and selected.` : "Supplier saved.");
  }

  async function createPO(event) {
    event.preventDefault();
    const payload = items
      .filter((item) => item.productId && Number(item.quantity) > 0)
      .map((item) => ({ product_id: item.productId, quantity: Number(item.quantity), purchase_price: Number(item.purchasePrice) }));
    const { error } = await supabase.rpc("create_purchase_order", {
      p_supplier_id: supplierId,
      p_items: payload,
      p_expected_date: expected || null,
      p_notes: null,
    });
    setMessage(error ? "Unable to create purchase order." : "Draft purchase order created.");
    if (!error) { setItems([line()]); await load(); }
  }

  async function rpc(fn, args, ok) {
    const { error } = await supabase.rpc(fn, args);
    setMessage(error ? `Unable to complete ${ok.toLowerCase()}.` : ok);
    if (!error) await Promise.all([load(), refreshAll()]);
  }

  async function receivePO(event) {
    event.preventDefault();
    if (!receive.poId) return;

    const v2Args = {
      p_po_id: receive.poId,
      p_invoice_number: receive.invoice,
      p_invoice_date: receive.date,
      p_receive_items: null,
      p_notes: "Received from consolidated Procurement",
      p_freight_amount: Number(receive.freightAmount || 0),
      p_transport_amount: Number(receive.transportAmount || 0),
      p_handling_amount: Number(receive.handlingAmount || 0),
      p_loading_unloading_amount: Number(receive.loadingUnloadingAmount || 0),
      p_supplier_discount_amount: Number(receive.supplierDiscountAmount || 0),
      p_invoice_discount_amount: Number(receive.invoiceDiscountAmount || 0),
      p_miscellaneous_amount: Number(receive.miscellaneousAmount || 0),
      p_rounding_adjustment: Number(receive.roundingAdjustment || 0),
    };

    let { error } = await supabase.rpc("receive_purchase_order_v2", v2Args);
    const missingV2 = error && (
      error.code === "PGRST202" ||
      error.code === "42883" ||
      /receive_purchase_order_v2|could not find the function|does not exist/i.test(error.message || "")
    );

    if (missingV2) {
      const hasLandedAdjustments = [
        "freightAmount","transportAmount","handlingAmount","loadingUnloadingAmount",
        "supplierDiscountAmount","invoiceDiscountAmount","miscellaneousAmount","roundingAdjustment",
      ].some((key) => Number(receive[key] || 0) !== 0);

      if (hasLandedAdjustments) {
        setMessage("V2 landed-cost database migration is not active yet. No PO receipt was posted.");
        return;
      }

      const legacy = await supabase.rpc("receive_purchase_order", {
        p_po_id: receive.poId,
        p_invoice_number: receive.invoice,
        p_invoice_date: receive.date,
        p_receive_items: null,
        p_notes: "Received from consolidated Procurement",
      });
      error = legacy.error;
    }

    setMessage(error
      ? "Unable to receive this purchase order. Check status, invoice number and quantities."
      : "Goods received transactionally; landed cost and receipt lots were finalized.");
    if (!error) {
      setReceive({
        poId: "", invoice: "", date: new Date().toISOString().slice(0, 10),
        freightAmount: 0, transportAmount: 0, handlingAmount: 0,
        loadingUnloadingAmount: 0, supplierDiscountAmount: 0,
        invoiceDiscountAmount: 0, miscellaneousAmount: 0, roundingAdjustment: 0,
      });
      await Promise.all([load(), refreshAll()]);
    }
  }
  async function pay(event) {
    event.preventDefault();
    const { error } = await supabase.rpc("record_supplier_payment", {
      p_supplier_id: payment.supplierId,
      p_amount: Number(payment.amount),
      p_payment_method: payment.method,
      p_reference: payment.reference || null,
      p_payment_date: new Date().toISOString().slice(0, 10),
      p_notes: null,
    });
    setMessage(error ? "Unable to record supplier payment." : "Supplier payment recorded.");
    if (!error) { setPayment({ ...payment, amount: "", reference: "" }); load(); }
  }

  async function purchaseReturn(event) {
    event.preventDefault();
    const product = products.find((item) => item.id === ret.productId);
    if (!product) return;
    const { error } = await supabase.rpc("create_purchase_return", {
      p_supplier_id: ret.supplierId,
      p_items: [{ product_id: ret.productId, quantity: Number(ret.qty), purchase_price: product.purchasePrice }],
      p_reason: ret.reason,
      p_purchase_id: null,
    });
    setMessage(error ? "Unable to complete supplier return." : "Supplier return completed; stock reduced with movement history.");
    if (!error) {
      setRet({ ...ret, productId: "", qty: 1 });
      await Promise.all([load(), refreshAll()]);
    }
  }

  return <div>
    <PageHeader title="Advanced Supplier & Procurement" subtitle="Draft → approval → send → receive → supplier balance/payment → purchase return." tier="PLUS" />
    {message ? <div className="purchase-message">{message}</div> : null}

    <div className="settings-grid">
      <form className="panel" onSubmit={createPO}>
        <h3>Create Purchase Order <FeatureTierBadge tier="PLUS" /></h3>
        <div className="settings-fields">
          <label>Supplier
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
              <option value="">Select supplier</option>
              {suppliers.filter((s) => s.active !== false).map((s) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
            </select>
          </label>
          <label>Expected Date<input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></label>
        </div>
        <div className="button-row compact supplier-inline-actions">
          <button type="button" className="secondary-button" onClick={() => setSupplierEditor({ open: true, supplier: null })}>+ New Supplier</button>
          <button type="button" className="secondary-button" disabled={!selectedSupplier} onClick={() => setSupplierEditor({ open: true, supplier: selectedSupplier })}>Edit Selected Supplier</button>
        </div>

        <div className="data-table-wrapper"><SortableTable className="data-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Purchase Price</th><th></th></tr></thead>
          <tbody>{items.map((item, index) => <tr key={index}>
            <td><select value={item.productId} onChange={(e) => update(index, "productId", e.target.value)} required><option value="">Select</option>{products.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
            <td><input type="number" min="1" value={item.quantity} onChange={(e) => update(index, "quantity", e.target.value)} /></td>
            <td><input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={(e) => update(index, "purchasePrice", e.target.value)} /></td>
            <td><button type="button" className="icon-button" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))}>×</button></td>
          </tr>)}</tbody>
        </SortableTable></div>
        <p><strong>Total: {money.format(total)}</strong></p>
        <div className="button-row"><button type="button" className="secondary-button" onClick={() => setItems((current) => [...current, line()])}>Add Line</button><button className="primary-button">Create Draft PO</button></div>
      </form>

      <form className="panel" onSubmit={receivePO}>
        <h3>Receive Approved/Sent PO</h3>
        <div className="settings-fields">
          <label>Purchase Order<select value={receive.poId} onChange={(e) => setReceive({ ...receive, poId: e.target.value })} required><option value="">Select ready PO</option>{orders.filter((o) => ["APPROVED", "SENT", "PARTIALLY_RECEIVED"].includes(o.status)).map((o) => <option key={o.id} value={o.id}>{o.po_number} · {o.status}</option>)}</select></label>
          <label>Supplier Invoice<input required value={receive.invoice} onChange={(e) => setReceive({ ...receive, invoice: e.target.value })} /></label>
          <label>Invoice Date<input type="date" required value={receive.date} onChange={(e) => setReceive({ ...receive, date: e.target.value })} /></label>
          <label>Freight<input type="number" min="0" step="0.01" value={receive.freightAmount} onChange={(e) => setReceive({ ...receive, freightAmount: e.target.value })} /></label>
          <label>Transport<input type="number" min="0" step="0.01" value={receive.transportAmount} onChange={(e) => setReceive({ ...receive, transportAmount: e.target.value })} /></label>
          <label>Handling<input type="number" min="0" step="0.01" value={receive.handlingAmount} onChange={(e) => setReceive({ ...receive, handlingAmount: e.target.value })} /></label>
          <label>Loading / Unloading<input type="number" min="0" step="0.01" value={receive.loadingUnloadingAmount} onChange={(e) => setReceive({ ...receive, loadingUnloadingAmount: e.target.value })} /></label>
          <label>Supplier Discount<input type="number" min="0" step="0.01" value={receive.supplierDiscountAmount} onChange={(e) => setReceive({ ...receive, supplierDiscountAmount: e.target.value })} /></label>
          <label>Invoice Discount<input type="number" min="0" step="0.01" value={receive.invoiceDiscountAmount} onChange={(e) => setReceive({ ...receive, invoiceDiscountAmount: e.target.value })} /></label>
          <label>Miscellaneous<input type="number" min="0" step="0.01" value={receive.miscellaneousAmount} onChange={(e) => setReceive({ ...receive, miscellaneousAmount: e.target.value })} /></label>
          <label>Rounding Adjustment<input type="number" step="0.01" value={receive.roundingAdjustment} onChange={(e) => setReceive({ ...receive, roundingAdjustment: e.target.value })} /></label>
        </div>
        <p className="muted-text">Inventory changes remain inside the controlled PO receive RPC. Net landed-cost adjustment: <strong>{money.format(receiveAdjustment)}</strong></p>
        <button className="primary-button">Receive Goods</button>
      </form>
    </div>

    <div className="settings-grid" style={{ marginTop: 16 }}>
      <form className="panel" onSubmit={pay}>
        <h3>Supplier Payment</h3>
        <div className="settings-fields">
          <label>Supplier<select value={payment.supplierId} onChange={(e) => setPayment({ ...payment, supplierId: e.target.value })} required><option value="">Select</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label>
          <label>Amount<input type="number" min="0.01" step="0.01" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} required /></label>
          <label>Method<select value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })}>{["BANK_TRANSFER", "UPI", "CASH", "CARD", "CHEQUE", "OTHER"].map((method) => <option key={method}>{method}</option>)}</select></label>
          <label>Reference<input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} /></label>
        </div>
        <button className="primary-button">Record Payment</button>
      </form>

      <form className="panel" onSubmit={purchaseReturn}>
        <h3>Purchase Return</h3>
        <div className="settings-fields">
          <label>Supplier<select required value={ret.supplierId} onChange={(e) => setRet({ ...ret, supplierId: e.target.value })}><option value="">Select</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}</select></label>
          <label>Product<select required value={ret.productId} onChange={(e) => setRet({ ...ret, productId: e.target.value })}><option value="">Select</option>{products.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>Quantity<input type="number" min="1" required value={ret.qty} onChange={(e) => setRet({ ...ret, qty: e.target.value })} /></label>
          <label>Reason<input required value={ret.reason} onChange={(e) => setRet({ ...ret, reason: e.target.value })} /></label>
        </div>
        <button className="secondary-button">Complete Return</button>
      </form>
    </div>

    <section className="panel" style={{ marginTop: 16 }}>
      <h3>Purchase Orders</h3>
      {orders.length === 0 ? <EmptyState title="No purchase orders" message="Create a draft purchase order to begin procurement." /> : <div className="data-table-wrapper"><table className="data-table sticky">
        <thead><tr><th>PO</th><th>Supplier</th><th>Status</th><th>Expected</th><th>Total</th><th>Next Action</th></tr></thead>
        <tbody>{orders.map((order) => <tr key={order.id}>
          <td>{order.po_number}</td>
          <td>{suppliers.find((s) => s.id === order.supplier_id)?.supplier_name || "Supplier"}</td>
          <td><StatusBadge status={order.status} /></td>
          <td>{order.expected_date || "-"}</td>
          <td>{money.format(order.subtotal)}</td>
          <td><div className="button-row compact">
            {order.status === "DRAFT" ? <button className="secondary-button" onClick={() => rpc("submit_purchase_order", { p_po_id: order.id }, "Submitted for approval")}>Submit</button> : null}
            {order.status === "APPROVAL_PENDING" ? <button className="primary-button" onClick={() => rpc("approve_purchase_order", { p_po_id: order.id }, "Purchase order approved")}>Approve</button> : null}
            {order.status === "APPROVED" ? <button className="secondary-button" onClick={() => rpc("set_purchase_order_status", { p_po_id: order.id, p_status: "SENT" }, "Purchase order marked sent")}>Mark Sent</button> : null}
          </div></td>
        </tr>)}</tbody>
      </table></div>}
    </section>

    <section className="panel" style={{ marginTop: 16 }}>
      <h3>Supplier Balance</h3>
      <div className="data-table-wrapper"><SortableTable className="data-table">
        <thead><tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Returns</th><th>Balance</th></tr></thead>
        <tbody>{balances.map((balance) => <tr key={balance.supplier_id}><td>{balance.supplier_name}</td><td>{money.format(balance.purchases)}</td><td>{money.format(balance.payments)}</td><td>{money.format(balance.returns)}</td><td><strong>{money.format(balance.balance)}</strong></td></tr>)}</tbody>
      </SortableTable></div>
    </section>

    <SupplierEditor
      open={supplierEditor.open}
      supplier={supplierEditor.supplier}
      onClose={() => setSupplierEditor({ open: false, supplier: null })}
      onSaved={supplierSaved}
    />
  </div>;
}

