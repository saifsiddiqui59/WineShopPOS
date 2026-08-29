import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Products() {
  const { products, getStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.category.toLowerCase().includes(value) ||
        product.barcode.includes(value) ||
        product.sku.toLowerCase().includes(value)
    );
  }, [products, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Product Master</h2>
          <p>{products.length} development products loaded</p>
        </div>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, barcode, SKU or category"
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Selling Price</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table-product">
                      <strong>{product.name}</strong>
                      <span>{product.brand}</span>
                    </div>
                  </td>

                  <td className="mono">{product.barcode}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span className="category-badge">
                      {product.category}
                    </span>
                  </td>
                  <td>{getStock(product.id)}</td>
                  <td>{money.format(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="demo-note">
        Barcodes and prices are dummy development values and are not official
        product data.
      </div>
    </div>
  );
}
