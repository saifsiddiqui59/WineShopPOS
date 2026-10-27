import { useEffect, useRef } from "react";
import { mountBottleVortex } from "./bottle-vortex-webgl";
import "./login-brand-orbit.css";

// Only decorative WebGL: the existing sign-in and password-reset forms are untouched.
export default function LoginBrandOrbit() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    return mountBottleVortex(canvasRef.current);
  }, []);

  return (
    <div className="wsp-login-backdrop" aria-hidden="true">
      <div className="wsp-login-light wsp-login-light--amber" />
      <div className="wsp-login-light wsp-login-light--wine" />
      <div className="wsp-login-vortex-halo" />
      <canvas
        ref={canvasRef}
        className="wsp-login-webgl"
        data-renderer="wsp-bottle-vortex"
        aria-hidden="true"
      />
      <div className="wsp-login-center-shade" />
    </div>
  );
}
