import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabase";
import { normalizeBarcode } from "../lib/barcode";

const PAIRING_TTL_MS = 10 * 60 * 1000;
const HEARTBEAT_STALE_MS = 12000;

function randomToken(byteLength = 24) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function createSession(shopId) {
  const sessionId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : randomToken(16);

  const token = randomToken(24);
  const expiresAt = Date.now() + PAIRING_TTL_MS;

  return {
    shopId,
    sessionId,
    token,
    expiresAt,
    topic: `pos-phone:${shopId}:${sessionId}:${token}`,
  };
}

function pairingUrl(pairing) {
  const url = new URL("/phone-scanner", window.location.origin);
  url.searchParams.set("session", pairing.sessionId);
  url.searchParams.set("token", pairing.token);
  url.searchParams.set("shop", pairing.shopId);
  url.searchParams.set("expires", String(pairing.expiresAt));
  return url.toString();
}

export default function PhoneToPcScannerPanel({ shopId, onBarcode }) {
  const [pairing, setPairing] = useState(null);
  const [channelStatus, setChannelStatus] = useState("DISCONNECTED");
  const [phoneSeenAt, setPhoneSeenAt] = useState(0);
  const [lastScan, setLastScan] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");

  const channelRef = useRef(null);
  const onBarcodeRef = useRef(onBarcode);
  const receivedIdsRef = useRef(new Set());

  useEffect(() => {
    onBarcodeRef.current = onBarcode;
  }, [onBarcode]);

  const url = useMemo(
    () => (pairing ? pairingUrl(pairing) : ""),
    [pairing],
  );

  const connected =
    Boolean(pairing) &&
    phoneSeenAt > 0 &&
    Date.now() - phoneSeenAt < HEARTBEAT_STALE_MS &&
    secondsLeft > 0;

  useEffect(() => {
    if (!pairing) {
      setSecondsLeft(0);
      return undefined;
    }

    const update = () => {
      const next = Math.max(
        0,
        Math.ceil((pairing.expiresAt - Date.now()) / 1000),
      );
      setSecondsLeft(next);

      if (next <= 0) {
        setChannelStatus("EXPIRED");
      }
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [pairing]);

  useEffect(() => {
    if (!pairing) return undefined;

    receivedIdsRef.current = new Set();
    setPhoneSeenAt(0);
    setLastScan(null);
    setChannelStatus("CONNECTING");

    const channel = supabase
      .channel(pairing.topic, {
        config: {
          broadcast: {
            ack: false,
            self: false,
          },
        },
      })
      .on("broadcast", { event: "phone-ready" }, ({ payload }) => {
        if (
          payload?.sessionId !== pairing.sessionId ||
          Date.now() >= pairing.expiresAt
        ) {
          return;
        }

        setPhoneSeenAt(Date.now());
        setChannelStatus("CONNECTED");

        void channel.send({
          type: "broadcast",
          event: "pc-ready",
          payload: {
            sessionId: pairing.sessionId,
            expiresAt: pairing.expiresAt,
          },
        });
      })
      .on("broadcast", { event: "phone-heartbeat" }, ({ payload }) => {
        if (
          payload?.sessionId === pairing.sessionId &&
          Date.now() < pairing.expiresAt
        ) {
          setPhoneSeenAt(Date.now());
          setChannelStatus("CONNECTED");
        }
      })
      .on("broadcast", { event: "barcode" }, ({ payload }) => {
        if (
          payload?.sessionId !== pairing.sessionId ||
          Date.now() >= pairing.expiresAt
        ) {
          return;
        }

        const eventId = String(payload?.eventId || "");
        if (!eventId || receivedIdsRef.current.has(eventId)) return;

        receivedIdsRef.current.add(eventId);
        if (receivedIdsRef.current.size > 100) {
          receivedIdsRef.current = new Set(
            Array.from(receivedIdsRef.current).slice(-50),
          );
        }

        const barcode = normalizeBarcode(payload?.barcode);
        if (!barcode) return;

        setPhoneSeenAt(Date.now());
        setChannelStatus("CONNECTED");
        setLastScan({
          barcode,
          at: new Date().toISOString(),
        });

        onBarcodeRef.current?.(barcode, {
          source: "PHONE_TO_PC",
          sessionId: pairing.sessionId,
        });

        void channel.send({
          type: "broadcast",
          event: "barcode-ack",
          payload: {
            sessionId: pairing.sessionId,
            eventId,
            barcode,
            receivedAt: new Date().toISOString(),
          },
        });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setChannelStatus("WAITING_FOR_PHONE");
          void channel.send({
            type: "broadcast",
            event: "pc-ready",
            payload: {
              sessionId: pairing.sessionId,
              expiresAt: pairing.expiresAt,
            },
          });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setChannelStatus("CONNECTION_ERROR");
        } else if (status === "CLOSED") {
          setChannelStatus("DISCONNECTED");
        }
      });

    channelRef.current = channel;

    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [pairing]);

  function startPairing() {
    if (!shopId) {
      setChannelStatus("SHOP_REQUIRED");
      return;
    }

    setCopyMessage("");
    setPairing(createSession(shopId));
  }

  function disconnect() {
    setPairing(null);
    setPhoneSeenAt(0);
    setLastScan(null);
    setChannelStatus("DISCONNECTED");
    setCopyMessage("");
  }

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Pairing link copied.");
    } catch {
      setCopyMessage("Could not copy automatically. Use the QR code instead.");
    }
  }

  return (
    <details className="panel pos-v5h-customer-tools pos-phone-pc-tools">
      <summary>
        <span>
          <strong>Phone as Barcode Scanner</strong>
          <small>Use a separate phone as a wireless barcode gun for this PC bill</small>
        </span>
        <span className="pos-v5h-summary-action">Open</span>
      </summary>

      <div className="pos-v5h-customer-body">
        {!pairing ? (
          <>
            <p className="muted-text">
              Connect a phone to this POS for 10 minutes. The phone sends only scanned
              barcode numbers; billing and stock actions remain on this PC.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={startPairing}
            >
              Connect Phone Scanner
            </button>
          </>
        ) : (
          <div className="phone-pc-pairing">
            <div className="phone-pc-qr">
              <QRCodeSVG
                value={url}
                size={190}
                marginSize={2}
                level="M"
                title="Phone scanner pairing QR code"
              />
            </div>

            <div className="phone-pc-pairing-info">
              <div className={`phone-pc-status ${connected ? "connected" : ""}`}>
                <strong>
                  {connected
                    ? "PHONE CONNECTED"
                    : channelStatus === "EXPIRED"
                      ? "PAIRING EXPIRED"
                      : channelStatus === "CONNECTION_ERROR"
                        ? "REALTIME CONNECTION ERROR"
                        : "WAITING FOR PHONE"}
                </strong>
                <span>
                  {secondsLeft > 0
                    ? `Pairing expires in ${Math.floor(secondsLeft / 60)}:${String(
                        secondsLeft % 60,
                      ).padStart(2, "0")}`
                    : "Create a new pairing to continue."}
                </span>
              </div>

              <ol className="phone-pc-steps">
                <li>Open the camera app on your phone.</li>
                <li>Scan this QR code and open the WineShopPOS scanner page.</li>
                <li>Tap Start Scanning on the phone.</li>
                <li>Each scanned barcode is added to this PC POS automatically.</li>
              </ol>

              {lastScan ? (
                <div className="phone-pc-last-scan">
                  <span>Last barcode received</span>
                  <strong>{lastScan.barcode}</strong>
                </div>
              ) : null}

              <div className="button-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={copyLink}
                >
                  Copy Pairing Link
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={startPairing}
                >
                  New Pairing
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={disconnect}
                >
                  Disconnect
                </button>
              </div>

              {copyMessage ? <p className="muted-text">{copyMessage}</p> : null}

              <p className="muted-text">
                Security: the QR contains a random temporary pairing secret. The PC
                ignores scans after expiry or disconnect. Do not share the QR outside
                the counter.
              </p>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
