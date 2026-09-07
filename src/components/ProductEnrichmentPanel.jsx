import { useEffect, useMemo, useRef, useState } from "react";
import { useScanner } from "../context/ScannerContext";
import { validateGtin } from "../lib/barcode";
import {
  confirmPhysicalBarcode,
  discoverProducts,
} from "../lib/productEnrichmentClient";

function inferPackage(value) {
  const text = String(value || "").toLowerCase();
  if (/\b(can|tin)\b/.test(text)) return "CAN";
  if (/\b(bottle|btl)\b/.test(text)) return "BOTTLE";
  return "";
}

function CandidateCard({ candidate, actionLabel, onAction }) {
  return (
    <article className="product-enrichment-card">
      <div className="product-enrichment-image">
        {candidate?.imagePreviewUrl ? (
          <img src={candidate.imagePreviewUrl} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span>No image</span>
        )}
      </div>
      <div className="product-enrichment-copy">
        <strong>{candidate?.title || "Unnamed candidate"}</strong>
        <span>
          {candidate?.brand || "Brand unknown"}
          {candidate?.sizeMl ? ` · ${candidate.sizeMl} ml` : ""}
          {candidate?.packageType ? ` · ${candidate.packageType}` : ""}
        </span>
        <span>
          {candidate?.barcode
            ? `Possible barcode: ${candidate.barcode}`
            : "Barcode not supplied by this source"}
        </span>
        {candidate?.barcode ? <small>Internet suggestion — not physically verified</small> : null}
        <span>
          Match: {Math.round(Number(candidate?.score || 0) * 100)}% ·{" "}
          {candidate?.confidenceBand || "LOW"} confidence
        </span>
        <small>
          Source tier {candidate?.sourceTier || "D"} ·{" "}
          {(candidate?.providers || []).join(" + ") || "External source"}
        </small>
        {(candidate?.matchReasons || []).length ? (
          <small>{candidate.matchReasons.join(" · ")}</small>
        ) : null}
        {(candidate?.conflicts || []).length ? (
          <small className="product-enrichment-conflict-text">
            Conflicts: {candidate.conflicts.map((x) => x.message).join(" · ")}
          </small>
        ) : null}
        {candidate?.sourcePageUrl ? (
          <a
            className="product-enrichment-source-link"
            href={candidate.sourcePageUrl}
            target="_blank"
            rel="noreferrer"
          >
            View source
          </a>
        ) : null}
      </div>
      {onAction ? (
        <button type="button" className="primary-button" onClick={() => onAction(candidate)}>
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

export default function ProductEnrichmentPanel({
  shopId,
  item,
  sizeMl,
  brand = "",
  packageType = "",
  barcode = "",
  disabled = false,
  onUseCandidate,
  onCreateFallback,
}) {
  const { lastScan } = useScanner();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("DISCOVERY_IDLE");
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [physicalBarcode, setPhysicalBarcode] = useState("");
  const [message, setMessage] = useState("");
  const [importImage, setImportImage] = useState(false);
  const [showBarcodeMatch, setShowBarcodeMatch] = useState(false);
  const requestRef = useRef(null);
  const selectedAtRef = useRef(0);

  const query = String(item?.description || item?.name || "").trim();
  const effectiveBrand = String(brand || item?.brand || "").trim();
  const effectiveSize = Number(sizeMl || item?.sizeMl || 0) || null;
  const effectivePackage =
    String(packageType || item?.packageType || "").trim() ||
    inferPackage(query);

  const context = useMemo(
    () => ({
      shopId,
      query,
      brand: effectiveBrand,
      sizeMl: effectiveSize,
      packageType: effectivePackage || null,
    }),
    [shopId, query, effectiveBrand, effectiveSize, effectivePackage],
  );

  function abortCurrent() {
    requestRef.current?.abort?.();
    requestRef.current = null;
  }

  useEffect(() => () => abortCurrent(), []);

  async function runDiscovery() {
    setOpen(true);
    abortCurrent();
    setMessage("");
    setResult(null);
    setSelected(null);
    setConfirmation(null);
    setPhysicalBarcode("");
    setImportImage(false);

    if (!shopId) {
      setStage("DISCOVERY_IDLE");
      setMessage("Active shop is unavailable.");
      return;
    }

    const existingBarcode = String(barcode || "").replace(/\D/g, "");
    if (existingBarcode) {
      await verifyBarcode(existingBarcode, { direct: true });
      return;
    }

    setStage("SEARCHING");
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const data = await discoverProducts(context, { signal: controller.signal });
      setResult(data);
      setStage("CANDIDATES");
      if (!(data.candidates || []).length) {
        setMessage("No external match found. You can continue with manual product details.");
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      setStage("DISCOVERY_IDLE");
      setMessage(
        "Product lookup temporarily unavailable. You can continue with manual product details.",
      );
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }

  function selectCandidate(candidate) {
    abortCurrent();
    setSelected(candidate);
    setConfirmation(null);
    setPhysicalBarcode("");
    setImportImage(Boolean(candidate?.imagePreviewUrl));
    setShowBarcodeMatch(false);
    selectedAtRef.current = Date.now();
    setStage("SELECTED_AWAITING_BARCODE");
    setMessage("");
  }

  async function verifyBarcode(value, { direct = false } = {}) {
    const code = String(value || "").replace(/\D/g, "");
    if (code.length < 6) {
      setMessage("Scan a complete physical barcode or enter at least 6 digits.");
      return;
    }

    const validation = validateGtin(code);
    if (validation.recognized && !validation.valid) {
      setMessage("Barcode checksum is invalid. Scan the physical product again.");
      return;
    }

    abortCurrent();
    setOpen(true);
    setPhysicalBarcode(code);
    setMessage("");
    setStage("VERIFYING_BARCODE");

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const data = await confirmPhysicalBarcode(
        {
          ...context,
          barcode: code,
          discoveryCacheKey: direct ? null : result?.cacheKey || null,
          selectedCandidateId: direct ? null : selected?.candidateId || null,
        },
        { signal: controller.signal },
      );
      setConfirmation(data);
      if (!selected && data.selectedCandidate) setSelected(data.selectedCandidate);
      setImportImage(Boolean((selected || data.selectedCandidate)?.imagePreviewUrl));
      setStage(
        data.outcome === "CONFIRMED"
          ? "CONFIRMED"
          : data.outcome === "CONFLICT"
            ? "CONFLICT"
            : "UNVERIFIED",
      );
    } catch (error) {
      if (error?.name === "AbortError") return;
      setStage(selected ? "SELECTED_AWAITING_BARCODE" : "DISCOVERY_IDLE");
      setMessage(error?.message || "Barcode verification failed.");
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }

  useEffect(() => {
    if (stage !== "SELECTED_AWAITING_BARCODE" || !lastScan?.id) return;
    const scanTime = Date.parse(lastScan.at || "");
    if (Number.isFinite(scanTime) && scanTime < selectedAtRef.current) return;
    void verifyBarcode(lastScan.barcode);
    // lastScan.id is the one-event consumption key; do not replay old scans.
  }, [lastScan?.id, stage]);

  function scanAgain() {
    abortCurrent();
    setConfirmation(null);
    setPhysicalBarcode("");
    setShowBarcodeMatch(false);
    selectedAtRef.current = Date.now();
    setStage("SELECTED_AWAITING_BARCODE");
    setMessage("");
  }

  function useConfirmedSelection() {
    const candidate = selected || confirmation?.selectedCandidate || null;
    onUseCandidate?.({
      outcome: confirmation?.outcome || "UNVERIFIED",
      physicalBarcode,
      confirmationCacheKey: confirmation?.confirmationCacheKey || null,
      candidateId: candidate?.candidateId || null,
      candidate,
      importImage: Boolean(importImage && candidate?.imagePreviewUrl),
      providerStatus: confirmation?.providerStatus || {},
    });
    setOpen(false);
  }

  function keepManualDetails() {
    onUseCandidate?.({
      outcome: "MANUAL",
      physicalBarcode,
      confirmationCacheKey: null,
      candidateId: null,
      candidate: null,
      importImage: false,
      providerStatus: confirmation?.providerStatus || {},
    });
    setOpen(false);
  }

  const busy = stage === "SEARCHING" || stage === "VERIFYING_BARCODE";
  const displayCandidate = selected || confirmation?.selectedCandidate || null;

  return (
    <>
      <button
        type="button"
        className="primary-button"
        disabled={disabled || busy}
        onClick={runDiscovery}
      >
        Find Product
      </button>

      {open ? (
        <div className="product-enrichment-backdrop" role="presentation">
          <div
            className="product-enrichment-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Find product and confirm physical barcode"
          >
            <div className="section-row">
              <div>
                <h3>Find Product</h3>
                <p className="muted-text">
                  Discover visually first if needed, then verify the barcode printed on the physical product.
                </p>
              </div>
              <button type="button" className="secondary-button" onClick={() => {
                abortCurrent();
                setOpen(false);
              }}>
                Close
              </button>
            </div>

            <div className="product-enrichment-query">
              <span>{barcode ? "BARCODE / PRODUCT" : "PRODUCT"}</span>
              <strong>{query || "Product details"}</strong>
              {effectiveBrand ? <small>{effectiveBrand}</small> : null}
              {effectiveSize ? <small>{effectiveSize} ml</small> : null}
              {effectivePackage ? <small>{effectivePackage}</small> : null}
            </div>

            {busy ? (
              <div className="purchase-message">
                {stage === "SEARCHING"
                  ? "Searching product catalogues… Searching more sources only when needed."
                  : "Verifying the physical barcode…"}
              </div>
            ) : null}

            {message ? <div className="purchase-message">{message}</div> : null}

            {result ? (
              <div className="product-enrichment-meta">
                <span>{result.cacheHit ? "Cached lookup" : "Live lookup"}</span>
                <span>{Number(result.latencyMs || 0)} ms</span>
                <span>
                  UPC: {result.providerStatus?.UPCITEMDB || "—"} · OFF:{" "}
                  {result.providerStatus?.OPENFOODFACTS || "—"} · Brave:{" "}
                  {result.providerStatus?.BRAVE_IMAGES || "—"}
                </span>
              </div>
            ) : null}

            {stage === "CANDIDATES" ? (
              (result?.candidates || []).length ? (
                <>
                  <h4>Possible matches</h4>
                  <div className="product-enrichment-list">
                    {result.candidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.candidateId}
                        candidate={candidate}
                        actionLabel="This Is My Product"
                        onAction={selectCandidate}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="verification-guidance verification-guidance--neutral">
                  <strong>No catalogue match found.</strong>{" "}
                  Continue manually; product lookup availability never blocks product creation.
                  {onCreateFallback ? (
                    <div style={{ marginTop: 10 }}>
                      <button type="button" className="primary-button" onClick={() => {
                        onCreateFallback();
                        setOpen(false);
                      }}>
                        Continue With Manual Details
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            ) : null}

            {stage === "SELECTED_AWAITING_BARCODE" ? (
              <>
                <CandidateCard candidate={selected} />
                <div className="product-enrichment-scan-box">
                  <strong>SCAN BARCODE FROM THIS PHYSICAL PRODUCT</strong>
                  <p className="muted-text">
                    Scanner completion triggers verification automatically. Manual typing verifies only on Enter or Verify.
                  </p>
                  <div className="product-enrichment-barcode-row">
                    <input
                      data-scanner-capture="barcode"
                      inputMode="numeric"
                      autoFocus
                      value={physicalBarcode}
                      onChange={(event) => setPhysicalBarcode(event.target.value.replace(/\D/g, ""))}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void verifyBarcode(physicalBarcode);
                        }
                      }}
                      placeholder="Scan or type physical barcode"
                    />
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void verifyBarcode(physicalBarcode)}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {stage === "CONFIRMED" ? (
              <div className="verification-guidance verification-guidance--success">
                <strong>✓ BARCODE CONFIRMED</strong>
                <p>{confirmation?.note}</p>
                {displayCandidate ? <CandidateCard candidate={displayCandidate} /> : null}
                <label className="product-enrichment-import-choice">
                  <input
                    type="checkbox"
                    checked={Boolean(importImage && displayCandidate?.imagePreviewUrl)}
                    disabled={!displayCandidate?.imagePreviewUrl}
                    onChange={(event) => setImportImage(event.target.checked)}
                  />
                  Import this selected image after I save the Product Master record
                </label>
                <button type="button" className="primary-button" onClick={useConfirmedSelection}>
                  Use This Product
                </button>
              </div>
            ) : null}

            {stage === "UNVERIFIED" ? (
              <div className="verification-guidance verification-guidance--neutral">
                <strong>BARCODE SCANNED — INTERNET IDENTITY NOT VERIFIED</strong>
                <p>
                  The physical scan is retained. Lack of an internet match does not mean the barcode is wrong.
                </p>
                {displayCandidate ? <CandidateCard candidate={displayCandidate} /> : null}
                <label className="product-enrichment-import-choice">
                  <input
                    type="checkbox"
                    checked={Boolean(importImage && displayCandidate?.imagePreviewUrl)}
                    disabled={!displayCandidate?.imagePreviewUrl}
                    onChange={(event) => setImportImage(event.target.checked)}
                  />
                  I approve this image for the manually confirmed product
                </label>
                <div className="button-row">
                  <button type="button" className="primary-button" onClick={useConfirmedSelection}>
                    Use Physical Barcode + Confirmed Details
                  </button>
                  <button type="button" className="secondary-button" onClick={scanAgain}>
                    Scan Again
                  </button>
                </div>
              </div>
            ) : null}

            {stage === "CONFLICT" ? (
              <div className="verification-guidance verification-guidance--warning">
                <strong>⚠ PRODUCT MISMATCH</strong>
                <p>No Product Master value or image has been changed automatically.</p>

                <div className="product-enrichment-comparison">
                  <div>
                    <small>Selected / Current</small>
                    <strong>{selected?.title || query || "Manual product details"}</strong>
                    <span>
                      {selected?.sizeMl || effectiveSize || "?"} ml ·{" "}
                      {selected?.packageType || effectivePackage || "Package unknown"}
                    </span>
                  </div>
                  <div>
                    <small>Scanned barcode result</small>
                    <strong>{confirmation?.barcodeMatch?.title || "Different internet identity"}</strong>
                    <span>
                      {confirmation?.barcodeMatch?.sizeMl || "?"} ml ·{" "}
                      {confirmation?.barcodeMatch?.packageType || "Package unknown"}
                    </span>
                  </div>
                </div>

                {(confirmation?.conflicts || []).length ? (
                  <div className="product-enrichment-conflict-list">
                    {confirmation.conflicts.map((conflict, index) => (
                      <span key={`${conflict.type}-${index}`}>
                        {conflict.type}: {conflict.message}
                      </span>
                    ))}
                  </div>
                ) : null}

                {showBarcodeMatch && confirmation?.barcodeMatch ? (
                  <CandidateCard candidate={confirmation.barcodeMatch} />
                ) : null}

                <div className="button-row">
                  <button type="button" className="primary-button" onClick={scanAgain}>
                    Scan Again
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowBarcodeMatch((value) => !value)}
                  >
                    View Barcode Match
                  </button>
                  <button type="button" className="secondary-button" onClick={keepManualDetails}>
                    Keep Manual Details
                  </button>
                </div>
              </div>
            ) : null}

            <p className="muted-text product-enrichment-rights-note">
              External imagery is a reference candidate. Source metadata is retained. WineShopPOS does not claim commercial reuse rights; use only imagery you are permitted to use.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
