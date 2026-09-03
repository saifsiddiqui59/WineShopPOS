import SortableTable from "../components/ui/SortableTable";
import { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";
import ProductThumb from "../components/ui/ProductThumb";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Inventory() {
  const { products, getStock, adjustStock, loadingData } = useShop();
  const [selectedId, setSelectedId] = useState("");
  const [quantityChange, setQuantityChange] = useState(-1);
  const [adjustmentType, setAdjustmentType] = useState("STOCK_CORRECTION");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const active = products.filter((p) => p.active);
  const inventoryValue = useMemo(
    () => active.reduce((sum, p) => sum + getStock(p.id) * p.purchasePrice, 0),
    [active, getStock]
  );

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    const result = await adjustStock({
      productId: selectedId,
      adjustmentType,
      quantityChange: Number(quantityChange),
      reason,
    });

    setMessage(result.message);
    if (result.ok) setReason("");
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Inventory</h2><p>Live Supabase stock · value {money.format(inventoryValue)}</p></div>
      </div>

      <div className="settings-grid">
        <section className="panel">
          <h3>Current Stock</h3>
          <div className="data-table-wrapper">
            {loadingData ? <p>Loading...</p> : (
              <SortableTable className="data-table" resizeKey="inventory-current-stock-v1">
                <thead><tr><th>Product</th><th>Stock</th><th>Minimum</th><th>Status</th></tr></thead>
                <tbody>
                  {active.map((p) => {
                    const stock = getStock(p.id);
                    return (
                      <tr key={p.id}>
                        <td><div className="product-cell-with-image"><ProductThumb product={p} size="sm"/><span>{p.name}</span></div></td>
                        <td>{stock}</td>
                        <td>{p.minimumStock}</td>
                        <td>{stock <= p.minimumStock ? "LOW STOCK" : "IN STOCK"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </SortableTable>
            )}
          </div>
        </section>

        <form className="panel" onSubmit={submit}>
          <h3>Stock Adjustment</h3>
          <p>For damage, breakage, missing stock or physical-count correction.</p>

          <div className="settings-fields">
            <label>Product
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
                <option value="">Select product</option>
                {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>

            <label>Type
              <select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)}>
                <option value="STOCK_CORRECTION">Stock Correction</option>
                <option value="DAMAGE">Damage</option>
                <option value="BROKEN">Broken</option>
                <option value="MISSING">Missing</option>
                <option value="CUSTOMER_RETURN">Customer Return</option>
                <option value="SUPPLIER_RETURN">Supplier Return</option>
              </select>
            </label>

            <label>Quantity Change
              <input
                type="number"
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                required
              />
            </label>

            <label>Reason
              <input value={reason} onChange={(e) => setReason(e.target.value)} required />
            </label>
          </div>

          {message && <div className="purchase-message" style={{ marginTop: 12 }}>{message}</div>}
          <br/>
          <button className="primary-button">Apply Adjustment</button>
        </form>
      </div>
    </div>
  );
}
