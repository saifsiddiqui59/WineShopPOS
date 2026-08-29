import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

export default function Settings() {
  const { profile, access } = useAuth();
  const { products, sales, purchases, createBackup, refreshAll } = useShop();

  function exportSnapshot() {
    const backup = createBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wineshoppos-cloud-snapshot-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-heading"><div><h2>Settings</h2><p>Cloud shop configuration</p></div></div>

      <div className="settings-grid">
        <section className="panel">
          <h3>Shop</h3>
          <p>Name: <strong>{profile?.shop_name}</strong></p>
          <p>Slug: <strong>{profile?.shop_slug}</strong></p>
          <p>Role: <strong>{profile?.role}</strong></p>
          <p>Subscription: <strong>{access?.subscription_status}</strong></p>
          <p>Products: <strong>{products.length}</strong></p>
          <p>Sales loaded: <strong>{sales.length}</strong></p>
          <p>Purchases loaded: <strong>{purchases.length}</strong></p>
        </section>

        <section className="panel">
          <h3>Cloud Data</h3>
          <p>Supabase is now the source of truth. LocalStorage is no longer used for business transactions.</p>
          <button className="primary-button" onClick={refreshAll}>Refresh Cloud Data</button>{" "}
          <button className="secondary-button" onClick={exportSnapshot}>Export JSON Snapshot</button>
        </section>
      </div>
    </div>
  );
}
