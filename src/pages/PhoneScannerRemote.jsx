import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MobileBarcodeScanner from "../components/MobileBarcodeScanner";
import { supabase } from "../lib/supabase";
import { normalizeBarcode } from "../lib/barcode";

const PHONE_KEY = "wsp_saved_pc_scanner_pairing_v1";
const SEND_ATTEMPTS = 3;
const ACK_TIMEOUT_MS = 1600;

function readSaved() {
  try { return JSON.parse(localStorage.getItem(PHONE_KEY) || "null"); } catch { return null; }
}

export default function PhoneScannerRemote() {
  const [params] = useSearchParams();
  const pairing = useMemo(() => {
    const fromUrl = { sessionId: params.get("session") || "", token: params.get("token") || "", shopId: params.get("shop") || "" };
    if (fromUrl.sessionId && fromUrl.token && fromUrl.shopId) {
      localStorage.setItem(PHONE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    return readSaved();
  }, [params]);

  const [status, setStatus] = useState(pairing ? "CONNECTING" : "INVALID");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [autoScan, setAutoScan] = useState(() => localStorage.getItem("wsp_phone_auto_scan") !== "0");
  const [lastResult, setLastResult] = useState(null);
  const channelRef = useRef(null);
  const waitersRef = useRef(new Map());

  const valid = Boolean(pairing?.sessionId && pairing?.token && pairing?.shopId);
  const topic = valid ? `global-phone:${pairing.shopId}:${pairing.sessionId}:${pairing.token}` : "";

  useEffect(() => {
    if (!valid) return undefined;
    const channel = supabase
      .channel(topic, { config: { broadcast: { ack: false, self: false } } })
      .on("broadcast", { event: "pc-ready" }, ({ payload }) => {
        if (payload?.sessionId !== pairing.sessionId) return;
        setStatus("CONNECTED");
        if (autoScan) setScannerOpen(true);
      })
      .on("broadcast", { event: "barcode-ack" }, ({ payload }) => {
        const waiter = waitersRef.current.get(String(payload?.eventId || ""));
        if (waiter) waiter(payload);
        setLastResult(payload || null);
        setStatus("CONNECTED");
      })
      .subscribe((s) => {
        if (s === "SUBSCRIBED") {
          setStatus("WAITING_FOR_PC");
          void channel.send({ type: "broadcast", event: "phone-ready", payload: { sessionId: pairing.sessionId, at: new Date().toISOString() } });
        } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("CONNECTION_ERROR");
      });
    channelRef.current = channel;
    const ping = window.setInterval(() => {
      void channel.send({ type: "broadcast", event: "phone-ready", payload: { sessionId: pairing.sessionId, at: new Date().toISOString() } });
    }, 5000);
    return () => {
      window.clearInterval(ping);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [valid, topic, pairing?.sessionId, autoScan]);

  function waitAck(eventId) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (value) => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        waitersRef.current.delete(eventId);
        resolve(value);
      };
      const timer = window.setTimeout(() => finish(null), ACK_TIMEOUT_MS);
      waitersRef.current.set(eventId, finish);
    });
  }

  async function sendBarcode(raw) {
    const barcode = normalizeBarcode(raw);
    if (!barcode || !channelRef.current || status !== "CONNECTED") {
      setScannerOpen(false);
      setLastResult({ accepted: false, message: "PC is not connected." });
      return;
    }
    const eventId = crypto.randomUUID();
    const payload = { sessionId: pairing.sessionId, eventId, barcode, sentAt: new Date().toISOString() };
    let ack = null;
    for (let i = 0; i < SEND_ATTEMPTS && !ack; i += 1) {
      const waiting = waitAck(eventId);
      try { await channelRef.current.send({ type: "broadcast", event: "barcode", payload }); } catch {}
      ack = await waiting;
    }
    setLastResult(ack || { accepted: false, barcode, message: "PC did not confirm the scan." });
    setScannerOpen(false);
    if (ack?.accepted && autoScan) window.setTimeout(() => setScannerOpen(true), 500);
  }

  function forget() {
    localStorage.removeItem(PHONE_KEY);
    setScannerOpen(false);
    window.location.hash = "#/phone-scanner";
  }

  if (!valid) {
    return <main className="phone-scanner-page"><section className="phone-scanner-card">
      <h1>Phone Barcode Scanner</h1>
      <div className="phone-scanner-alert error"><strong>No saved PC connection</strong><span>Open Operations → Phone Scanner on the PC and scan the QR once.</span></div>
    </section></main>;
  }

  return <main className="phone-scanner-page"><section className="phone-scanner-card">
    <div className="phone-scanner-brand">WineShopPOS</div>
    <h1>Barcode Scanner for PC</h1>
    <div className={`phone-scanner-connection ${status === "CONNECTED" ? "connected" : "waiting"}`}>
      <strong>{status === "CONNECTED" ? "✓ Connected to PC" : status.replaceAll("_", " ")}</strong>
      <span>Connection stays saved on this phone until Forget This PC.</span>
    </div>
    {lastResult ? <div className={`phone-scanner-result ${lastResult.accepted ? "success" : "warning"}`}>
      <strong>{lastResult.barcode || "Last scan"}</strong><span>{lastResult.message || lastResult.status || ""}</span>
    </div> : null}
    <div className="button-row">
      <button type="button" className="primary-button phone-scanner-start" disabled={status !== "CONNECTED"} onClick={() => setScannerOpen(true)}>Scan Barcode</button>
      <button type="button" className="secondary-button" onClick={() => {
        const next = !autoScan;
        setAutoScan(next);
        localStorage.setItem("wsp_phone_auto_scan", next ? "1" : "0");
        if (next && status === "CONNECTED") setScannerOpen(true);
      }}>Auto Scan: {autoScan ? "ON" : "OFF"}</button>
    </div>
    <button type="button" className="secondary-button" onClick={forget}>Forget This PC</button>
    <MobileBarcodeScanner open={scannerOpen} title="Scan Barcode for PC" onClose={() => setScannerOpen(false)} onDetected={(code) => void sendBarcode(code)}/>
  </section></main>;
}
