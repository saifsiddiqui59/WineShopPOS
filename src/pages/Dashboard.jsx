import {
  Banknote,
  CreditCard,
  IndianRupee,
  PackageCheck,
  ReceiptText,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const { products, sales, getStock } = useShop();

  const today = new Date().toDateString();

  const todaysSales = sales.filter(
    (sale) => new Date(sale.createdAt).toDateString() === today
  );

  const revenue = todaysSales.reduce(
    (total, sale) => total + Number(sale.grandTotal ?? 0),
    0
  );

  const averageBill = todaysSales.length
    ? revenue / todaysSales.length
    : 0;

  const lowStockProducts = products.filter(
    (product) =>
      product.active !== false &&
      getStock(product.id) <= Number(product.minimumStock ?? 0)
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + getStock(product.id) * Number(product.purchasePrice ?? 0),
    0
  );

  const paymentSummary = todaysSales.reduce(
    (result, sale) => {
      const method = sale.paymentMethod || "OTHER";
      result[method] = (result[method] || 0) + Number(sale.grandTotal ?? 0);
      return result;
    },
    {}
  );

  const productSales = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productName: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }

      productSales[item.productId].quantity += Number(item.quantity ?? 0);
      productSales[item.productId].revenue += Number(item.lineTotal ?? 0);
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 7);

  const cards = [
    {
      label: "Today's Sales",
      value: money.format(revenue),
      icon: IndianRupee,
      note: "Revenue today",
    },
    {
      label: "Bills Today",
      value: todaysSales.length,
      icon: ReceiptText,
      note: `Avg ${money.format(averageBill)}`,
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: TriangleAlert,
      note: "Needs attention",
    },
    {
      label: "Inventory Value",
      value: money.format(inventoryValue),
      icon: PackageCheck,
      note: "At purchase cost",
    },
  ];

  const payments = [
    {
      label: "Cash",
      value: paymentSummary.CASH || 0,
      icon: Banknote,
    },
    {
      label: "UPI",
      value: paymentSummary.UPI || 0,
      icon: Smartphone,
    },
    {
      label: "Card",
      value: paymentSummary.CARD || 0,
      icon: CreditCard,
    },
  ];

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Store overview and today's performance</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="stat-card" key={card.label}>
              <div className="stat-icon">
                <Icon size={21} />
              </div>

              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-note">{card.note}</div>
            </div>
          );
        })}
      </div>

      <div className="payment-kpi-grid">
        {payments.map((payment) => {
          const Icon = payment.icon;

          return (
            <div className="payment-kpi" key={payment.label}>
              <Icon size={19} />
              <div>
                <span>{payment.label} Today</span>
                <strong>{money.format(payment.value)}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Sales</h3>
              <p>Latest completed bills</p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">
              No sales yet. Open POS and complete your first bill.
            </div>
          ) : (
            <div className="simple-list">
              {sales.slice(0, 7).map((sale) => (
                <div className="simple-list-row" key={sale.id}>
                  <div>
                    <strong>{sale.invoiceNumber}</strong>
                    <span>
                      {new Date(sale.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="align-right">
                    <strong>{money.format(sale.grandTotal)}</strong>
                    <span>{sale.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Low Stock Products</h3>
              <p>Products at or below minimum level</p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="empty-state">No low-stock products.</div>
          ) : (
            <div className="simple-list">
              {lowStockProducts.slice(0, 8).map((product) => (
                <div className="simple-list-row" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>

                  <div className="stock-low">
                    {getStock(product.id)} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="panel dashboard-top-products">
        <div className="panel-header">
          <div>
            <h3>Top Selling Products</h3>
            <p>Based on all local sales</p>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <div className="empty-state">No product sales yet.</div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.productName}>
                    <td>
                      <strong>{product.productName}</strong>
                    </td>
                    <td>{product.quantity}</td>
                    <td>{money.format(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="demo-note">
        Development mode: product prices and barcodes are dummy test data.
      </div>
    </div>
  );
}
