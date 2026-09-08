import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { normalizeBarcode } from "../lib/barcode";
import { useAuth } from "../context/AuthContext";
import { useScanner } from "../context/ScannerContext";

export const PHONE_PAIRING_KEY = "wsp_global_phone_scanner_pairing_v1";
const MAX_ACK_CACHE = 500;

export function loadPhonePairing() {
  try {
    const value = JSON.parse(localStorage.getItem(PHONE_PAIRING_KEY) || "null");
    if (!value?.shopId || !value?.sessionId || !value?.token) return null;
    return value;
  } catch {
    return null;
  }
}

export function clearPhonePairing() {
  localStorage.removeItem(PHONE_PAIRING_KEY);
  window.dispatchEvent(new CustomEvent("wsp-phone-pairing-changed"));
}

export function savePhonePairing(value) {
  if (!value?.shopId || !value?.sessionId || !value?.token) {
    throw new Error("A complete phone pairing is required.");
  }
  localStorage.setItem(PHONE_PAIRING_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("wsp-phone-pairing-changed"));
}

export function makePhonePairing(shopId) {
  if (!shopId) throw new Error("A shop is required before pairing a phone.");
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (v) => v.toString(16).padStart(2, "0")).join("");
  return {
    shopId,
    sessionId: crypto.randomUUID(),
    token,
    createdAt: new Date().toISOString(),
  };
}

export function pairingTopic(pairing) {
  return `global-phone:${pairing.shopId}:${pairing.sessionId}:${pairing.token}`;
}

export function pairingUrl(pairing) {
  const q = new URLSearchParams({
    session: pairing.sessionId,
    token: pairing.token,
    shop: pairing.shopId,
  });
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `/phone-scanner?${q.toString()}`;
  return url.toString();
}

function rememberAck(cache, eventId, ack) {
  cache.set(eventId, ack);
  while (cache.size > MAX_ACK_CACHE) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    cache.delete(oldest);
  }
}

export default function GlobalPhoneScannerHost() {
  const { profile } = useAuth();
  const { injectScan } = useScanner();
  const [pairing, setPairing] = useState(loadPhonePairing);
  const seenRef = useRef(new Map());

  useEffect(() => {
    const sync = () => setPairing(loadPhonePairing());
    window.addEventListener("wsp-phone-pairing-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wsp-phone-pairing-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!pairing || !profile?.shop_id || pairing.shopId !== profile.shop_id) {
      return undefined;
    }

    seenRef.current = new Map();

    const channel = supabase
      .channel(pairingTopic(pairing), {
        config: { broadcast: { ack: false, self: false } },
      })
      .on("broadcast", { event: "phone-ready" }, ({ payload }) => {
        if (payload?.sessionId !== pairing.sessionId) return;
        void channel.send({
          type: "broadcast",
          event: "pc-ready",
          payload: {
            sessionId: pairing.sessionId,
            persistent: true,
          },
        });
      })
      .on("broadcast", { event: "barcode" }, ({ payload }) => {
        if (payload?.sessionId !== pairing.sessionId) return;

        const eventId = String(payload?.eventId || "");
        const barcode = normalizeBarcode(payload?.barcode);
        if (!eventId || !barcode) return;

        const prior = seenRef.current.get(eventId);
        if (prior) {
          void channel.send({
            type: "broadcast",
            event: "barcode-ack",
            payload: prior,
          });
          return;
        }

        const accepted = injectScan(barcode, {
          source: "PHONE_REMOTE",
          eventId,
        });

        const ack = {
          sessionId: pairing.sessionId,
          eventId,
          barcode,
          accepted: Boolean(accepted),
          status: accepted ? "SCAN_INJECTED" : "SCAN_REJECTED",
          message: accepted
            ? "Barcode delivered to WineShopPOS."
            : "WineShopPOS rejected the barcode event.",
          receivedAt: new Date().toISOString(),
        };

        rememberAck(seenRef.current, eventId, ack);

        void channel.send({
          type: "broadcast",
          event: "barcode-ack",
          payload: ack,
        });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.send({
            type: "broadcast",
            event: "pc-ready",
            payload: {
              sessionId: pairing.sessionId,
              persistent: true,
            },
          });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [pairing, profile?.shop_id, injectScan]);

  return null;
}
