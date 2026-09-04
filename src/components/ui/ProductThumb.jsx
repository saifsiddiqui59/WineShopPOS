import { useEffect, useState } from "react";
import { Wine } from "lucide-react";

export default function ProductThumb({ product, size = "md" }) {
  const [broken, setBroken] = useState(false);

  // Release-safe behavior:
  // product.imageUrl is generated from the shop's Supabase Storage image_path.
  // Do not fall back to arbitrary third-party demo image hosts. Those hosts are
  // outside WineShopPOS control and can disappear, fail DNS, rate-limit, or
  // change content. Products without a managed image use the local icon.
  const src = product?.imageUrl || "";

  useEffect(() => setBroken(false), [src]);

  return (
    <span className={`product-thumb product-thumb-${size}`} aria-hidden="true">
      {src && !broken ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      ) : (
        <Wine size={size === "sm" ? 15 : 18} />
      )}
    </span>
  );
}
