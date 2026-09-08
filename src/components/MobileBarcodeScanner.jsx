import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { normalizeBarcode, validateGtin } from "../lib/barcode";

const NATIVE_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "itf",
];

function preferredCamera(devices) {
  const list = Array.isArray(devices) ? devices : [];
  return (
    list.find((device) =>
      /back|rear|environment|world/i.test(String(device?.label || "")),
    ) ||
    list[list.length - 1] ||
    null
  );
}

export default function MobileBarcodeScanner({
  open,
  title = "Scan Barcode",
  onClose,
  onDetected,
}) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const detectedRef = useRef(onDetected);
  const nativeTimerRef = useRef(null);
  const scanLoopRef = useRef(null);

  const [message, setMessage] = useState("");
  const [manual, setManual] = useState("");
  const [devices, setDevices] = useState([]);
  const [requestedDeviceId, setRequestedDeviceId] = useState("");
  const [activeDeviceId, setActiveDeviceId] = useState("");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scannerMode, setScannerMode] = useState("");
  const [restartToken, setRestartToken] = useState(0);

  useEffect(() => {
    detectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    let accepted = false;
    const reader = new BrowserMultiFormatReader();

    function stopNativeLoop() {
      if (scanLoopRef.current) {
        window.clearTimeout(scanLoopRef.current);
        scanLoopRef.current = null;
      }
      if (nativeTimerRef.current) {
        window.clearTimeout(nativeTimerRef.current);
        nativeTimerRef.current = null;
      }
    }

    function stopStream() {
      stopNativeLoop();
      try {
        controlsRef.current?.stop?.();
      } catch {}
      controlsRef.current = null;

      const stream =
        streamRef.current ||
        videoRef.current?.srcObject;

      if (stream?.getTracks) {
        for (const track of stream.getTracks()) {
          try {
            track.stop();
          } catch {}
        }
      }

      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setTorchSupported(false);
      setTorchOn(false);
    }

    function acceptCode(rawText, source) {
      if (accepted || cancelled) return;
      const code = normalizeBarcode(rawText);
      if (!code) return;

      accepted = true;
      stopStream();

      const gtin = validateGtin(code);
      setMessage(
        gtin.recognized && !gtin.valid
          ? `Barcode ${code} scanned, but its GTIN check digit looks unusual. Review before saving.`
          : `Barcode ${code} scanned.`,
      );

      try {
        navigator.vibrate?.(80);
      } catch {}

      detectedRef.current?.(code, {
        gtin,
        source,
      });
    }

    async function refreshDevices() {
      try {
        const list =
          await BrowserMultiFormatReader.listVideoInputDevices();
        if (!cancelled) {
          setDevices(list || []);
          return list || [];
        }
      } catch {}
      return [];
    }

    function updateTrackFeatures(stream) {
      const track = stream?.getVideoTracks?.()?.[0];
      if (!track) return;

      const settings = track.getSettings?.() || {};
      if (settings.deviceId) {
        setActiveDeviceId(settings.deviceId);
      }

      const capabilities = track.getCapabilities?.() || {};
      setTorchSupported(Boolean(capabilities.torch));
    }

    async function startZxing(deviceId = "") {
      if (cancelled || accepted) return;
      setScannerMode("ZXING");
      setMessage("Scanning barcode… Keep the barcode flat, well lit and inside the box.");

      try {
        const controls = await reader.decodeFromVideoDevice(
          deviceId || undefined,
          videoRef.current,
          (result) => {
            if (result) {
              acceptCode(result.getText(), "ZXING");
            }
          },
        );

        if (cancelled || accepted) {
          controls?.stop?.();
          return;
        }

        controlsRef.current = controls;
        const stream = videoRef.current?.srcObject;
        streamRef.current = stream || null;
        updateTrackFeatures(stream);

        window.setTimeout(() => {
          if (!cancelled && !accepted) {
            setMessage(
              "Still scanning… Move closer, keep the full barcode inside the box, and avoid glare. You can also switch camera or type the barcode.",
            );
          }
        }, 8000);
      } catch (error) {
        if (cancelled || accepted) return;

        try {
          const controls = await reader.decodeFromConstraints(
            {
              audio: false,
              video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            },
            videoRef.current,
            (result) => {
              if (result) {
                acceptCode(result.getText(), "ZXING_CONSTRAINT_FALLBACK");
              }
            },
          );

          if (cancelled || accepted) {
            controls?.stop?.();
            return;
          }

          controlsRef.current = controls;
          const stream = videoRef.current?.srcObject;
          streamRef.current = stream || null;
          updateTrackFeatures(stream);
          setMessage(
            "Compatibility scanner active. Keep the barcode centered and steady.",
          );
        } catch (fallbackError) {
          setMessage(
            `${fallbackError?.message || error?.message || "Camera barcode scanning is unavailable."} You can still type the barcode below.`,
          );
        }
      }
    }

    async function startNativeDetector() {
      if (
        cancelled ||
        accepted ||
        !("BarcodeDetector" in window) ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        return false;
      }

      let formats = NATIVE_FORMATS;
      try {
        const supported =
          await window.BarcodeDetector.getSupportedFormats?.();
        if (Array.isArray(supported) && supported.length) {
          formats = NATIVE_FORMATS.filter((format) =>
            supported.includes(format),
          );
        }
      } catch {}

      if (!formats.length) return false;

      const videoConstraints = requestedDeviceId
        ? {
            deviceId: { exact: requestedDeviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }
        : {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          };

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: videoConstraints,
          });

        if (cancelled || accepted) {
          stream.getTracks().forEach((track) => track.stop());
          return true;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "");
        await videoRef.current.play();

        updateTrackFeatures(stream);
        await refreshDevices();

        const detector = new window.BarcodeDetector({
          formats,
        });

        setScannerMode("NATIVE");
        setMessage(
          "Scanning with phone barcode detector… Keep one barcode inside the box.",
        );

        const detect = async () => {
          if (
            cancelled ||
            accepted ||
            !videoRef.current ||
            videoRef.current.readyState < 2
          ) {
            if (!cancelled && !accepted) {
              scanLoopRef.current = window.setTimeout(
                detect,
                180,
              );
            }
            return;
          }

          try {
            const results =
              await detector.detect(videoRef.current);
            const first = results?.find(
              (item) => item?.rawValue,
            );
            if (first?.rawValue) {
              acceptCode(first.rawValue, "NATIVE_BARCODE_DETECTOR");
              return;
            }
          } catch {}

          if (!cancelled && !accepted) {
            scanLoopRef.current = window.setTimeout(
              detect,
              180,
            );
          }
        };

        void detect();

        nativeTimerRef.current = window.setTimeout(
          async () => {
            if (cancelled || accepted) return;

            stopStream();
            setMessage(
              "Phone detector did not read it yet. Switching to compatibility scanner…",
            );
            await startZxing(
              requestedDeviceId || activeDeviceId || "",
            );
          },
          6500,
        );

        return true;
      } catch {
        stopStream();
        return false;
      }
    }

    async function start() {
      setMessage("");

      if (!window.isSecureContext) {
        setMessage(
          "Barcode camera requires HTTPS. Open the V5 preview using https:// and try again.",
        );
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage(
          "This browser does not expose camera access. You can still type the barcode below.",
        );
        return;
      }

      const list = await refreshDevices();
      let deviceId = requestedDeviceId;

      if (!deviceId && list.length) {
        deviceId =
          preferredCamera(list)?.deviceId || "";
      }

      const nativeStarted =
        await startNativeDetector();

      if (!nativeStarted && !cancelled && !accepted) {
        await startZxing(deviceId);
      }
    }

    void start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [
    open,
    requestedDeviceId,
    restartToken,
  ]);

  if (!open) return null;

  function useManual() {
    const code = normalizeBarcode(manual);
    if (!code) {
      setMessage("Enter a barcode first.");
      return;
    }

    detectedRef.current?.(code, {
      gtin: validateGtin(code),
      manual: true,
      source: "MANUAL",
    });
  }

  function switchCamera() {
    if (devices.length < 2) {
      setMessage("Only one camera is available.");
      return;
    }

    const currentIndex = Math.max(
      0,
      devices.findIndex(
        (device) =>
          device.deviceId ===
          (activeDeviceId || requestedDeviceId),
      ),
    );

    const next =
      devices[(currentIndex + 1) % devices.length];

    setRequestedDeviceId(next?.deviceId || "");
    setMessage(
      `Switching to ${next?.label || "another camera"}…`,
    );
  }

  async function toggleTorch() {
    const track =
      streamRef.current?.getVideoTracks?.()?.[0];

    if (!track || !torchSupported) {
      setMessage(
        "Torch is not available on this camera.",
      );
      return;
    }

    const next = !torchOn;

    try {
      await track.applyConstraints({
        advanced: [{ torch: next }],
      });
      setTorchOn(next);
    } catch (error) {
      setMessage(
        error?.message ||
          "Could not change the camera torch.",
      );
    }
  }

  return (
    <div
      className="mobile-barcode-backdrop"
      role="presentation"
    >
      <section
        className="mobile-barcode-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mobile-barcode-header">
          <div>
            <h3>{title}</h3>
            <p className="muted-text">
              Rear camera preferred · native mobile detector
              with ZXing fallback · no paid scanning service.
            </p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            aria-label="Close barcode camera"
          >
            ×
          </button>
        </div>

        <div className="mobile-barcode-video-shell">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
          />
          <div
            className="mobile-barcode-guide"
            aria-hidden="true"
          />
        </div>

        <div className="mobile-barcode-status">
          <strong>
            {scannerMode === "NATIVE"
              ? "Phone detector"
              : scannerMode === "ZXING"
                ? "Compatibility scanner"
                : "Camera"}
          </strong>
          <span>{message}</span>
        </div>

        <div className="button-row">
          {devices.length > 1 ? (
            <button
              type="button"
              className="secondary-button"
              onClick={switchCamera}
            >
              Switch Camera
            </button>
          ) : null}

          {torchSupported ? (
            <button
              type="button"
              className="secondary-button"
              onClick={toggleTorch}
            >
              {torchOn ? "Torch Off" : "Torch On"}
            </button>
          ) : null}

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setRestartToken((current) => current + 1)
            }
          >
            Retry Scanner
          </button>
        </div>

        <div className="mobile-barcode-manual">
          <input
            inputMode="numeric"
            autoComplete="off"
            value={manual}
            onChange={(event) =>
              setManual(event.target.value)
            }
            placeholder="Or type barcode"
          />
          <button
            type="button"
            className="secondary-button"
            onClick={useManual}
          >
            Use Barcode
          </button>
        </div>

        <div
          className="button-row"
          style={{ marginTop: 12 }}
        >
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
