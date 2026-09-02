import SortableTable from "../components/ui/SortableTable";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import ProductThumb from "../components/ui/ProductThumb";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Products() {
  const { products, getStock, deactivateProduct, activateProduct, loadingData } = useShop();
  const [search, setSearch] = useState("");
  const [barcodeFilter, setBarcodeFilter] = useState("ALL");
  const [message, setMessage] = useState("");

  const visibleProducts = useMemo(
    () => products.filter(
      (p) => !(p.active === false && /^890000001\d{4}$/.test(String(p.barcode || ""))),
    ),
    [products],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleProducts.filter((p) => {
      const barcodeMatch =
        barcodeFilter === "ALL" ||
        (barcodeFilter === "WITH" && Boolean(p.barcode)) ||
        (barcodeFilter === "WITHOUT" && !p.barcode);

      if (!barcodeMatch) return false;
      if (!q) return true;

      return [p.name, p.brand, p.sku, p.barcode, p.category]
        .some((value) => String(value ?? "").toLowerCase().includes(q));
    });
  }, [visibleProducts, search, barcodeFilter]);

  async function toggle(product) {
    const result = product.active
      ? await deactivateProduct(product.id)
      : await activateProduct(product.id);
    setMessage(result.message);
  }

  return (
    <div>
      <div className="page-heading">
        <div><h2>Products</h2><p>{visibleProducts.length} real catalogue products in Supabase</p></div>
        <div className="button-row">
          <Link to="/products/bulk-import" className="secondary-button">Bulk Product Import</Link>
          <Link to="/products/new" className="primary-button">Add Product</Link>
        </div>
      </div>

      {message && <div className="purchase-message success">{message}</div>}

      <div className="panel">
        <div className="button-row" style={{ marginBottom: 12 }}>
          {[
            ["ALL", "All"],
            ["WITH", "With Barcode"],
            ["WITHOUT", "Without Barcode"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={barcodeFilter === value ? "primary-button" : "secondary-button"}
              onClick={() => setBarcodeFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          data-scanner-capture="barcode"
          placeholder="Search name, barcode, SKU, brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 420 }}
        />
      </div>

      <div className="panel data-table-wrapper" style={{ marginTop: 14 }}>
        {loadingData ? <p>Loading...</p> : (
          <SortableTable className="data-table products-master-table">
            <thead>
              <tr>
                <th>Product</th><th>Barcode</th><th>Category</th><th>Stock</th>
                <th>Purchase</th><th>MRP</th><th>Selling</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="products-product-column"><div className="product-cell-with-image"><ProductThumb product={p}/><span className="products-product-copy"><strong className="products-product-name">{p.name}</strong><br/><small className="products-product-meta">{p.brand} · {p.size}</small></span></div></td>
                  <td>{p.barcode || <strong>Missing barcode</strong>}</td>
                  <td>{p.category}</td>
                  <td>{getStock(p.id)}</td>
                  <td>{money.format(p.purchasePrice)}</td>
                  <td>{money.format(p.mrp)}</td>
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
          </SortableTable>
        )}
      </div>
    </div>
  );
}
