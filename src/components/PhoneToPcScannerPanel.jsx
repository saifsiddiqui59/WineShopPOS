import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabase";
import { normalizeBarcode } from "../lib/barcode";

const PAIRING_TTL_MS = 10 * 60 * 1000;
const HEARTBEAT_STALE_MS = 15000;

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
  const query = new URLSearchParams({
    session: pairing.sessionId,
    token: pairing.token,
    shop: pairing.shopId,
    expires: String(pairing.expiresAt),
  });

  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `/phone-scanner?${query.toString()}`;
  return url.toString();
}

function statusCopy(status, connected) {
  if (connected) return "PHONE CONNECTED";
  if (status === "EXPIRED") return "PAIRING EXPIRED";
  if (status === "CONNECTION_ERROR") return "CONNECTION ERROR";
  if (status === "CONNECTING") return "CONNECTING…";
  return "WAITING FOR PHONE";
}

export default function PhoneToPcScannerPanel({ shopId, onBarcode }) {
  const [pairing, setPairing] = useState(null);
  const [channelStatus, setChannelStatus] = useState("DISCONNECTED");
  const [phoneSeenAt, setPhoneSeenAt] = useState(0);
  const [lastScan, setLastScan] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");

  const onBarcodeRef = useRef(onBarcode);
  const ackCacheRef = useRef(new Map());

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
      if (next <= 0) setChannelStatus("EXPIRED");
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [pairing]);

  useEffect(() => {
    if (!pairing) return undefined;

    ackCacheRef.current = new Map();
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
      .on("broadcast", { event: "barcode" }, async ({ payload }) => {
        if (
          payload?.sessionId !== pairing.sessionId ||
          Date.now() >= pairing.expiresAt
        ) {
          return;
        }

        const eventId = String(payload?.eventId || "");
        const barcode = normalizeBarcode(payload?.barcode);
        if (!eventId || !barcode) return;

        const priorAck = ackCacheRef.current.get(eventId);
        if (priorAck) {
          void channel.send({
            type: "broadcast",
            event: "barcode-ack",
            payload: priorAck,
          });
          return;
        }

        setPhoneSeenAt(Date.now());
        setChannelStatus("CONNECTED");

        let outcome = null;
        try {
          outcome = await Promise.resolve(
            onBarcodeRef.current?.(barcode, {
              source: "PHONE_TO_PC",
              sessionId: pairing.sessionId,
              eventId,
            }),
          );
        } catch (error) {
          outcome = {
            ok: false,
            status: "PC_ERROR",
            message: error?.message || String(error),
          };
        }

        const ackPayload = {
          sessionId: pairing.sessionId,
          eventId,
          barcode,
          accepted: Boolean(outcome?.ok),
          status: String(
            outcome?.status ||
              (outcome?.ok ? "ADDED_TO_CART" : "NOT_ADDED"),
          ),
          productName: outcome?.productName || null,
          message:
            outcome?.message ||
            (outcome?.ok
              ? "PC accepted the barcode."
              : "PC received the barcode but did not add it."),
          receivedAt: new Date().toISOString(),
        };

        ackCacheRef.current.set(eventId, ackPayload);
        if (ackCacheRef.current.size > 100) {
          const entries = Array.from(ackCacheRef.current.entries()).slice(-50);
          ackCacheRef.current = new Map(entries);
        }

        setLastScan(ackPayload);

        void channel.send({
          type: "broadcast",
          event: "barcode-ack",
          payload: ackPayload,
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

    return () => {
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
      setCopyMessage("Phone scanner link copied.");
    } catch {
      setCopyMessage("Could not copy automatically. Scan the QR instead.");
    }
  }

  return (
    <div className="phone-pc-panel">
      {!pairing ? (
        <div className="phone-pc-start">
          <div className="scanner-instruction-card">
            <strong>Use a separate phone as the barcode gun</strong>
            <span>
              The phone only sends barcode numbers. Product lookup, stock checks
              and billing stay on this PC.
            </span>
          </div>

          <button
            type="button"
            className="primary-button phone-pc-connect-button"
            onClick={startPairing}
          >
            Connect Phone
          </button>
        </div>
      ) : (
        <div className="phone-pc-pairing">
          <div className="phone-pc-qr-column">
            <div className="phone-pc-step-badge">1</div>
            <strong>Scan this QR with the separate phone</strong>
            <div className="phone-pc-qr">
              <QRCodeSVG
                value={url}
                size={220}
                marginSize={2}
                level="M"
                title="Phone scanner pairing QR code"
              />
            </div>
            <small>QR expires after 10 minutes.</small>
          </div>

          <div className="phone-pc-pairing-info">
            <div
              className={`phone-pc-status ${
                connected ? "connected" : channelStatus.toLowerCase()
              }`}
            >
              <strong>{statusCopy(channelStatus, connected)}</strong>
              <span>
                {secondsLeft > 0
                  ? `Expires in ${Math.floor(secondsLeft / 60)}:${String(
                      secondsLeft % 60,
                    ).padStart(2, "0")}`
                  : "Create a new pairing to continue."}
              </span>
            </div>

            <div className="scanner-instruction-grid">
              <div className="scanner-instruction-card">
                <b>2</b>
                <strong>Open the scanner link</strong>
                <span>The phone page should show Connected to PC.</span>
              </div>
              <div className="scanner-instruction-card">
                <b>3</b>
                <strong>Tap Start Camera</strong>
                <span>Scan bottles/cans exactly like a wireless barcode gun.</span>
              </div>
            </div>

            {lastScan ? (
              <div
                className={`phone-pc-last-scan ${
                  lastScan.accepted ? "accepted" : "rejected"
                }`}
              >
                <span>Last scan from phone</span>
                <strong>{lastScan.barcode}</strong>
                <b>
                  {lastScan.accepted
                    ? `${lastScan.productName || "Product"} added on PC`
                    : lastScan.status.replaceAll("_", " ")}
                </b>
              </div>
            ) : (
              <div className="phone-pc-last-scan">
                <span>Last scan from phone</span>
                <strong>Waiting…</strong>
              </div>
            )}

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={copyLink}
              >
                Copy Phone Link
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={startPairing}
              >
                New QR
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={disconnect}
              >
                Disconnect
              </button>
            </div>

            {copyMessage ? (
              <p className="scanner-readable-help">{copyMessage}</p>
            ) : null}

            <p className="scanner-readable-help">
              Security: the QR contains a 192-bit temporary pairing secret.
              Disconnect or New QR stops this PC from listening to the old
              session. Do not share the QR outside the counter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
