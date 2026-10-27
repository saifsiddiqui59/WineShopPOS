import "./login-brand-orbit.css";

// Original, locally-hosted package illustrations; these are not official brand logos.
const PRODUCTS = [
  { id: "kingfisher", label: "Kingfisher", family: "beer", angle: 0, ring: "outer", speed: 76 },
  { id: "sula", label: "Sula", family: "wine", angle: 42, ring: "inner", speed: 68 },
  { id: "bira-91", label: "Bira 91", family: "beer", angle: 77, ring: "outer", speed: 76 },
  { id: "fratelli", label: "Fratelli", family: "wine", angle: 116, ring: "inner", speed: 68 },
  { id: "heineken", label: "Heineken", family: "beer", angle: 153, ring: "outer", speed: 76 },
  { id: "budweiser", label: "Budweiser", family: "beer", angle: 190, ring: "inner", speed: 68 },
  { id: "jacobs-creek", label: "Jacob's Creek", family: "wine", angle: 223, ring: "outer", speed: 76 },
  { id: "tuborg", label: "Tuborg", family: "beer", angle: 260, ring: "inner", speed: 68 },
  { id: "carlsberg", label: "Carlsberg", family: "beer", angle: 295, ring: "outer", speed: 76 },
  { id: "corona", label: "Corona", family: "beer", angle: 335, ring: "inner", speed: 68 },
];

export default function LoginBrandOrbit() {
  return (
    <div className="wsp-login-backdrop" aria-hidden="true">
      <div className="wsp-login-light wsp-login-light--amber" />
      <div className="wsp-login-light wsp-login-light--wine" />
      <div className="wsp-login-orbit-ring wsp-login-orbit-ring--inner" />
      <div className="wsp-login-orbit-ring wsp-login-orbit-ring--outer" />

      <div className="wsp-login-orbit-field">
        {PRODUCTS.map((brand, index) => (
          <div
            className={`wsp-login-orbiter ${index >= 6 ? "wsp-login-orbiter--secondary" : ""}`}
            key={brand.id}
            style={{
              "--start-angle": `${brand.angle}deg`,
              "--orbit-distance": brand.ring === "outer"
                ? "clamp(335px, 44vw, 740px)"
                : "clamp(265px, 34vw, 585px)",
              "--orbit-speed": `${brand.speed}s`,
              "--float-delay": `${index * -0.55}s`,
            }}
          >
            <div className="wsp-login-orbit-offset">
              <div className="wsp-login-upright">
                <div className="wsp-login-floater">
                  <div className={`wsp-login-product wsp-login-product--${brand.family}`}>
                    <img
                      src={`/login-brands/${brand.id}.svg`}
                      alt=""
                      width="120"
                      height="260"
                      decoding="async"
                      draggable="false"
                    />
                    <span className="wsp-login-product-label">{brand.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="wsp-login-center-shade" />
    </div>
  );
}
