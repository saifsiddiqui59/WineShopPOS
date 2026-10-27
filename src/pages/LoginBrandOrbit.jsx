import "./login-brand-orbit.css";

// Reuse the original, locally hosted bottle/can illustrations, never remote logos.
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

function scatter(seed) {
  let n = (Math.imul(seed + 1, 1664525) + 1013904223) >>> 0;
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  return (n >>> 0) / 4294967295;
}

// An Echo wave isn't a set of stationary cards. Each copy follows a visibly
// CURVED, CLOCKWISE, EXPANDING path at varied sizes; repeated waves overlap.
// Coordinates are viewport-relative, so the swirl works on phones and desktops.
// Precomputed constants + GPU CSS transforms: no timers, RAF, or React rerenders.
function swirlPoint(angleDeg, distance) {
  const a = (angleDeg * Math.PI) / 180;
  return {
    x: (Math.cos(a) * distance).toFixed(2) + "vw",
    y: (Math.sin(a) * distance * 1.18).toFixed(2) + "vh",
  };
}

const ECHO_ITEMS = Array.from({ length: 78 }, (_, index) => {
  const wave = Math.floor(index / 26);
  const i = index % 26;
  const angle = (index * 137.508 + scatter(index * 5) * 24) % 360;
  const reach = 17 + scatter(index * 7 + 1) * 43;
  const p0 = swirlPoint(angle - 140, reach * 0.18);
  const p1 = swirlPoint(angle - 65, reach * 0.55);
  const p2 = swirlPoint(angle + 16, reach * 0.94);
  const p3 = swirlPoint(angle + 110, reach * 1.25);
  const size = 0.33 + scatter(index * 7 + 3) * 0.92;
  return {
    ...BRANDS[(index * 7 + wave) % BRANDS.length],
    key: index,
    p0, p1, p2, p3,
    scale: size.toFixed(2),
    smallScale: (size * 0.42).toFixed(2),
    bigScale: (size * 1.13).toFixed(2),
    // Each wave arrives in a tight cluster, then spirals outward before fading.
    delay: (-wave * 1.75 - i * 0.044 - 0.7).toFixed(2) + "s",
    tilt: Math.round((scatter(index * 7 + 6) - 0.5) * 18) + "deg",
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
            className={"wsp-login-echo " + (index >= 48 ? "wsp-login-echo--secondary" : "")}
            key={item.key}
            style={{
              "--echo-p0x": item.p0.x,
              "--echo-p0y": item.p0.y,
              "--echo-p1x": item.p1.x,
              "--echo-p1y": item.p1.y,
              "--echo-p2x": item.p2.x,
              "--echo-p2y": item.p2.y,
              "--echo-p3x": item.p3.x,
              "--echo-p3y": item.p3.y,
              "--echo-size": item.scale,
              "--echo-small-size": item.smallScale,
              "--echo-big-size": item.bigScale,
              "--echo-delay": item.delay,
              "--echo-tilt": item.tilt,
            }}
          >
            <div className={"wsp-login-product wsp-login-product--" + item.family}>
              <img
                src={"/login-brands/" + item.id + ".svg"}
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
