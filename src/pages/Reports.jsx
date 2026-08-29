import { useMemo, useState } from "react";
import { BarChart3, Search } from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function toDateValue(date) {
  return date.toISOString().slice(0, 10);
}

export default function Reports() {
  const { products, inventory, sales, purchases, getStock } = useShop();

  const today = new Date();

  const [fromDate, setFromDate] = useState(
    toDateValue(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    )
  );

  const [toDate, setToDate] = useState(toDateValue(today));
  const [productSearch, setProductSearch] = useState("");

  const filteredSales = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return sales.filter((sale) => {
      const date = new Date(sale.createdAt);
      return (!from || date >= from) && (!to || date <= to);
    });
  }, [sales, fromDate, toDate]);

  const filteredPurchases = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return purchases.filter((purchase) => {
      const date = new Date(
        purchase.createdAt ||
          `${purchase.invoiceDate}T00:00:00`
      );

      return (!from || date >= from) && (!to || date <= to);
    });
  }, [purchases, fromDate, toDate]);

  const salesRevenue = filteredSales.reduce(
    (total, sale) => total + Number(sale.grandTotal ?? 0),
    0
  );

  const discountTotal = filteredSales.reduce(
    (total, sale) => total + Number(sale.discount ?? 0),
    0
  );

  const purchaseTotal = filteredPurchases.reduce(
    (total, purchase) => total + Number(purchase.total ?? 0),
    0
  );

  const productReport = {};

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const key = item.productId || item.productName;

      if (!productReport[key]) {
        productReport[key] = {
          productName: item.productName,
          quantity: 0,
          revenue: 0,
          estimatedCost: 0,
        };
      }

      const quantity = Number(item.quantity ?? 0);
      const lineTotal = Number(item.lineTotal ?? 0);
      const product = products.find(
        (candidate) => candidate.id === item.productId
      );

      const purchasePrice =
        Number(item.purchasePrice ?? product?.purchasePrice ?? 0);

      productReport[key].quantity += quantity;
      productReport[key].revenue += lineTotal;
      productReport[key].estimatedCost += purchasePrice * quantity;
    });
  });

  const productRows = Object.values(productReport)
    .filter((row) =>
      row.productName
        .toLowerCase()
        .includes(productSearch.trim().toLowerCase())
    )
    .sort((a, b) => b.revenue - a.revenue);

  const categoryReport = {};

  productRows.forEach((row) => {
    const product = products.find(
      (item) => item.name === row.productName
    );

    const category = product?.category || "Unknown";

    if (!categoryReport[category]) {
      categoryReport[category] = {
        category,
        quantity: 0,
        revenue: 0,
      };
    }

    categoryReport[category].quantity += row.quantity;
    categoryReport[category].revenue += row.revenue;
  });

  const paymentReport = filteredSales.reduce(
    (result, sale) => {
      const method = sale.paymentMethod || "OTHER";

      if (!result[method]) {
        result[method] = {
          method,
          bills: 0,
          value: 0,
        };
      }

      result[method].bills += 1;
      result[method].value += Number(sale.grandTotal ?? 0);

      return result;
    },
    {}
  );

  const inventoryPurchaseValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * Number(product.purchasePrice ?? 0),
    0
  );

  const potentialSalesValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * Number(product.price ?? 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.active !== false &&
      getStock(product.id) <= Number(product.minimumStock ?? 0)
  );

  const estimatedGrossMargin = productRows.reduce(
    (total, row) => total + (row.revenue - row.estimatedCost),
    0
  ) - discountTotal;

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Reports</h2>
          <p>Local MVP sales, purchase and inventory reporting</p>
        </div>
      </div>

      <section className="panel report-filter-panel">
        <div className="report-filter-grid">
          <label>
            From
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <div className="report-period-note">
            <BarChart3 size={18} />
            Reporting period applies to sales and purchases.
          </div>
        </div>
      </section>

      <div className="report-kpi-grid">
        <div className="report-kpi">
          <span>Sales</span>
          <strong>{money.format(salesRevenue)}</strong>
          <small>{filteredSales.length} bills</small>
        </div>

        <div className="report-kpi">
          <span>Purchases</span>
          <strong>{money.format(purchaseTotal)}</strong>
          <small>{filteredPurchases.length} receipts</small>
        </div>

        <div className="report-kpi">
          <span>Estimated Gross Margin</span>
          <strong>{money.format(estimatedGrossMargin)}</strong>
          <small>Development estimate</small>
        </div>

        <div className="report-kpi">
          <span>Inventory Purchase Value</span>
          <strong>{money.format(inventoryPurchaseValue)}</strong>
          <small>Current stock</small>
        </div>

        <div className="report-kpi">
          <span>Potential Sales Value</span>
          <strong>{money.format(potentialSalesValue)}</strong>
          <small>Current stock at selling price</small>
        </div>

        <div className="report-kpi">
          <span>Low Stock SKUs</span>
          <strong>{lowStockProducts.length}</strong>
          <small>At or below minimum</small>
        </div>
      </div>

      <section className="panel report-section">
        <div className="panel-header">
          <div>
            <h3>Product-wise Sales</h3>
            <p>Units, revenue and estimated margin</p>
          </div>
        </div>

        <div className="table-search report-search">
          <Search size={18} />
          <input
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            placeholder="Filter product report..."
          />
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units</th>
                <th>Revenue</th>
                <th>Estimated Cost</th>
                <th>Estimated Margin</th>
              </tr>
            </thead>

            <tbody>
              {productRows.length === 0 ? (
                <tr>
                  <td colSpan="5">No sales in selected period.</td>
                </tr>
              ) : (
                productRows.map((row) => (
                  <tr key={row.productName}>
                    <td>
                      <strong>{row.productName}</strong>
                    </td>
                    <td>{row.quantity}</td>
                    <td>{money.format(row.revenue)}</td>
                    <td>{money.format(row.estimatedCost)}</td>
                    <td>
                      {money.format(row.revenue - row.estimatedCost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="report-two-column">
        <section className="panel report-section">
          <div className="panel-header">
            <div>
              <h3>Category-wise Sales</h3>
              <p>Contribution by category</p>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Units</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(categoryReport)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((row) => (
                    <tr key={row.category}>
                      <td>{row.category}</td>
                      <td>{row.quantity}</td>
                      <td>{money.format(row.revenue)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel report-section">
          <div className="panel-header">
            <div>
              <h3>Payment Method</h3>
              <p>Cash / UPI / Card breakdown</p>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Bills</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(paymentReport).map((row) => (
                  <tr key={row.method}>
                    <td>{row.method}</td>
                    <td>{row.bills}</td>
                    <td>{money.format(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel report-section">
        <div className="panel-header">
          <div>
            <h3>Current Inventory / Low Stock</h3>
            <p>Current bottle quantities and valuation</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Minimum</th>
                <th>Status</th>
                <th>Purchase Value</th>
                <th>Potential Sales Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = inventory[product.id] ?? 0;
                const low = stock <= Number(product.minimumStock ?? 0);

                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>{product.category}</td>
                    <td>{stock}</td>
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
                      {money.format(
                        stock * Number(product.purchasePrice ?? 0)
                      )}
                    </td>
                    <td>
                      {money.format(stock * Number(product.price ?? 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel report-section">
        <div className="panel-header">
          <div>
            <h3>Purchase Report</h3>
            <p>Supplier receipts in selected period</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Purchase</th>
                <th>Supplier</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Bottles</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No purchases in selected period.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{purchase.purchaseNumber}</td>
                    <td>{purchase.supplierName}</td>
                    <td>{purchase.invoiceNumber}</td>
                    <td>{purchase.invoiceDate}</td>
                    <td>
                      {purchase.totalUnits ??
                        purchase.items.reduce(
                          (total, item) =>
                            total + Number(item.quantity ?? 0),
                          0
                        )}
                    </td>
                    <td>{money.format(purchase.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="demo-note">
        Profit/margin is an MVP estimate using stored purchase-price data. It
        is not yet an accounting or tax report.
      </div>
    </div>
  );
}
