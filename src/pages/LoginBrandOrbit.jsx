import "./login-brand-orbit.css";

// Existing original brand-labelled bottle illustrations, served locally.
const BRANDS = [
  { id: "kingfisher", family: "beer" },
  { id: "sula", family: "wine" },
  { id: "bira-91", family: "beer" },
  { id: "fratelli", family: "wine" },
  { id: "heineken", family: "beer" },
  { id: "budweiser", family: "beer" },
  { id: "jacobs-creek", family: "wine" },
  { id: "tuborg", family: "beer" },
  { id: "carlsberg", family: "beer" },
  { id: "corona", family: "beer" },
];

function scatter(seed) {
  let n = (Math.imul(seed + 1, 1664525) + 1013904223) >>> 0;
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  return (n >>> 0) / 4294967295;
}

function point(angle, radiusX, radiusY, z) {
  const a = angle * Math.PI / 180;
  return {
    x: (Math.cos(a) * radiusX).toFixed(2) + "vw",
    y: (Math.sin(a) * radiusY).toFixed(2) + "vh",
    z: Math.round(z) + "px",
  };
}

// Real 3D perspective with dense overlapping Echo streams, rather than
// scattered 2D decals. 184 independent bottles, sampled at 3 depth bands.
// Negative delays keep a rich composition on the very first rendered frame.
const ECHO_ITEMS = Array.from({ length: 184 }, (_, index) => {
  const wave = Math.floor(index / 23);
  const band = index % 4;
  const angle = (index * 137.508 + scatter(index * 7) * 20) % 360;
  const variety = scatter(index * 11 + 3);
  const radius = 23 + variety * 17;
  const z = band === 0 ? -440 : band === 1 ? -180 : band === 2 ? 25 : 200;
  const scale = band === 0 ? .63 : band === 1 ? .83 : band === 2 ? 1.05 : 1.20;
  return {
    ...BRANDS[(index * 7 + wave) % BRANDS.length],
    key: index,
    band,
    p0: point(angle - 145, 6 + variety * 9, 8 + variety * 8, z - 200),
    p1: point(angle - 80, 13 + variety * 13, 16 + variety * 10, z - 100),
    p2: point(angle - 12, radius, 23 + variety * 20, z),
    p3: point(angle + 86, radius * 1.22, 29 + variety * 24, z + 80),
    scale: scale.toFixed(2),
    farScale: (scale * .37).toFixed(2),
    nearScale: (scale * 1.13).toFixed(2),
    turn: Math.round((scatter(index * 7 + 4) - .5) * 74) + "deg",
    pitch: Math.round((scatter(index * 7 + 5) - .5) * 38) + "deg",
    roll: Math.round((scatter(index * 7 + 6) - .5) * 25) + "deg",
    delay: (-index * .062 - wave * .38).toFixed(2) + "s",
    tint: band < 2 ? "far" : "near",
  };
});

const GLINTS = Array.from({ length: 32 }, (_, i) => ({
  key: i,
  left: (scatter(i * 19 + 3) * 98).toFixed(1) + "%",
  top: (scatter(i * 19 + 9) * 98).toFixed(1) + "%",
  delay: (-i * .27).toFixed(2) + "s",
}));

export default function LoginBrandOrbit() {
  return (
    <div className="wsp-login-backdrop" aria-hidden="true">
      <div className="wsp-login-light wsp-login-light--amber" />
      <div className="wsp-login-light wsp-login-light--wine" />
      <div className="wsp-login-vortex wsp-login-vortex--gold" />
      <div className="wsp-login-vortex wsp-login-vortex--ruby" />
      <div className="wsp-login-echo-field">
        {ECHO_ITEMS.map((item, index) => (
          <div
            className={"wsp-login-echo wsp-login-echo--" + item.tint +
              (index >= 104 ? " wsp-login-echo--secondary" : "")}
            data-depth={item.band}
            key={item.key}
            style={{
              "--echo-p0x": item.p0.x,
              "--echo-p0y": item.p0.y,
              "--echo-p0z": item.p0.z,
              "--echo-p1x": item.p1.x,
              "--echo-p1y": item.p1.y,
              "--echo-p1z": item.p1.z,
              "--echo-p2x": item.p2.x,
              "--echo-p2y": item.p2.y,
              "--echo-p2z": item.p2.z,
              "--echo-p3x": item.p3.x,
              "--echo-p3y": item.p3.y,
              "--echo-p3z": item.p3.z,
              "--echo-size": item.scale,
              "--echo-far-size": item.farScale,
              "--echo-near-size": item.nearScale,
              "--echo-delay": item.delay,
              "--echo-turn": item.turn,
              "--echo-pitch": item.pitch,
              "--echo-roll": item.roll,
            }}
          >
            <div className={"wsp-login-product wsp-login-product--" + item.family}>
              <img
                src={"/login-brands/" + item.id + ".svg"}
                alt=""
                loading="eager"
                width="92"
                height="201"
                decoding="async"
                draggable="false"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="wsp-login-sparkle-field">
        {GLINTS.map(glint => (
          <i key={glint.key} className="wsp-login-sparkle" style={{
            left: glint.left, top: glint.top, "--glint-delay": glint.delay,
          }} />
        ))}
      </div>
      <div className="wsp-login-center-shade" />
    </div>
  );
}
