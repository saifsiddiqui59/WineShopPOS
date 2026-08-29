import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  ScanBarcode,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
} from "lucide-react";
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

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState(
    "Ready to scan. Try barcode 8900000010016"
  );
  const [messageType, setMessageType] = useState("info");

  const barcodeRef = useRef(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return [];

    return products
      .filter(
        (product) =>
          product.active !== false &&
          (
            product.name.toLowerCase().includes(value) ||
            product.brand.toLowerCase().includes(value) ||
            product.sku.toLowerCase().includes(value) ||
            product.barcode.includes(value)
          )
      )
      .slice(0, 8);
  }, [search, products]);

  function currentCartQuantity(productId) {
    return (
      cart.find((item) => item.product.id === productId)?.quantity || 0
    );
  }

  function addProduct(product) {
    if (product.active === false) {
      setMessage(`${product.name} is inactive.`);
      setMessageType("error");
      return;
    }

    const available = getStock(product.id);
    const alreadyInCart = currentCartQuantity(product.id);

    if (available <= 0) {
      setMessage(`${product.name} is OUT OF STOCK.`);
      setMessageType("error");
      return;
    }

    if (alreadyInCart + 1 > available) {
      setMessage(`Only ${available} unit(s) of ${product.name} available.`);
      setMessageType("error");
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });

    setMessage(`${product.name} added to cart.`);
    setMessageType("success");
  }

  function handleBarcodeSubmit(event) {
    event.preventDefault();

    const scannedBarcode = barcode.trim();

    if (!scannedBarcode) return;

    const product = products.find(
      (item) =>
        item.active !== false &&
        item.barcode === scannedBarcode
    );

    if (!product) {
      setMessage(`PRODUCT NOT FOUND: ${scannedBarcode}`);
      setMessageType("error");
    } else {
      addProduct(product);
    }

    setBarcode("");

    requestAnimationFrame(() => barcodeRef.current?.focus());
  }

  function changeQuantity(productId, delta) {
    const item = cart.find(
      (cartItem) => cartItem.product.id === productId
    );

    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const available = getStock(productId);

    if (newQuantity > available) {
      setMessage(`Only ${available} unit(s) available.`);
      setMessageType("error");
      return;
    }

    setCart((current) =>
      current.map((cartItem) =>
        cartItem.product.id === productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  }

  function removeItem(productId) {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId)
    );
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const normalizedDiscount = Math.max(0, Number(discount) || 0);
  const grandTotal = Math.max(0, subtotal - normalizedDiscount);

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function handleCompleteSale() {
    const result = completeSale(cart, paymentMethod, {
      discount: normalizedDiscount,
      paymentReference,
    });

    if (!result.ok) {
      setMessage(result.message);
      setMessageType("error");
      return;
    }

    const saleId = result.sale.id;

    setCart([]);
    setSearch("");
    setDiscount(0);
    setPaymentReference("");
    setMessage(
      `${result.sale.invoiceNumber} completed successfully for ${money.format(
        result.sale.grandTotal
      )}.`
    );
    setMessageType("success");

    navigate(`/sales/${saleId}`);

    requestAnimationFrame(() => barcodeRef.current?.focus());
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>POS Billing</h2>
          <p>Scan barcode or search a product manually</p>
        </div>

        <div className="cart-count">
          <ShoppingCart size={18} />
          {itemCount} item(s)
        </div>
      </div>

      <div className="pos-layout">
        <section className="pos-left">
          <div className="panel barcode-panel">
            <form onSubmit={handleBarcodeSubmit}>
              <label className="input-label">
                <ScanBarcode size={18} />
                Scan Barcode
              </label>

              <div className="barcode-input-row">
                <input
                  ref={barcodeRef}
                  className="barcode-input"
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  placeholder="Scan barcode and press Enter"
                  autoComplete="off"
                />

                <button className="primary-button" type="submit">
                  Add
                </button>
              </div>
            </form>

            <div className={`pos-message ${messageType}`}>
              {message}
            </div>
          </div>

          <div className="panel">
            <label className="input-label">
              <Search size={18} />
              Manual Product Search
            </label>

            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, brand, SKU or barcode"
            />

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((product) => (
                  <button
                    type="button"
                    className="search-result"
                    key={product.id}
                    onClick={() => addProduct(product)}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {product.barcode} · {product.sku}
                      </span>
                    </div>

                    <div className="search-result-right">
                      <strong>{money.format(product.price)}</strong>
                      <span>Stock: {getStock(product.id)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Current Cart</h3>
                <p>Products added to this bill</p>
              </div>

              {cart.length > 0 && (
                <button
                  className="text-button danger-text"
                  onClick={() => setCart([])}
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={42} />
                <strong>Cart is empty</strong>
                <span>Scan a barcode to begin billing.</span>
              </div>
            ) : (
              <div className="cart-table">
                {cart.map((item) => (
                  <div className="cart-row" key={item.product.id}>
                    <div className="cart-product">
                      <strong>{item.product.name}</strong>
                      <span>
                        {item.product.barcode} · Stock{" "}
                        {getStock(item.product.id)}
                      </span>
                    </div>

                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, -1)
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        onClick={() =>
                          changeQuantity(item.product.id, 1)
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="cart-price">
                      <span>{money.format(item.product.price)} each</span>
                      <strong>
                        {money.format(
                          item.product.price * item.quantity
                        )}
                      </strong>
                    </div>

                    <button
                      className="icon-button danger"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="checkout-panel">
          <div>
            <h3>Bill Summary</h3>
            <p>{itemCount} item(s)</p>
          </div>

          <div className="bill-lines">
            <div>
              <span>Subtotal</span>
              <strong>{money.format(subtotal)}</strong>
            </div>

            <div className="discount-entry">
              <span>Discount ₹</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                step="1"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
            </div>
          </div>

          <div className="grand-total">
            <span>Grand Total</span>
            <strong>{money.format(grandTotal)}</strong>
          </div>

          <div className="payment-title">Payment Method</div>

          <div className="payment-options">
            <button
              className={
                paymentMethod === "CASH"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CASH")}
            >
              <Banknote size={21} />
              CASH
            </button>

            <button
              className={
                paymentMethod === "UPI"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("UPI")}
            >
              <Smartphone size={21} />
              UPI
            </button>

            <button
              className={
                paymentMethod === "CARD"
                  ? "payment-button selected"
                  : "payment-button"
              }
              onClick={() => setPaymentMethod("CARD")}
            >
              <CreditCard size={21} />
              CARD
            </button>
          </div>

          {paymentMethod !== "CASH" && (
            <label className="payment-reference-label">
              {paymentMethod === "UPI"
                ? "UPI Reference (optional)"
                : "Card Reference (optional)"}

              <input
                value={paymentReference}
                onChange={(event) =>
                  setPaymentReference(event.target.value)
                }
                placeholder="Transaction / reference number"
              />
            </label>
          )}

          <button
            className="complete-sale"
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
          >
            Complete Sale
            <span>{money.format(grandTotal)}</span>
          </button>

          <div className="test-barcode-box">
            <strong>Test Scanner</strong>
            <span>Try typing:</span>
            <code>8900000010016</code>
            <span>Then press Enter.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
