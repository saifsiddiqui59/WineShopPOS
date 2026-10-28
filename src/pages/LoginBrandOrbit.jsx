import { useEffect, useRef } from "react";
import "./login-brand-orbit.css";

// Isolated decorative renderer: the heavy Three.js chunk is fetched only for login.
// Authentication and recovery routes preserve their existing behavior.
export default function LoginBrandOrbit() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let active = true;
    let teardown;
    import("./bottle-vortex-lite")
      .then(({ mountLightweightCyclone }) => mountLightweightCyclone(canvas))
      .then((dispose) => { if (active) teardown = dispose; else dispose?.(); })
      .catch(() => {
        // Asset missing, blocked WebP or legacy browser: retain the existing
        // licensed Three.js implementation as a non-auth decorative fallback.
        if (!active) return;
        import("./bottle-vortex-three").then(({ mountBottleVortex }) => {
          if (active) teardown = mountBottleVortex(canvas);
        }).catch((error) => {
          canvas.dataset.rendererStatus = "fallback";
          console.warn("Optional cinematic backdrop unavailable:", error.message);
        });
      });
    return () => {
      active = false;
      teardown?.();
    };
  }, []);
  return (
    <div className="wsp-login-backdrop" aria-hidden="true">
      <div className="wsp-login-light wsp-login-light--amber" />
      <div className="wsp-login-light wsp-login-light--wine" />
      <div className="wsp-login-vortex-halo" />
      <canvas ref={canvasRef} className="wsp-login-webgl"
        data-renderer="wsp-bottle-vortex" aria-hidden="true" />
      <div className="wsp-login-center-shade" />
    </div>
  );
}
