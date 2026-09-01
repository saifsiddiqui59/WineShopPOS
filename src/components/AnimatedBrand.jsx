import { useState } from "react";

export default function AnimatedBrand({ collapsed = false }) {
  const [playToken, setPlayToken] = useState(0);

  function replay() {
    setPlayToken((value) => value + 1);
  }

  return (
    <button
      type="button"
      className={`brand exact-reference-brand${collapsed ? " is-collapsed" : ""}`}
      onMouseEnter={replay}
      onFocus={replay}
      onClick={replay}
      aria-label="WineShop POS. Replay exact reference animation."
      title="WineShop POS"
    >
      <span className="exact-reference-brand-sequence" key={playToken}>
        <span className="exact-reference-brand-sprite" aria-hidden="true" />
        <img
          className="exact-reference-brand-final"
          src="/brand/wineshoppos-final-lockup.png"
          alt=""
          draggable="false"
        />
      </span>
    </button>
  );
}
