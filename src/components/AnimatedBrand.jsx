import { useState } from "react";

function CheersMark() {
  return (
    <svg
      className="brand-cheers-svg"
      viewBox="0 0 76 54"
      role="img"
      aria-label="Two wine glasses toasting"
    >
      <defs>
        <linearGradient id="wsGold" x1="0" x2="1">
          <stop offset="0%" stopColor="#a97619" />
          <stop offset="38%" stopColor="#f5dc8a" />
          <stop offset="68%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8d6518" />
        </linearGradient>
        <linearGradient id="wsWine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a51f45" />
          <stop offset="100%" stopColor="#5d0f2a" />
        </linearGradient>
      </defs>

      <g className="brand-glass-svg brand-glass-svg-left">
        <path
          d="M9 6h23c-.2 11.2-3.8 19.1-11.5 20.8C12.9 25.1 9.3 17.2 9 6Z"
          fill="none"
          stroke="url(#wsGold)"
          strokeWidth="2"
        />
        <path
          d="M11.8 15.2h17.4c-1.2 6.2-4 9.6-8.7 10.5-4.7-.9-7.5-4.3-8.7-10.5Z"
          fill="url(#wsWine)"
          opacity=".92"
        />
        <path d="M20.5 27v15" stroke="url(#wsGold)" strokeWidth="2" />
        <path d="M13.7 43h13.6" stroke="url(#wsGold)" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g className="brand-glass-svg brand-glass-svg-right">
        <path
          d="M44 6h23c-.3 11.2-3.9 19.1-11.5 20.8C47.8 25.1 44.2 17.2 44 6Z"
          fill="none"
          stroke="url(#wsGold)"
          strokeWidth="2"
        />
        <path
          d="M46.8 15.2h17.4c-1.2 6.2-4 9.6-8.7 10.5-4.7-.9-7.5-4.3-8.7-10.5Z"
          fill="url(#wsWine)"
          opacity=".92"
        />
        <path d="M55.5 27v15" stroke="url(#wsGold)" strokeWidth="2" />
        <path d="M48.7 43h13.6" stroke="url(#wsGold)" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g className="brand-clink-spark" aria-hidden="true">
        <circle cx="38" cy="8" r="2.1" fill="#ffeab0" />
        <path d="M38 1.5v3M38 11.5v3M31.5 8h3M41.5 8h3" stroke="#f4c95d" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      <g className="brand-wine-droplets" aria-hidden="true">
        <circle cx="35" cy="3.5" r="1.25" fill="#a51f45" />
        <circle cx="41" cy="2" r=".95" fill="#c63b5e" />
        <circle cx="44.5" cy="5" r=".8" fill="#8e244d" />
      </g>
    </svg>
  );
}

export default function AnimatedBrand({ collapsed = false }) {
  const [playToken, setPlayToken] = useState(0);

  function replay() {
    setPlayToken((value) => value + 1);
  }

  return (
    <button
      type="button"
      className={`brand brand-animated${collapsed ? " is-collapsed" : ""}`}
      onMouseEnter={replay}
      onFocus={replay}
      onClick={replay}
      aria-label="WineShop POS. Replay brand animation."
      title="WineShop POS"
    >
      <span className="brand-motion-sequence" key={playToken}>
        <span className="brand-cheers-mark">
          <CheersMark />
        </span>

        {!collapsed ? (
          <span className="brand-copy">
            <span className="brand-wine-reveal" aria-hidden="true" />
            <span className="brand-name">WineShop POS</span>
            <span className="brand-subtitle">Retail Management</span>
          </span>
        ) : null}
      </span>
    </button>
  );
}
