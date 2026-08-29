import { useMemo } from "react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const { products, sales, getStock, lowStockProducts, loadingData, dataError } = useShop();
  const { profile } = useAuth();

  const today = new Date().toISOString().slice(0,10);
  const todaySales = sales.filter((s) => s.createdAt?.slice(0,10) === today);
  const todayTotal = todaySales.reduce((sum,s) => sum + s.grandTotal,0);
  const inventoryValue = products.reduce((sum,p) => sum + getStock(p.id) * p.purchasePrice,0);

  const top = useMemo(() => {
    const map = {};
    sales.forEach((sale) => sale.items.forEach((item) => {
      map[item.productName] = (map[item.productName] || 0) + item.quantity;
    }));
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,5);
  }, [sales]);

  if (loadingData) return <div className="panel">Loading Supabase data...</div>;

  return (
    <div>
      <div className="page-heading">
        <div><h2>Dashboard</h2><p>{profile?.shop_name} · live cloud data</p></div>
      </div>

      {dataError && <div className="purchase-message error">{dataError}</div>}

      <div className="stats-grid">
        <div className="stat-card"><span>Today's Sales</span><strong>{money.format(todayTotal)}</strong></div>
        <div className="stat-card"><span>Bills Today</span><strong>{todaySales.length}</strong></div>
        <div className="stat-card"><span>Low Stock</span><strong>{lowStockProducts.length}</strong></div>
        <div className="stat-card"><span>Inventory Value</span><strong>{money.format(inventoryValue)}</strong></div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h3>Recent Sales</h3>
          {sales.slice(0,8).map((s) => (
            <div key={s.id} className="list-row">
              <span>{s.invoiceNumber}</span><strong>{money.format(s.grandTotal)}</strong>
            </div>
          ))}
        </section>

        <section className="panel">
          <h3>Low Stock</h3>
          {lowStockProducts.slice(0,8).map((p) => (
            <div key={p.id} className="list-row">
              <span>{p.name}</span><strong>{getStock(p.id)}</strong>
            </div>
          ))}
        </section>

        <section className="panel">
          <h3>Top Selling Products</h3>
          {top.map(([name,qty]) => (
            <div key={name} className="list-row"><span>{name}</span><strong>{qty}</strong></div>
          ))}
        </section>
      </div>
    </div>
  );
}
