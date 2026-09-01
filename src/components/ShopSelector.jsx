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
    supabase.rpc("my_shop_memberships").then(({ data }) => {
      if (alive) setShops(data || []);
    });
    return () => {
      alive = false;
    };
  }, [profile?.shop_id]);

  async function change(shopId) {
    if (!shopId || shopId === profile?.shop_id) return;
    setBusy(true);
    const { error } = await supabase.rpc("switch_shop", {
      p_shop_id: shopId,
    });

    if (!error) {
      await refreshAccess();
      window.location.assign("#/owner");
      window.location.reload();
    }

    setBusy(false);
  }

  const shopName = profile?.shop_name || "Shop";
  const premium = /royal\s*.*21/i.test(shopName);

  if (profile?.role === "CASHIER" || shops.length <= 1) {
    return (
      <div
        className={`shop-context-pill${premium ? " shop-premium-gold" : ""}`}
        title={shopName}
      >
        <Store size={premium ? 17 : 15} />
        <span className={premium ? "shop-premium-display" : ""}>{shopName}</span>
      </div>
    );
  }

  if (premium) {
    return (
      <label className="shop-selector shop-premium-gold shop-premium-interactive">
        <Store size={17} />
        <span className="shop-premium-display">{shopName}</span>
        <span className="sr-only">Current shop</span>
        <select
          className="shop-premium-native-select"
          value={profile?.shop_id || ""}
          disabled={busy}
          onChange={(event) => change(event.target.value)}
          aria-label={`Current shop: ${shopName}`}
        >
          {shops.map((shop) => (
            <option key={shop.shop_id} value={shop.shop_id}>
              {shop.shop_name}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="shop-selector">
      <Store size={15} />
      <span className="sr-only">Current shop</span>
      <select
        value={profile?.shop_id || ""}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
      >
        {shops.map((shop) => (
          <option key={shop.shop_id} value={shop.shop_id}>
            {shop.shop_name}
          </option>
        ))}
      </select>
    </label>
  );
}
