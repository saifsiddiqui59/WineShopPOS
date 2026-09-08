import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MobileBarcodeScanner from "../components/MobileBarcodeScanner";
import { supabase } from "../lib/supabase";
import { normalizeBarcode } from "../lib/barcode";

const SEND_ATTEMPTS = 3;
const ACK_TIMEOUT_MS = 1300;

function validPairingPart(value, minLength, maxLength) {
  const text = String(value || "");
  return (
    text.length >= minLength &&
    text.length <= maxLength &&
    /^[A-Za-z0-9-]+$/.test(text)
  );
}

export default function PhoneScannerRemote() {
  const [params] = useSearchParams();

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
  const [lastAck, setLastAck] = useState(null);
  const [sendState, setSendState] = useState("IDLE");
  const [secondsLeft, setSecondsLeft] = useState(
    valid ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 0,
  );

  const channelRef = useRef(null);
  const restartTimerRef = useRef(null);
  const ackWaitersRef = useRef(new Map());
  const pendingRef = useRef(null);

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
        if (
          payload?.sessionId === sessionId &&
          Date.now() < expiresAt
        ) {
          setChannelStatus("CONNECTED");
        }
      })
      .on("broadcast", { event: "barcode-ack" }, ({ payload }) => {
        if (
          payload?.sessionId !== sessionId ||
          !payload?.eventId
        ) {
          return;
        }

        const eventId = String(payload.eventId);
        const waiter = ackWaitersRef.current.get(eventId);
        if (waiter) waiter(payload);

        setLastAck(payload);
        setChannelStatus("CONNECTED");
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
      for (const waiter of ackWaitersRef.current.values()) {
        waiter(null);
      }
      ackWaitersRef.current.clear();
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

  function waitForAck(eventId, timeoutMs = ACK_TIMEOUT_MS) {
    return new Promise((resolve) => {
      let finished = false;

      const finish = (value) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        ackWaitersRef.current.delete(eventId);
        resolve(value);
      };

      const timer = window.setTimeout(
        () => finish(null),
        timeoutMs,
      );

      ackWaitersRef.current.set(eventId, finish);
    });
  }

  async function transmit(event) {
    if (!channelRef.current) return null;

    for (let attempt = 1; attempt <= SEND_ATTEMPTS; attempt += 1) {
      setSendState(`SENDING_${attempt}`);

      const ackPromise = waitForAck(event.eventId);

      try {
        await channelRef.current.send({
          type: "broadcast",
          event: "barcode",
          payload: event,
        });
      } catch {}

      const ack = await ackPromise;
      if (ack) return ack;
    }

    return null;
  }

  function restartCameraAfterAck() {
    setScannerOpen(false);
    restartTimerRef.current = window.setTimeout(() => {
      if (
        Date.now() < expiresAt &&
        channelStatus === "CONNECTED"
      ) {
        setScannerKey((value) => value + 1);
        setScannerOpen(true);
      }
    }, 650);
  }

  async function sendEvent(event) {
    pendingRef.current = event;
    setLastBarcode(event.barcode);
    setLastAck(null);

    const ack = await transmit(event);

    if (!ack) {
      setSendState("NO_PC_ACK");
      setScannerOpen(false);
      return;
    }

    pendingRef.current = null;
    setLastAck(ack);
    setSendState(ack.accepted ? "PC_ADDED" : "PC_REJECTED");

    try {
      navigator.vibrate?.(
        ack.accepted ? 90 : [80, 70, 80],
      );
    } catch {}

    restartCameraAfterAck();
  }

  async function sendBarcode(rawBarcode) {
    const barcode = normalizeBarcode(rawBarcode);

    if (
      !barcode ||
      !channelRef.current ||
      channelStatus !== "CONNECTED" ||
      Date.now() >= expiresAt
    ) {
      setScannerOpen(false);
      setSendState("NOT_CONNECTED");
      return;
    }

    const eventId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    await sendEvent({
      sessionId,
      eventId,
      barcode,
      sentAt: new Date().toISOString(),
    });
  }

  async function retryLastBarcode() {
    if (!pendingRef.current || channelStatus !== "CONNECTED") return;
    await sendEvent(pendingRef.current);
  }

  if (!valid) {
    return (
      <main className="phone-scanner-page">
        <section className="phone-scanner-card">
          <div className="phone-scanner-brand">WineShopPOS</div>
          <h1>Phone Scanner</h1>
          <div className="phone-scanner-alert error">
            <strong>QR expired or invalid</strong>
            <span>Go back to the PC and create a new QR.</span>
          </div>
        </section>
      </main>
    );
  }

  const connected =
    secondsLeft > 0 &&
    channelStatus === "CONNECTED";

  return (
    <main className="phone-scanner-page">
      <section className="phone-scanner-card">
        <div className="phone-scanner-brand">WineShopPOS</div>
        <h1>Use Phone as Scanner</h1>
        <p className="phone-scanner-lead">
          Scan here. The product is added to the bill on the paired PC.
        </p>

        <div
          className={`phone-scanner-connection ${
            connected ? "connected" : "waiting"
          }`}
        >
          <strong>
            {connected
              ? "✓ Connected to PC"
              : channelStatus === "CONNECTION_ERROR"
                ? "Connection problem"
                : channelStatus === "EXPIRED"
                  ? "Pairing expired"
                  : "Connecting to PC…"}
          </strong>
          <span>
            {secondsLeft > 0
              ? `QR expires in ${Math.floor(secondsLeft / 60)}:${String(
                  secondsLeft % 60,
                ).padStart(2, "0")}`
              : "Create a new QR on the PC."}
          </span>
        </div>

        {lastBarcode ? (
          <div
            className={`phone-scanner-result ${
              lastAck?.accepted
                ? "success"
                : sendState === "NO_PC_ACK"
                  ? "warning"
                  : lastAck
                    ? "error"
                    : ""
            }`}
          >
            <span>Last barcode</span>
            <strong>{lastBarcode}</strong>

            {sendState === "NO_PC_ACK" ? (
              <b>PC did not confirm receipt. Do not scan the next item yet.</b>
            ) : lastAck?.accepted ? (
              <b>
                ✓ {lastAck.productName || "Product"} added on PC
              </b>
            ) : lastAck ? (
              <b>
                {lastAck.status?.replaceAll("_", " ") || "Not added on PC"}
              </b>
            ) : (
              <b>Sending to PC…</b>
            )}
          </div>
        ) : (
          <div className="phone-scanner-result">
            <span>Ready</span>
            <strong>No barcode scanned yet</strong>
          </div>
        )}

        <button
          type="button"
          className="primary-button phone-scanner-start"
          disabled={!connected || sendState.startsWith("SENDING_")}
          onClick={() => {
            setScannerKey((value) => value + 1);
            setScannerOpen(true);
          }}
        >
          Start Camera
        </button>

        {sendState === "NO_PC_ACK" && pendingRef.current ? (
          <button
            type="button"
            className="secondary-button phone-scanner-retry-send"
            onClick={() => void retryLastBarcode()}
          >
            Retry Sending Last Barcode
          </button>
        ) : null}

        <p className="phone-scanner-help">
          {connected
            ? "Keep this page open. After the PC confirms a scan, the camera starts again automatically."
            : "Keep the PC POS open on the Use Phone tab. Start Camera becomes available when the PC connection is confirmed."}
        </p>

        <MobileBarcodeScanner
          key={scannerKey}
          open={scannerOpen}
          title="Scan Product for PC"
          onClose={() => setScannerOpen(false)}
          onDetected={(code) => void sendBarcode(code)}
        />
      </section>
    </main>
  );
}
