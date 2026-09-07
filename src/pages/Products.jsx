import SortableTable from "../components/ui/SortableTable";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import ProductThumb from "../components/ui/ProductThumb";
import { autoFindProductImage } from "../lib/productEnrichmentClient";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Products() {
  const {
    products,
    getStock,
    deactivateProduct,
    activateProduct,
    loadingData,
    refreshAll,
  } = useShop();
  const { profile } = useAuth();

  const [search, setSearch] = useState("");
  const [barcodeFilter, setBarcodeFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState("success");
  const [imageBusyId, setImageBusyId] = useState("");

  const visibleProducts = useMemo(
    () => products.filter(
      (p) => !(p.active === false && /^890000001\d{4}$/.test(String(p.barcode || ""))),
    ),
    [products],
  );

  const missingBarcodeCount = useMemo(() => visibleProducts.filter((product)=>product.active!==false&&!product.barcode).length,[visibleProducts]);

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
    setMessageKind(result?.ok ? "success" : "error");
    setMessage(result.message);
  }

  async function findImage(product) {
    if (!profile?.shop_id || !product?.id) {
      setMessageKind("error");
      setMessage("Active shop/product is unavailable.");
      return;
    }

    const barcodeBefore = String(product.barcode || "");
    setImageBusyId(product.id);
    setMessage("");

    try {
      const result = await autoFindProductImage({
        shopId: profile.shop_id,
        productId: product.id,
        replace: false,
      });

      if (
        result?.barcodeUnchanged !== true ||
        String(result?.barcodeBefore || "") !== barcodeBefore ||
        String(result?.barcodeAfter || "") !== barcodeBefore
      ) {
        throw new Error("Barcode safety verification failed. Refresh before continuing.");
      }

      await refreshAll();

      setMessageKind("success");
      setMessage(
        `${product.name}: image added automatically` +
        `${result.sourceType === "SHOP_IMAGE" ? " from the shop catalogue" : " from internet search"}. ` +
        `Barcode ${barcodeBefore || "(none)"} was not changed.` +
        `${result.reviewRecommended ? " Review the image in Edit Product if needed." : ""}`,
      );
    } catch (error) {
      setMessageKind("error");
      setMessage(
        `${product.name}: ${error?.message || String(error)} ` +
        `Barcode ${barcodeBefore || "(none)"} was not changed.`,
      );
    } finally {
      setImageBusyId("");
    }
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

      {message ? <div className={`purchase-message ${messageKind}`}>{message}</div> : null}

      <div className="panel">
        <div className="button-row" style={{ marginBottom: 12 }}>
          {[
            ["ALL", "All"],
            ["WITH", "With Barcode"],
            ["WITHOUT", `Barcode Setup (${missingBarcodeCount})`],
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
          <SortableTable
            className="data-table products-master-table"
            resizeKey="products-master-v5"
            defaultColumnWidths={[310, 170, 150, 90, 120, 105, 120, 105, 220]}
          >
            <thead>
              <tr>
                <th>Product</th><th>Barcode</th><th>Category</th><th>Stock</th>
                <th>Purchase</th><th>MRP</th><th>Selling</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const findingImage = imageBusyId === p.id;

                return (
                  <tr key={p.id}>
                    <td className="products-product-column">
                      <div className="product-cell-with-image">
                        {p.imageUrl ? (
                          <Link
                            to={`/products/${p.id}/edit`}
                            className="product-image-existing-link"
                            title="Open Edit Product to replace or upload a different image"
                            aria-label={`Edit image for ${p.name}`}
                          >
                            <ProductThumb product={p}/>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className={`product-image-auto-button${findingImage ? " is-finding" : ""}`}
                            onClick={() => void findImage(p)}
                            disabled={findingImage}
                            title="Find image automatically by product name, brand and size. Barcode will not change."
                            aria-label={`Find image online for ${p.name}. Barcode will not change.`}
                          >
                            <ProductThumb product={p}/>
                            <span className="product-image-auto-indicator" aria-hidden="true">
                              {findingImage ? "…" : "+"}
                            </span>
                          </button>
                        )}

                        <span className="products-product-copy">
                          <strong className="products-product-name">{p.name}</strong><br/>
                          <small className="products-product-meta">{p.brand} · {p.size}</small>
                        </span>
                      </div>
                    </td>
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
                );
              })}
            </tbody>
          </SortableTable>
        )}
      </div>
    </div>
  );
}
