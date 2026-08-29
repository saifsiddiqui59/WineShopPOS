import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function POS() {
  const { products, getStock, completeSale } = useShop();
  const navigate = useNavigate();
  const barcodeRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("Ready to scan barcode 8900000010016");
  const [busy, setBusy] = useState(false);

  const activeProducts = products.filter((p) => p.active);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return activeProducts.filter((p) =>
      [p.name,p.brand,p.sku,p.barcode].some((v) => String(v).toLowerCase().includes(q))
    ).slice(0,8);
  }, [search, activeProducts]);

  function cartQty(id) {
    return cart.find((item) => item.product.id === id)?.quantity ?? 0;
  }

  function add(product) {
    const stock = getStock(product.id);
    if (cartQty(product.id) >= stock) {
      setMessage(`Only ${stock} unit(s) available for ${product.name}.`);
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    setMessage(`${product.name} added.`);
  }

  function scan(event) {
    event.preventDefault();
    const code = barcode.trim();
    const product = activeProducts.find((p) => p.barcode === code);
    if (!product) setMessage(`Product not found: ${code}`);
    else add(product);
    setBarcode("");
    requestAnimationFrame(() => barcodeRef.current?.focus());
  }

  function change(id, delta) {
    const item = cart.find((x) => x.product.id === id);
    if (!item) return;
    const next = item.quantity + delta;
    if (next <= 0) {
      setCart((c) => c.filter((x) => x.product.id !== id));
      return;
    }
    if (next > getStock(id)) {
      setMessage(`Only ${getStock(id)} unit(s) available.`);
      return;
    }
    setCart((c) => c.map((x) => x.product.id === id ? { ...x, quantity: next } : x));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const normalizedDiscount = Math.max(0, Number(discount || 0));
  const total = Math.max(0, subtotal - normalizedDiscount);

  async function checkout() {
    setBusy(true);
    const result = await completeSale(cart, paymentMethod, {
      discount: normalizedDiscount,
      paymentReference,
    });
    setBusy(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setCart([]);
    setDiscount(0);
    setPaymentReference("");
    navigate(`/sales/${result.sale.id}`);
  }

  return (
    <div>
      <div className="page-heading"><div><h2>POS Billing</h2><p>USB/Bluetooth scanner works as keyboard input</p></div></div>

      <div className="pos-layout">
        <div className="pos-left">
          <form className="panel" onSubmit={scan}>
            <label>Scan Barcode</label>
            <div className="barcode-input-row">
              <input ref={barcodeRef} autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan barcode + Enter" />
              <button className="primary-button">Add</button>
            </div>
            <div className="purchase-message" style={{ marginTop:10 }}>{message}</div>
          </form>

          <div className="panel" style={{ marginTop:14 }}>
            <input style={{ width:"100%" }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product..." />
            {searchResults.map((p) => (
              <button key={p.id} type="button" className="search-result" onClick={() => add(p)}>
                <span>{p.name}</span>
                <span>{money.format(p.price)} · Stock {getStock(p.id)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Cart</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.product.id}>
                    <td>{item.product.name}</td>
                    <td>
                      <button type="button" onClick={() => change(item.product.id,-1)}>-</button>
                      {" "}{item.quantity}{" "}
                      <button type="button" onClick={() => change(item.product.id,1)}>+</button>
                    </td>
                    <td>{money.format(item.product.price)}</td>
                    <td>{money.format(item.product.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr/>
          <p>Subtotal <strong>{money.format(subtotal)}</strong></p>
          <label>Discount
            <input type="number" min="0" max={subtotal} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </label>
          <h2>Total {money.format(total)}</h2>

          <div className="payment-methods">
            {["CASH","UPI","CARD"].map((method) => (
              <button
                type="button"
                key={method}
                className={paymentMethod === method ? "payment-button active" : "payment-button"}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>

          {paymentMethod !== "CASH" && (
            <label>Payment Reference
              <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
            </label>
          )}

          <br/>
          <button className="primary-button" disabled={!cart.length || busy} onClick={checkout}>
            {busy ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
