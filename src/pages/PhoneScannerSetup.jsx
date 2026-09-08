import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../context/AuthContext";
import { clearPhonePairing, loadPhonePairing, makePhonePairing, pairingUrl, savePhonePairing } from "../components/GlobalPhoneScannerHost";

export default function PhoneScannerSetup() {
  const { profile } = useAuth();
  const [pairing, setPairing] = useState(loadPhonePairing);

  useEffect(() => {
    const sync = () => setPairing(loadPhonePairing());
    window.addEventListener("wsp-phone-pairing-changed", sync);
    return () => window.removeEventListener("wsp-phone-pairing-changed", sync);
  }, []);

  const url = useMemo(() => (pairing ? pairingUrl(pairing) : ""), [pairing]);

  function connect() {
    if (!profile?.shop_id) return;
    const next = makePhonePairing(profile.shop_id);
    savePhonePairing(next);
    setPairing(next);
  }
  function disconnect() {
    clearPhonePairing();
    setPairing(null);
  }

  return (
    <section className="panel global-phone-setup">
      <div className="section-heading">
        <div>
          <h2>Phone Barcode Scanner</h2>
          <p>Connect once. This phone works like a wireless barcode machine across WineShopPOS until you disconnect it.</p>
        </div>
      </div>
      {!pairing ? (
        <div className="scanner-instruction-card">
          <strong>Not connected</strong>
          <span>No 10-minute timeout. Pair once and keep using the same phone.</span>
          <button type="button" className="primary-button" disabled={!profile?.shop_id} onClick={connect}>Connect Phone</button>
        </div>
      ) : (
        <div className="global-phone-grid">
          <div className="phone-pc-qr"><QRCodeSVG value={url} size={220} marginSize={2} level="M" /></div>
          <div className="global-phone-copy">
            <strong>Phone pairing saved</strong>
            <p>Scan this QR once. The PC keeps the pairing until Disconnect Phone.</p>
            <p>Scans are injected into the same global scanner event used by barcode-machine-aware pages.</p>
            <div className="button-row">
              <button type="button" className="secondary-button" onClick={connect}>Replace / Reconnect Phone</button>
              <button type="button" className="danger-button" onClick={disconnect}>Disconnect Phone</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
