import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Inventory() {
  const { products, getStock } = useShop();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products.filter((product) => {
      if (!value) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.barcode.includes(value)
      );
    });
  }, [products, search]);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Inventory</h2>
          <p>Current local stock levels</p>
        </div>

        <div className="page-actions">
          <button className="secondary-button">+ Receive Stock</button>
          <button className="primary-button">+ New Product</button>
        </div>
      </div>

      <div className="panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inventory..."
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Current Stock</th>
                <th>Minimum</th>
                <th>Status</th>
                <th>Inventory Value</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const stock = getStock(product.id);
                const low = stock <= product.minimumStock;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <strong>{product.name}</strong>
                        <span>{product.size}</span>
                      </div>
                    </td>

                    <td>{product.category}</td>
                    <td className="mono">{product.barcode}</td>
                    <td>
                      <strong>{stock}</strong>
                    </td>
                    <td>{product.minimumStock}</td>
                    <td>
                      <span
                        className={
                          low
                            ? "stock-status low"
                            : "stock-status good"
                        }
                      >
                        {low ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </td>
                    <td>
                      {money.format(stock * product.purchasePrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
