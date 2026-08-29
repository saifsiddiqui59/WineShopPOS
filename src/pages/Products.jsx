import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Products() {
  const { products, getStock, deactivateProduct, activateProduct, loadingData } = useShop();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.brand, p.sku, p.barcode, p.category]
        .some((value) => String(value ?? "").toLowerCase().includes(q))
    );
  }, [products, search]);

  async function toggle(product) {
    const result = product.active
      ? await deactivateProduct(product.id)
      : await activateProduct(product.id);
    setMessage(result.message);
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Products</h2><p>{products.length} products in Supabase</p></div>
        <Link to="/products/new" className="primary-button">Add Product</Link>
      </div>

      {message && <div className="purchase-message success">{message}</div>}

      <div className="panel">
        <input
          placeholder="Search name, barcode, SKU, brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 420 }}
        />
      </div>

      <div className="panel data-table-wrapper" style={{ marginTop: 14 }}>
        {loadingData ? <p>Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th><th>Barcode</th><th>Category</th><th>Stock</th>
                <th>Purchase</th><th>Selling</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br/><small>{p.brand} · {p.size}</small></td>
                  <td>{p.barcode}</td>
                  <td>{p.category}</td>
                  <td>{getStock(p.id)}</td>
                  <td>{money.format(p.purchasePrice)}</td>
                  <td>{money.format(p.price)}</td>
                  <td>{p.active ? "ACTIVE" : "INACTIVE"}</td>
                  <td>
                    <Link className="secondary-button" to={`/products/${p.id}/edit`}>Edit</Link>{" "}
                    <button className="secondary-button" onClick={() => toggle(p)}>
                      {p.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
