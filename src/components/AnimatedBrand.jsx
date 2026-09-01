import { Wine } from "lucide-react";

export default function AnimatedBrand({ collapsed = false }) {
  return (
    <div className={`brand brand-animated${collapsed ? " is-collapsed" : ""}`}>
      <div className="brand-cheers-mark" aria-hidden="true">
        <Wine className="brand-glass brand-glass-left" size={23} />
        <Wine className="brand-glass brand-glass-right" size={23} />
        <span className="brand-splash-dot brand-splash-dot-one" />
        <span className="brand-splash-dot brand-splash-dot-two" />
        <span className="brand-splash-dot brand-splash-dot-three" />
      </div>
      {!collapsed ? <div className="brand-copy"><div className="brand-name">WineShop POS</div><div className="brand-subtitle">Retail Management</div></div> : null}
    </div>
  );
}
