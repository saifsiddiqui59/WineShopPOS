import { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function emptyLine() {
  return {
    productId: "",
    caseCount: 0,
    unitsPerCase: 12,
    looseBottles: 0,
    quantity: 0,
    purchasePrice: 0,
  };
}

export default function Purchases() {
  const { products, purchases, suppliers, receiveStock } = useShop();
  const active = products.filter((p) => p.active);

  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([emptyLine()]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function updateLine(index, field, value) {
    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [field]: value };

        if (field === "productId") {
          const product = active.find((p) => p.id === value);
          if (product) {
            next.unitsPerCase = product.unitsPerCase || 1;
            next.purchasePrice = product.purchasePrice || 0;
          }
        }

        const cases = Number(next.caseCount || 0);
        const units = Number(next.unitsPerCase || 1);
        const loose = Number(next.looseBottles || 0);
        next.quantity = cases * units + loose;
        return next;
      })
    );
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.purchasePrice || 0), 0),
    [items]
  );

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const cleaned = items.filter((item) => item.productId && Number(item.quantity) > 0);

    const result = await receiveStock({
      supplierName,
      invoiceNumber,
      invoiceDate,
      notes,
      items: cleaned,
    });

    setMessage(result.message);
    if (result.ok) {
      setInvoiceNumber("");
      setNotes("");
      setItems([emptyLine()]);
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Receive Stock</h2><p>Purchases update inventory transactionally in Supabase</p></div>
      </div>

      <form className="panel" onSubmit={submit}>
        <div className="form-grid">
          <label>Supplier
            <input
              list="supplier-list"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              required
            />
            <datalist id="supplier-list">
              {suppliers.filter((s) => s.active).map((s) => <option key={s.id} value={s.supplier_name} />)}
            </datalist>
          </label>
          <label>Supplier Invoice<input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required /></label>
          <label>Invoice Date<input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required /></label>
          <label>Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        </div>

        <div className="data-table-wrapper" style={{ marginTop: 18 }}>
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Cases</th><th>Bottles/Case</th><th>Loose</th><th>Total Bottles</th><th>Price/Bottle</th><th>Line Total</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select value={item.productId} onChange={(e) => updateLine(index,"productId",e.target.value)} required>
                      <option value="">Select</option>
                      {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td><input type="number" min="0" value={item.caseCount} onChange={(e) => updateLine(index,"caseCount",e.target.value)} /></td>
                  <td><input type="number" min="1" value={item.unitsPerCase} onChange={(e) => updateLine(index,"unitsPerCase",e.target.value)} /></td>
                  <td><input type="number" min="0" value={item.looseBottles} onChange={(e) => updateLine(index,"looseBottles",e.target.value)} /></td>
                  <td>{item.quantity}</td>
                  <td><input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={(e) => updateLine(index,"purchasePrice",e.target.value)} /></td>
                  <td>{money.format(Number(item.quantity || 0) * Number(item.purchasePrice || 0))}</td>
                  <td>
                    <button type="button" className="secondary-button" onClick={() => setItems((c) => c.filter((_,i) => i !== index))}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, gap:10 }}>
          <button type="button" className="secondary-button" onClick={() => setItems((c) => [...c, emptyLine()])}>Add Line</button>
          <strong>Total: {money.format(total)}</strong>
        </div>

        {message && <div className="purchase-message" style={{ marginTop:12 }}>{message}</div>}
        <br/>
        <button className="primary-button" disabled={busy}>{busy ? "Receiving..." : "Receive Stock"}</button>
      </form>

      <section className="panel" style={{ marginTop:18 }}>
        <h3>Invoice OCR</h3>
        <p>
          Architecture is reserved for Azure AI Document Intelligence: invoice image/PDF → extracted lines →
          product match → human confirmation → receive_purchase(). OCR is not enabled yet because an Azure
          Document Intelligence resource/endpoint has not been provided.
        </p>
      </section>

      <section className="panel" style={{ marginTop:18 }}>
        <h3>Recent Purchases</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>Purchase</th><th>Invoice</th><th>Supplier</th><th>Date</th><th>Units</th><th>Total</th></tr></thead>
            <tbody>
              {purchases.slice(0,20).map((p) => (
                <tr key={p.id}>
                  <td>{p.purchaseNumber}</td>
                  <td>{p.invoiceNumber}</td>
                  <td>{p.supplierName}</td>
                  <td>{p.invoiceDate}</td>
                  <td>{p.totalUnits}</td>
                  <td>{money.format(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
