import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function RoyalHero({ shopName, interactive = false, children }) {
  return (
    <div
      className={`royal-v11-lockup${interactive ? " royal-v11-lockup-interactive" : ""}`}
      title={shopName}
      aria-label={shopName}
    >
      <span className="royal-v11-crown-stage" aria-hidden="true">
        <span className="royal-v11-crown-rotor">
          <img
            className="royal-v11-crown-face royal-v11-crown-front"
            src="/brand/royal21-crown-user-v11.png"
            alt=""
            draggable="false"
          />
          <img
            className="royal-v11-crown-face royal-v11-crown-back"
            src="/brand/royal21-crown-user-v11.png"
            alt=""
            draggable="false"
          />
        </span>
      </span>

      <span className="royal-v11-name">{shopName}</span>

      <span className="royal-v11-ornament" aria-hidden="true">
        <i /><b>◇</b><em>◇</em><i />
      </span>

      {children}
    </div>
  );
}

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

  if (premium) {
    if (profile?.role === "CASHIER" || shops.length <= 1) {
      return <RoyalHero shopName={shopName} />;
    }

    return (
      <RoyalHero shopName={shopName} interactive>
        <label className="royal-v11-select-layer">
          <span className="sr-only">Current shop</span>
          <select
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
      </RoyalHero>
    );
  }

  if (profile?.role === "CASHIER" || shops.length <= 1) {
    return (
      <div className="shop-context-pill" title={shopName}>
        <Store size={15} />
        <span>{shopName}</span>
      </div>
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
