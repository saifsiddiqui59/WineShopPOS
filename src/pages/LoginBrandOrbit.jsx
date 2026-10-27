import "./login-brand-orbit.css";

// Same ten locally hosted original illustrations; the Echo effect duplicates
// each bottle/can at varied positions and sizes like iMessage's bubble swarm.
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

// Deterministic spread across the whole screen: not an orbit or radial ring.
// Three closely timed overlapping waves produce a dense, varied-size Echo.
// All values are constant at render; CSS handles the entire animation.
function scatter(seed) {
  let n = (Math.imul(seed + 1, 1664525) + 1013904223) >>> 0;
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  return (n >>> 0) / 4294967295;
}

const ECHO_ITEMS = Array.from({ length: 78 }, (_, index) => {
  const wave = Math.floor(index / 26);
  const size = 0.33 + scatter(index * 7 + 3) * 0.88;
  return {
    ...BRANDS[(index * 7 + wave) % BRANDS.length],
    key: index,
    x: `${(3 + scatter(index * 7 + 1) * 94).toFixed(2)}%`,
    y: `${(3 + scatter(index * 7 + 2) * 94).toFixed(2)}%`,
    scale: size.toFixed(2),
    scaleEnd: (size * 1.17).toFixed(2),
    driftX: `${Math.round((scatter(index * 7 + 4) - 0.5) * 42)}px`,
    driftY: `${Math.round((scatter(index * 7 + 5) - 0.5) * 40)}px`,
    delay: `${(-wave * 1.6 - (index % 26) * 0.035).toFixed(2)}s`,
    tilt: `${Math.round((scatter(index * 7 + 6) - 0.5) * 19)}deg`,
  };
});

export default function LoginBrandOrbit() {
  return (
    <div className="wsp-login-backdrop" aria-hidden="true">
      <div className="wsp-login-light wsp-login-light--amber" />
      <div className="wsp-login-light wsp-login-light--wine" />
      <div className="wsp-login-echo-field">
        {ECHO_ITEMS.map((item, index) => (
          <div
            className={`wsp-login-echo ${index >= 48 ? "wsp-login-echo--secondary" : ""}`}
            key={item.key}
            style={{
              "--echo-x": item.x,
              "--echo-y": item.y,
              "--echo-size": item.scale,
              "--echo-size-end": item.scaleEnd,
              "--echo-drift-x": item.driftX,
              "--echo-drift-y": item.driftY,
              "--echo-delay": item.delay,
              "--echo-tilt": item.tilt,
            }}
          >
            <div className={`wsp-login-product wsp-login-product--${item.family}`}>
              <img
                src={`/login-brands/${item.id}.svg`}
                alt=""
                width="80"
                height="156"
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
