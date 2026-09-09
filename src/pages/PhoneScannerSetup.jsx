import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../context/AuthContext";
import {
  clearPhonePairing,
  loadPhonePairing,
  makePhonePairing,
  pairingUrl,
  savePhonePairing,
} from "../components/GlobalPhoneScannerHost";

export default function PhoneScannerSetup() {
  const { profile } = useAuth();
  const [pairing, setPairing] = useState(loadPhonePairing);

  useEffect(() => {
    const sync = () => setPairing(loadPhonePairing());
    window.addEventListener("wsp-phone-pairing-changed", sync);
    return () => window.removeEventListener("wsp-phone-pairing-changed", sync);
  }, []);

  const url = useMemo(
    () => (pairing ? pairingUrl(pairing) : ""),
    [pairing],
  );

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
    <section className="panel global-phone-setup phone-scanner-simple">
      <h2>Phone Scanner</h2>

      {!pairing ? (
        <div className="scanner-instruction-card">
          <span>Pair a phone once and use it as the shop barcode scanner.</span>
          <button
            type="button"
            className="primary-button"
            disabled={!profile?.shop_id}
            onClick={connect}
          >
            Connect Phone
          </button>
        </div>
      ) : (
        <div className="global-phone-grid">
          <div className="phone-pc-qr">
            <QRCodeSVG value={url} size={220} marginSize={2} level="M" />
          </div>
          <div className="global-phone-copy">
            <strong>Scan this QR on the phone once.</strong>
            <span>The pairing stays saved until you disconnect or replace it.</span>
            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={connect}
              >
                Replace Phone
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={disconnect}
              >
                Disconnect Phone
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
