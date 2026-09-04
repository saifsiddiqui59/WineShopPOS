import { useEffect, useState } from "react";
import { Wine } from "lucide-react";

export default function ProductThumb({ product, size = "md" }) {
  const [broken, setBroken] = useState(false);
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
          onError={() => setBroken(true)}
        />
      ) : (
        <Wine size={size === "sm" ? 15 : 18} />
      )}
    </span>
  );
}
