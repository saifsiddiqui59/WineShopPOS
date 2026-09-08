import { useEffect, useMemo, useRef, useState } from "react";
import { discoverProducts } from "../lib/productEnrichmentClient";

function inferPackage(value) {
  const text = String(value || "").toLowerCase();
  if (/\b(can|tin)\b/.test(text)) return "CAN";
  if (/\b(bottle|btl)\b/.test(text)) return "BOTTLE";
  return "";
}

export default function OcrProductImagePreview({ shopId, item, sizeMl, delayMs = 0 }) {
  const [state, setState] = useState({ status: "IDLE", candidate: null });
  const controllerRef = useRef(null);
  const query = String(item?.description || item?.name || "").trim();
  const context = useMemo(() => ({
    shopId,
    query,
    brand: String(item?.brand || "").trim(),
    sizeMl: Number(sizeMl || 0) || null,
    packageType: inferPackage(query) || null,
  }), [shopId, query, item?.brand, sizeMl]);

  useEffect(() => {
    if (!shopId || !query) return undefined;
    const timer = window.setTimeout(() => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ status: "SEARCHING", candidate: null });
      void discoverProducts(context, { signal: controller.signal })
        .then((data) => setState({ status: "READY", candidate: data?.candidates?.[0] || null }))
        .catch((error) => {
          if (error?.name === "AbortError") return;
          setState({ status: "FAILED", candidate: null });
        })
        .finally(() => {
          if (controllerRef.current === controller) controllerRef.current = null;
        });
    }, Math.max(0, Number(delayMs || 0)));

    return () => {
      window.clearTimeout(timer);
      controllerRef.current?.abort?.();
      controllerRef.current = null;
    };
  }, [shopId, query, context, delayMs]);

  const candidate = state.candidate;
  if (candidate?.imagePreviewUrl) {
    return (
      <div className="ocr-auto-image-preview">
        <img src={candidate.imagePreviewUrl} alt={candidate.title || query} referrerPolicy="no-referrer" />
        <small>{candidate.title || query}</small>
        <span>Candidate preview · {Math.round(Number(candidate.score || 0) * 100)}%</span>
      </div>
    );
  }

  return (
    <div className="ocr-auto-image-preview ocr-auto-image-preview--empty">
      <span>{state.status === "SEARCHING" ? "Finding image…" : "No candidate image"}</span>
      <small>{query}</small>
    </div>
  );
}
