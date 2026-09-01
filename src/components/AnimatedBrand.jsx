import { useState } from "react";

function PremiumBrandArt() {
  return (
    <svg className="ws-premium-logo-svg" viewBox="0 0 190 110" aria-hidden="true">
      <defs>
        <linearGradient id="goldBrandV6" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#74460a"/>
          <stop offset="20%" stopColor="#d29a2c"/>
          <stop offset="42%" stopColor="#fff0aa"/>
          <stop offset="60%" stopColor="#d4af37"/>
          <stop offset="82%" stopColor="#f4d77b"/>
          <stop offset="100%" stopColor="#74460a"/>
        </linearGradient>
        <linearGradient id="wineBrandV6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cf315b"/>
          <stop offset="42%" stopColor="#8f153e"/>
          <stop offset="100%" stopColor="#410715"/>
        </linearGradient>
        <radialGradient id="sparkBrandV6">
          <stop offset="0%" stopColor="#fffbe4"/>
          <stop offset="35%" stopColor="#ffe16e"/>
          <stop offset="100%" stopColor="#d48c12" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <g className="ws-brand-dots">
        <circle cx="50" cy="32" r="1.2" fill="#f4cb60"/>
        <circle cx="138" cy="31" r="1.1" fill="#ffe79a"/>
        <circle cx="94" cy="14" r="1.8" fill="#f7d96f"/>
        <circle cx="29" cy="54" r=".9" fill="#d6a031"/>
        <circle cx="160" cy="52" r=".9" fill="#e9b943"/>
      </g>

      <g className="ws-brand-glass ws-brand-glass-left">
        <path d="M43 18H78C77 42 70 57 60.5 60C51 57 44 42 43 18Z"
          fill="rgba(255,255,255,.018)" stroke="url(#goldBrandV6)" strokeWidth="2.3"/>
        <path d="M47 38C49 49 54 55 60.5 57C67 55 72 49 74 38C67 41 54 41 47 38Z"
          fill="url(#wineBrandV6)"/>
        <path d="M60.5 60V84" stroke="url(#goldBrandV6)" strokeWidth="2.2"/>
        <path d="M48 87H73" stroke="url(#goldBrandV6)" strokeWidth="2.3" strokeLinecap="round"/>
      </g>

      <g className="ws-brand-glass ws-brand-glass-right">
        <path d="M111 18H146C145 42 138 57 128.5 60C119 57 112 42 111 18Z"
          fill="rgba(255,255,255,.018)" stroke="url(#goldBrandV6)" strokeWidth="2.3"/>
        <path d="M115 38C117 49 122 55 128.5 57C135 55 140 49 142 38C135 41 122 41 115 38Z"
          fill="url(#wineBrandV6)"/>
        <path d="M128.5 60V84" stroke="url(#goldBrandV6)" strokeWidth="2.2"/>
        <path d="M116 87H141" stroke="url(#goldBrandV6)" strokeWidth="2.3" strokeLinecap="round"/>
      </g>

      <g className="ws-brand-clink">
        <circle cx="95" cy="18" r="13" fill="url(#sparkBrandV6)"/>
        <path d="M95 1V9M95 27V35M78 18H86M104 18H112M83 6L89 12M101 24L107 30M107 6L101 12M89 24L83 30"
          stroke="#ffe98d" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      <g className="ws-brand-splash">
        <path d="M14 82C35 66 51 67 72 78C85 85 104 85 118 77C137 65 156 69 176 82C156 77 143 91 121 97C99 103 78 102 56 96C36 91 27 76 14 82Z"
          fill="url(#wineBrandV6)" opacity=".96"/>
        <path d="M28 79C19 62 23 50 36 40" fill="none" stroke="#8c1438" strokeWidth="4.3" strokeLinecap="round"/>
        <path d="M160 79C170 62 168 49 154 39" fill="none" stroke="#8c1438" strokeWidth="4.3" strokeLinecap="round"/>
        <circle cx="22" cy="52" r="2.2" fill="#bd3153"/>
        <circle cx="15" cy="63" r="1.3" fill="#df526f"/>
        <circle cx="166" cy="50" r="2.1" fill="#a91e45"/>
        <circle cx="177" cy="62" r="1.3" fill="#df526f"/>
      </g>
    </svg>
  );
}

export default function AnimatedBrand({ collapsed = false }) {
  const [token, setToken] = useState(0);
  const replay = () => setToken((value) => value + 1);

  return (
    <button
      type="button"
      className={`brand brand-animated brand-premium-v6${collapsed ? " is-collapsed" : ""}`}
      onMouseEnter={replay}
      onFocus={replay}
      onClick={replay}
      title="WineShop POS"
      aria-label="WineShop POS. Replay brand animation."
    >
      <span className="ws-brand-sequence" key={token}>
        <span className="ws-brand-art"><PremiumBrandArt/></span>
        {!collapsed ? (
          <span className="ws-brand-copy">
            <span className="ws-brand-wine-wipe" aria-hidden="true"/>
            <span className="ws-brand-wordmark">WineShop POS</span>
            <span className="ws-brand-ornament"><i/><b>◆</b><i/></span>
            <span className="brand-subtitle">Retail Management</span>
          </span>
        ) : null}
      </span>
    </button>
  );
}
