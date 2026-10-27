import "./login-brand-orbit.css";

// Reuse existing, self-hosted illustrative wine/beer bottle and can art.
// Decorative packages include identifying names, not manufacturer-owned logos.
const BRANDS = [
  { id: "kingfisher", label: "Kingfisher", family: "beer" },
  { id: "sula", label: "Sula", family: "wine" },
  { id: "bira-91", label: "Bira 91", family: "beer" },
  { id: "fratelli", label: "Fratelli", family: "wine" },
  { id: "heineken", label: "Heineken", family: "beer" },
  { id: "budweiser", label: "Budweiser", family: "beer" },
  { id: "jacobs-creek", label: "Jacob's Creek", family: "wine" },
  { id: "tuborg", label: "Tuborg", family: "beer" },
  { id: "carlsberg", label: "Carlsberg", family: "beer" },
  { id: "corona", label: "Corona", family: "beer" },
];

// Deterministic radial paths: echo from center in overlapping waves, then fade.
// Negative delays make waves visible immediately; no timers, randomness, or network API.
const ECHO_ITEMS = Array.from({ length: 30 }, (_, i) => {
  const angle = ((i * 137.508 + 26) * Math.PI) / 180;
  const radius = 31 + ((i * 17) % 19);
  return {
    ...BRANDS[i % BRANDS.length],
    key: i,
    dx: `${(Math.cos(angle) * radius).toFixed(2)}vw`,
    dy: `${(Math.sin(angle) * radius * 1.06).toFixed(2)}vh`,
    delay: `${(i * -0.34).toFixed(2)}s`,
    tilt: `${((i % 5) - 2) * 5}deg`,
  };
});

export default function LoginBrandOrbit() {
  return (
    <div className="wsp-login-backdrop" aria-hidden="true">
      <div className="wsp-login-light wsp-login-light--amber" />
      <div className="wsp-login-light wsp-login-light--wine" />
      <div className="wsp-login-echo-halo wsp-login-echo-halo--one" />
      <div className="wsp-login-echo-halo wsp-login-echo-halo--two" />
      <div className="wsp-login-echo-halo wsp-login-echo-halo--three" />

      <div className="wsp-login-echo-field">
        {ECHO_ITEMS.map((item, index) => (
          <div
            className={`wsp-login-echo ${index >= 20 ? "wsp-login-echo--secondary" : ""}`}
            key={item.key}
            style={{
              "--echo-x": item.dx,
              "--echo-y": item.dy,
              "--echo-delay": item.delay,
              "--echo-tilt": item.tilt,
            }}
          >
            <div className={`wsp-login-product wsp-login-product--${item.family}`}>
              <img
                src={`/login-brands/${item.id}.svg`}
                alt=""
                width="92"
                height="200"
                decoding="async"
                draggable="false"
              />
              <span className="wsp-login-product-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="wsp-login-center-shade" />
    </div>
  );
}
