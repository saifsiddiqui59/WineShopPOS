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

const NATIVE_TO_ZXING_MS = 3200;
const SCAN_INTERVAL_MS = 120;
const AUTO_ZOOM_TARGET = 1.25;

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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function zxingConstraints(deviceId = "") {
  return {
    audio: false,
    video: deviceId
      ? {
          deviceId: { exact: deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, min: 15 },
        }
      : {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, min: 15 },
        },
  };
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
  const zoomRangeRef = useRef(null);

  const [message, setMessage] = useState("");
  const [manual, setManual] = useState("");
  const [devices, setDevices] = useState([]);
  const [requestedDeviceId, setRequestedDeviceId] = useState("");
  const [activeDeviceId, setActiveDeviceId] = useState("");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoomValue, setZoomValue] = useState(1);
  const [scannerMode, setScannerMode] = useState("");
  const [restartToken, setRestartToken] = useState(0);

  useEffect(() => {
    detectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    let accepted = false;
    let actualDeviceId = requestedDeviceId || "";
    const reader = new BrowserMultiFormatReader();
    const roiCanvas = document.createElement("canvas");

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
      zoomRangeRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setTorchSupported(false);
      setTorchOn(false);
      setZoomSupported(false);
      setZoomValue(1);
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

    async function tuneTrack(stream, autoZoom = true) {
      const track = stream?.getVideoTracks?.()?.[0];
      if (!track) return;

      const settings = track.getSettings?.() || {};
      if (settings.deviceId) {
        actualDeviceId = settings.deviceId;
        setActiveDeviceId(settings.deviceId);
      }

      const capabilities = track.getCapabilities?.() || {};
      setTorchSupported(Boolean(capabilities.torch));

      if (
        Array.isArray(capabilities.focusMode) &&
        capabilities.focusMode.includes("continuous")
      ) {
        try {
          await track.applyConstraints({
            advanced: [{ focusMode: "continuous" }],
          });
        } catch {}
      }

      const zoom = capabilities.zoom;
      if (
        zoom &&
        Number.isFinite(Number(zoom.min)) &&
        Number.isFinite(Number(zoom.max)) &&
        Number(zoom.max) > Number(zoom.min)
      ) {
        const min = Number(zoom.min);
        const max = Number(zoom.max);
        const step =
          Number.isFinite(Number(zoom.step)) && Number(zoom.step) > 0
            ? Number(zoom.step)
            : 0.1;

        zoomRangeRef.current = { min, max, step };
        setZoomSupported(true);

        const current =
          Number.isFinite(Number(settings.zoom))
            ? Number(settings.zoom)
            : min;

        setZoomValue(current);

        if (autoZoom && max >= AUTO_ZOOM_TARGET && current < AUTO_ZOOM_TARGET) {
          const target = clamp(AUTO_ZOOM_TARGET, min, max);

          try {
            await track.applyConstraints({
              advanced: [{ zoom: target }],
            });
            setZoomValue(target);
          } catch {}
        }
      } else {
        zoomRangeRef.current = null;
        setZoomSupported(false);
      }
    }

    async function startZxing(deviceId = "") {
      if (cancelled || accepted) return;

      setScannerMode("ZXING");
      setMessage(
        "High-resolution scanner active. Hold the phone about 10–20 cm away and make the barcode fill the box.",
      );

      try {
        const controls = await reader.decodeFromConstraints(
          zxingConstraints(deviceId),
          videoRef.current,
          (result) => {
            if (result) {
              acceptCode(result.getText(), "ZXING_HIGH_RES");
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

        await tuneTrack(stream, true);
        await refreshDevices();

        window.setTimeout(() => {
          if (!cancelled && !accepted) {
            setMessage(
              "Still scanning… keep the entire barcode sharp inside the box. Try Zoom +, Torch, Switch Camera, or move slightly farther away.",
            );
          }
        }, 5000);
      } catch (highResError) {
        if (cancelled || accepted) return;

        try {
          const controls = await reader.decodeFromVideoDevice(
            deviceId || undefined,
            videoRef.current,
            (result) => {
              if (result) {
                acceptCode(result.getText(), "ZXING_DEVICE_FALLBACK");
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

          await tuneTrack(stream, false);
          await refreshDevices();

          setMessage(
            "Compatibility scanner active. Keep the barcode centered, flat and steady.",
          );
        } catch (fallbackError) {
          setMessage(
            `${fallbackError?.message || highResError?.message || "Camera barcode scanning is unavailable."} You can still type the barcode below.`,
          );
        }
      }
    }

    async function detectNativeFrame(detector) {
      const video = videoRef.current;

      if (
        !video ||
        video.readyState < 2 ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        return [];
      }

      try {
        const full = await detector.detect(video);
        if (Array.isArray(full) && full.some((item) => item?.rawValue)) {
          return full;
        }
      } catch {}

      try {
        const cropWidth = Math.floor(video.videoWidth * 0.9);
        const cropHeight = Math.floor(video.videoHeight * 0.5);
        const sx = Math.floor((video.videoWidth - cropWidth) / 2);
        const sy = Math.floor((video.videoHeight - cropHeight) / 2);

        const targetWidth = Math.min(1600, Math.max(900, cropWidth));
        const scale = targetWidth / cropWidth;

        roiCanvas.width = targetWidth;
        roiCanvas.height = Math.max(300, Math.round(cropHeight * scale));

        const context = roiCanvas.getContext("2d", {
          alpha: false,
          willReadFrequently: false,
        });

        if (!context) return [];

        context.drawImage(
          video,
          sx,
          sy,
          cropWidth,
          cropHeight,
          0,
          0,
          roiCanvas.width,
          roiCanvas.height,
        );

        const cropped = await detector.detect(roiCanvas);
        return Array.isArray(cropped) ? cropped : [];
      } catch {
        return [];
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
            frameRate: { ideal: 30, min: 15 },
          }
        : {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, min: 15 },
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

        await tuneTrack(stream, true);
        await refreshDevices();

        const detector = new window.BarcodeDetector({
          formats,
        });

        setScannerMode("NATIVE");
        setMessage(
          "Scanning… keep one barcode inside the box. Autofocus and close-up assist are active when supported.",
        );

        const detect = async () => {
          if (cancelled || accepted) return;

          const results = await detectNativeFrame(detector);
          const first = results?.find((item) => item?.rawValue);

          if (first?.rawValue) {
            acceptCode(first.rawValue, "NATIVE_BARCODE_DETECTOR");
            return;
          }

          if (!cancelled && !accepted) {
            scanLoopRef.current = window.setTimeout(
              detect,
              SCAN_INTERVAL_MS,
            );
          }
        };

        void detect();

        nativeTimerRef.current = window.setTimeout(
          async () => {
            if (cancelled || accepted) return;

            const fallbackDeviceId =
              actualDeviceId || requestedDeviceId || "";

            stopStream();

            setMessage(
              "Switching to high-resolution compatibility scanner…",
            );

            await startZxing(fallbackDeviceId);
          },
          NATIVE_TO_ZXING_MS,
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
      let preferredDeviceId = requestedDeviceId;

      if (!preferredDeviceId && list.length) {
        preferredDeviceId =
          preferredCamera(list)?.deviceId || "";
      }

      const nativeStarted =
        await startNativeDetector();

      if (!nativeStarted && !cancelled && !accepted) {
        await startZxing(preferredDeviceId);
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

  async function adjustZoom(direction) {
    const track =
      streamRef.current?.getVideoTracks?.()?.[0];

    const range = zoomRangeRef.current;

    if (!track || !range) {
      setMessage("Optical zoom is not available on this camera.");
      return;
    }

    const next = clamp(
      zoomValue + direction * Math.max(range.step, 0.2),
      range.min,
      range.max,
    );

    try {
      await track.applyConstraints({
        advanced: [{ zoom: next }],
      });

      setZoomValue(next);

      setMessage(
        `Camera zoom ${next.toFixed(1)}×. Keep the full barcode inside the box.`,
      );
    } catch (error) {
      setMessage(
        error?.message || "Could not change camera zoom.",
      );
    }
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
              Rear camera · high resolution · autofocus/zoom assist when supported ·
              native detector + ZXing fallback · no paid scanning service.
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

        <div className="mobile-barcode-video-shell mobile-barcode-video-shell-v17">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
          />

          <div
            className="mobile-barcode-guide mobile-barcode-guide-v17"
            aria-hidden="true"
          >
            <span className="mobile-barcode-scan-line" />
          </div>
        </div>

        <div className="mobile-barcode-status">
          <strong>
            {scannerMode === "NATIVE"
              ? "Fast phone detector"
              : scannerMode === "ZXING"
                ? "High-resolution scanner"
                : "Camera"}
          </strong>
          <span>{message}</span>
        </div>

        <div className="mobile-barcode-tip">
          <strong>For bottle/can barcodes</strong>
          <span>
            Hold the phone 10–20 cm away, avoid glare, and let the complete barcode
            fill the rectangle. Moving slightly farther away often focuses better.
          </span>
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

          {zoomSupported ? (
            <>
              <button
                type="button"
                className="secondary-button"
                onClick={() => void adjustZoom(-1)}
              >
                Zoom -
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => void adjustZoom(1)}
              >
                Zoom +
              </button>
            </>
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
