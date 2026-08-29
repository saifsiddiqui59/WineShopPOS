import { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Reports() {
  const { sales, purchases, products, getStock, lowStockProducts } = useShop();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const today = now.toISOString().slice(0,10);

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);

  const filteredSales = sales.filter((s) => {
    const d = s.createdAt?.slice(0,10);
    return d >= from && d <= to;
  });

  const filteredPurchases = purchases.filter((p) => {
    const d = p.invoiceDate;
    return d >= from && d <= to;
  });

  const salesTotal = filteredSales.reduce((sum,s) => sum + s.grandTotal,0);
  const purchaseTotal = filteredPurchases.reduce((sum,p) => sum + p.total,0);
  const inventoryCost = products.reduce((sum,p) => sum + getStock(p.id)*p.purchasePrice,0);
  const potentialSales = products.reduce((sum,p) => sum + getStock(p.id)*p.price,0);

  const paymentTotals = useMemo(() => {
    const result = { CASH:0, UPI:0, CARD:0 };
    filteredSales.forEach((s) => {
      if (result[s.paymentMethod] !== undefined) result[s.paymentMethod] += s.grandTotal;
    });
    return result;
  }, [filteredSales]);

  return (
    <div>
      <div className="page-heading"><div><h2>Reports</h2><p>Supabase live reporting</p></div></div>

      <div className="panel form-grid">
        <label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
      </div>

      <div className="stats-grid" style={{ marginTop:14 }}>
        <div className="stat-card"><span>Sales</span><strong>{money.format(salesTotal)}</strong></div>
        <div className="stat-card"><span>Purchases</span><strong>{money.format(purchaseTotal)}</strong></div>
        <div className="stat-card"><span>Inventory Cost</span><strong>{money.format(inventoryCost)}</strong></div>
        <div className="stat-card"><span>Potential Sales</span><strong>{money.format(potentialSales)}</strong></div>
        <div className="stat-card"><span>Low Stock</span><strong>{lowStockProducts.length}</strong></div>
      </div>

      <div className="settings-grid" style={{ marginTop:14 }}>
        <section className="panel">
          <h3>Payment Methods</h3>
          <p>Cash: <strong>{money.format(paymentTotals.CASH)}</strong></p>
          <p>UPI: <strong>{money.format(paymentTotals.UPI)}</strong></p>
          <p>Card: <strong>{money.format(paymentTotals.CARD)}</strong></p>
        </section>

        <section className="panel">
          <h3>Period</h3>
          <p>Bills: <strong>{filteredSales.length}</strong></p>
          <p>Purchases: <strong>{filteredPurchases.length}</strong></p>
        </section>
      </div>
    </div>
  );
}
