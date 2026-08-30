import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function ShopSelector() {
  const { profile, refreshAccess } = useAuth();
  const [shops, setShops] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.rpc("my_shop_memberships").then(({ data }) => { if (alive) setShops(data || []); });
    return () => { alive = false; };
  }, [profile?.shop_id]);

  async function change(shopId) {
    if (!shopId || shopId === profile?.shop_id) return;
    setBusy(true);
    const { error } = await supabase.rpc("switch_shop", { p_shop_id: shopId });
    if (!error) {
      await refreshAccess();
      window.location.assign("#/owner");
      window.location.reload();
    }
    setBusy(false);
  }

  if (profile?.role === "CASHIER" || shops.length <= 1) return <div className="shop-context-pill"><Store size={15}/><span>{profile?.shop_name || "Shop"}</span></div>;
  return <label className="shop-selector"><Store size={15}/><span className="sr-only">Current shop</span><select value={profile?.shop_id || ""} disabled={busy} onChange={(e) => change(e.target.value)}>{shops.map((shop) => <option key={shop.shop_id} value={shop.shop_id}>{shop.shop_name}</option>)}</select></label>;
}
