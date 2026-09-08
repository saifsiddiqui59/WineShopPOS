import { useEffect, useMemo, useRef, useState } from "react";
import MobileBarcodeScanner from "../components/MobileBarcodeScanner";
import { supabase } from "../lib/supabase";
import { normalizeBarcode } from "../lib/barcode";

function validPairingPart(value, minLength, maxLength) {
  const text = String(value || "");
  return (
    text.length >= minLength &&
    text.length <= maxLength &&
    /^[A-Za-z0-9-]+$/.test(text)
  );
}

export default function PhoneScannerRemote() {
  const params = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );

  const sessionId = params.get("session") || "";
  const token = params.get("token") || "";
  const shopId = params.get("shop") || "";
  const expiresAt = Number(params.get("expires") || 0);

  const valid =
    validPairingPart(sessionId, 16, 80) &&
    validPairingPart(token, 40, 80) &&
    validPairingPart(shopId, 20, 80) &&
    Number.isFinite(expiresAt) &&
    expiresAt > Date.now();

  const topic = valid
    ? `pos-phone:${shopId}:${sessionId}:${token}`
    : "";

  const [channelStatus, setChannelStatus] = useState(
    valid ? "CONNECTING" : "INVALID",
  );
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [lastBarcode, setLastBarcode] = useState("");
  const [lastAck, setLastAck] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(
    valid ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 0,
  );

  const channelRef = useRef(null);
  const restartTimerRef = useRef(null);

  useEffect(() => {
    if (!valid) return undefined;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((expiresAt - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setChannelStatus("EXPIRED");
        setScannerOpen(false);
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [valid, expiresAt]);

  useEffect(() => {
    if (!valid || !topic) return undefined;

    const channel = supabase
      .channel(topic, {
        config: {
          broadcast: {
            ack: false,
            self: false,
          },
        },
      })
      .on("broadcast", { event: "pc-ready" }, ({ payload }) => {
        if (payload?.sessionId === sessionId && Date.now() < expiresAt) {
          setChannelStatus("CONNECTED");
        }
      })
      .on("broadcast", { event: "barcode-ack" }, ({ payload }) => {
        if (
          payload?.sessionId === sessionId &&
          payload?.barcode
        ) {
          setLastAck(String(payload.barcode));
          setChannelStatus("CONNECTED");
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setChannelStatus("WAITING_FOR_PC");
          void channel.send({
            type: "broadcast",
            event: "phone-ready",
            payload: {
              sessionId,
              at: new Date().toISOString(),
            },
          });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setChannelStatus("CONNECTION_ERROR");
        } else if (status === "CLOSED") {
          setChannelStatus("DISCONNECTED");
        }
      });

    channelRef.current = channel;

    const heartbeat = window.setInterval(() => {
      if (Date.now() >= expiresAt) return;
      void channel.send({
        type: "broadcast",
        event: "phone-heartbeat",
        payload: {
          sessionId,
          at: new Date().toISOString(),
        },
      });
    }, 4000);

    return () => {
      window.clearInterval(heartbeat);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [valid, topic, sessionId, expiresAt]);

  useEffect(
    () => () => {
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
    },
    [],
  );

  async function sendBarcode(rawBarcode) {
    const barcode = normalizeBarcode(rawBarcode);
    if (
      !barcode ||
      !channelRef.current ||
      Date.now() >= expiresAt
    ) {
      setScannerOpen(false);
      return;
    }

    const eventId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setLastBarcode(barcode);
    setLastAck("");

    await channelRef.current.send({
      type: "broadcast",
      event: "barcode",
      payload: {
        sessionId,
        eventId,
        barcode,
        sentAt: new Date().toISOString(),
      },
    });

    // MobileBarcodeScanner stops its camera after a successful decode.
    // Re-open a fresh scanner instance so the phone behaves like a barcode gun.
    setScannerOpen(false);
    restartTimerRef.current = window.setTimeout(() => {
      if (Date.now() < expiresAt) {
        setScannerKey((value) => value + 1);
        setScannerOpen(true);
      }
    }, 450);
  }

  if (!valid) {
    return (
      <main className="phone-scanner-page">
        <section className="panel phone-scanner-card">
          <h1>Phone Barcode Scanner</h1>
          <div className="product-not-found">
            <strong>PAIRING LINK INVALID OR EXPIRED</strong>
            <span>Return to the PC POS and create a new phone pairing.</span>
          </div>
        </section>
      </main>
    );
  }

  const canScan =
    secondsLeft > 0 &&
    channelStatus === "CONNECTED";

  return (
    <main className="phone-scanner-page">
      <section className="panel phone-scanner-card">
        <div className="phone-scanner-heading">
          <div>
            <span className="eyebrow">WineShopPOS</span>
            <h1>Phone → PC Barcode Scanner</h1>
            <p>
              This phone only scans and sends barcode numbers. The sale, price,
              stock and payment remain on the paired PC.
            </p>
          </div>
          <span
            className={`phone-pc-status ${
              channelStatus === "CONNECTED" ? "connected" : ""
            }`}
          >
            {channelStatus.replaceAll("_", " ")}
          </span>
        </div>

        <div className="metric-grid two">
          <div className="metric-card">
            <span>Pairing expires</span>
            <strong>
              {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </strong>
          </div>
          <div className="metric-card">
            <span>Last sent</span>
            <strong>{lastBarcode || "—"}</strong>
          </div>
        </div>

        {lastBarcode ? (
          <div className="purchase-message">
            Sent <strong>{lastBarcode}</strong>
            {lastAck === lastBarcode
              ? " · PC received it."
              : " · Waiting for PC acknowledgement…"}
          </div>
        ) : null}

        <div className="button-row" style={{ marginTop: 14 }}>
          <button
            type="button"
            className="primary-button"
            disabled={!canScan}
            onClick={() => {
              setScannerKey((value) => value + 1);
              setScannerOpen(true);
            }}
          >
            Start Scanning
          </button>
        </div>

        <p className="muted-text">
          {channelStatus === "CONNECTED"
            ? "After each successful scan the camera automatically starts again for the next product. Tap Cancel inside the scanner to pause."
            : "Waiting for the paired PC. Start Scanning becomes available after the PC acknowledges this phone."}
        </p>

        <MobileBarcodeScanner
          key={scannerKey}
          open={scannerOpen}
          title="Scan Barcode for Paired PC"
          onClose={() => setScannerOpen(false)}
          onDetected={(code) => void sendBarcode(code)}
        />
      </section>
    </main>
  );
}
