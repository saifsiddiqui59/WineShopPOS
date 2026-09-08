import { useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatOneDReader,
  BrowserMultiFormatReader,
} from "@zxing/browser";
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

const FRAME_INTERVAL_MS = 150;
const MULTI_FORMAT_EVERY = 6;
const CONTRAST_EVERY = 2;
const ROTATE_EVERY = 5;

function labelledRearCamera(devices) {
  const list = Array.isArray(devices) ? devices : [];
  return (
    list.find((device) =>
      /back|rear|environment|world|wide/i.test(String(device?.label || "")),
    ) || null
  );
}

function looksFrontFacing(label) {
  return /front|user|facetime|selfie/i.test(String(label || ""));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cameraConstraints(deviceId = "") {
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

function drawRoi(video, canvas, widthRatio, heightRatio, targetWidth) {
  if (!video?.videoWidth || !video?.videoHeight) {
    return false;
  }

  const sourceWidth = Math.max(
    100,
    Math.floor(video.videoWidth * widthRatio),
  );
  const sourceHeight = Math.max(
    80,
    Math.floor(video.videoHeight * heightRatio),
  );

  const sx = Math.floor((video.videoWidth - sourceWidth) / 2);
  const sy = Math.floor((video.videoHeight - sourceHeight) / 2);

  const finalWidth = Math.max(800, Math.min(targetWidth, sourceWidth * 2));
  const scale = finalWidth / sourceWidth;
  const finalHeight = Math.max(220, Math.round(sourceHeight * scale));

  canvas.width = finalWidth;
  canvas.height = finalHeight;

  const context = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
  });

  if (!context) return false;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    video,
    sx,
    sy,
    sourceWidth,
    sourceHeight,
    0,
    0,
    finalWidth,
    finalHeight,
  );

  return true;
}

function makeHighContrast(sourceCanvas, targetCanvas, invert = false) {
  targetCanvas.width = sourceCanvas.width;
  targetCanvas.height = sourceCanvas.height;

  const target = targetCanvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
  });

  if (!target) return false;

  target.drawImage(sourceCanvas, 0, 0);

  const image = target.getImageData(
    0,
    0,
    targetCanvas.width,
    targetCanvas.height,
  );

  const data = image.data;
  const contrast = 1.7;
  const intercept = 128 * (1 - contrast);

  for (let i = 0; i < data.length; i += 4) {
    const gray =
      data[i] * 0.299 +
      data[i + 1] * 0.587 +
      data[i + 2] * 0.114;

    let value = gray * contrast + intercept;
    value = clamp(value, 0, 255);

    if (invert) value = 255 - value;

    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  target.putImageData(image, 0, 0);
  return true;
}

function rotateCanvas90(sourceCanvas, targetCanvas) {
  targetCanvas.width = sourceCanvas.height;
  targetCanvas.height = sourceCanvas.width;

  const context = targetCanvas.getContext("2d", {
    alpha: false,
  });

  if (!context) return false;

  context.save();
  context.translate(targetCanvas.width, 0);
  context.rotate(Math.PI / 2);
  context.drawImage(sourceCanvas, 0, 0);
  context.restore();

  return true;
}

export default function MobileBarcodeScanner({
  open,
  title = "Scan Barcode",
  onClose,
  onDetected,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectedRef = useRef(onDetected);
  const scanTimerRef = useRef(null);
  const zoomRangeRef = useRef(null);

  const [message, setMessage] = useState("");
  const [manual, setManual] = useState("");
  const [devices, setDevices] = useState([]);
  const [requestedDeviceId, setRequestedDeviceId] = useState("");
  const [activeDeviceId, setActiveDeviceId] = useState("");
  const [activeCameraLabel, setActiveCameraLabel] = useState("");
  const [cameraResolution, setCameraResolution] = useState("");
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
    let frame = 0;

    const oneDReader = new BrowserMultiFormatOneDReader();
    const multiReader = new BrowserMultiFormatReader();

    const roiWide = document.createElement("canvas");
    const roiTight = document.createElement("canvas");
    const roiContrast = document.createElement("canvas");
    const roiInvert = document.createElement("canvas");
    const roiRotated = document.createElement("canvas");

    let nativeDetector = null;

    function stopScanner() {
      if (scanTimerRef.current) {
        window.clearTimeout(scanTimerRef.current);
        scanTimerRef.current = null;
      }

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
      stopScanner();

      const gtin = validateGtin(code);

      setMessage(
        gtin.recognized && !gtin.valid
          ? `Barcode ${code} recognised, but its GTIN check digit looks unusual. Review before saving.`
          : `Barcode ${code} recognised.`,
      );

      try {
        navigator.vibrate?.([70, 30, 70]);
      } catch {}

      detectedRef.current?.(code, {
        gtin,
        source,
      });
    }

    function decodeCanvas(reader, canvas, source) {
      try {
        const result = reader.decodeFromCanvas(canvas);
        const text = result?.getText?.();

        if (text) {
          acceptCode(text, source);
          return true;
        }
      } catch {}

      return false;
    }

    async function refreshDevices() {
      try {
        const list =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (!cancelled) {
          setDevices(list || []);
        }

        return list || [];
      } catch {
        return [];
      }
    }

    async function tuneTrack(stream) {
      const track = stream?.getVideoTracks?.()?.[0];
      if (!track) return;

      const settings = track.getSettings?.() || {};
      const capabilities = track.getCapabilities?.() || {};

      if (settings.deviceId) {
        setActiveDeviceId(settings.deviceId);
      }

      setActiveCameraLabel(track.label || "");
      setCameraResolution(
        settings.width && settings.height
          ? `${settings.width}×${settings.height}`
          : "",
      );

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
          Number.isFinite(Number(zoom.step)) &&
          Number(zoom.step) > 0
            ? Number(zoom.step)
            : 0.1;

        zoomRangeRef.current = { min, max, step };
        setZoomSupported(true);

        setZoomValue(
          Number.isFinite(Number(settings.zoom))
            ? Number(settings.zoom)
            : min,
        );
      } else {
        zoomRangeRef.current = null;
        setZoomSupported(false);
      }
    }

    async function openCamera(deviceId = "") {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          cameraConstraints(deviceId),
        );

      if (cancelled || accepted) {
        stream.getTracks().forEach((track) => track.stop());
        return null;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "");
      await videoRef.current.play();
      await tuneTrack(stream);

      return stream;
    }

    async function ensureRearCamera(initialStream) {
      if (requestedDeviceId) return initialStream;

      const list = await refreshDevices();
      const rear = labelledRearCamera(list);
      const track = initialStream?.getVideoTracks?.()?.[0];
      const currentId = track?.getSettings?.()?.deviceId || "";
      const currentLabel = track?.label || "";

      if (
        rear?.deviceId &&
        rear.deviceId !== currentId &&
        looksFrontFacing(currentLabel)
      ) {
        try {
          initialStream
            ?.getTracks?.()
            ?.forEach((currentTrack) => currentTrack.stop());

          streamRef.current = null;

          const rearStream = await openCamera(rear.deviceId);
          setRequestedDeviceId(rear.deviceId);
          return rearStream;
        } catch {}
      }

      return initialStream;
    }

    async function createNativeDetector() {
      if (!("BarcodeDetector" in window)) return null;

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

      if (!formats.length) return null;

      try {
        return new window.BarcodeDetector({ formats });
      } catch {
        return null;
      }
    }

    async function scanFrame() {
      if (
        cancelled ||
        accepted ||
        !videoRef.current
      ) {
        return;
      }

      const video = videoRef.current;

      if (
        video.readyState < 2 ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        scanTimerRef.current = window.setTimeout(
          scanFrame,
          FRAME_INTERVAL_MS,
        );
        return;
      }

      frame += 1;

      if (nativeDetector && frame % 2 === 1) {
        try {
          const nativeResults =
            await nativeDetector.detect(video);

          const nativeCode =
            nativeResults?.find((item) => item?.rawValue)?.rawValue;

          if (nativeCode) {
            acceptCode(
              nativeCode,
              "NATIVE_BARCODE_DETECTOR",
            );
            return;
          }
        } catch {}
      }

      const wideReady = drawRoi(
        video,
        roiWide,
        0.94,
        0.46,
        1280,
      );

      if (
        wideReady &&
        decodeCanvas(
          oneDReader,
          roiWide,
          "ZXING_1D_ROI_WIDE",
        )
      ) {
        return;
      }

      if (frame % 2 === 0) {
        const tightReady = drawRoi(
          video,
          roiTight,
          0.78,
          0.34,
          1280,
        );

        if (
          tightReady &&
          decodeCanvas(
            oneDReader,
            roiTight,
            "ZXING_1D_ROI_TIGHT",
          )
        ) {
          return;
        }
      }

      if (
        wideReady &&
        frame % CONTRAST_EVERY === 0 &&
        makeHighContrast(
          roiWide,
          roiContrast,
          false,
        ) &&
        decodeCanvas(
          oneDReader,
          roiContrast,
          "ZXING_1D_HIGH_CONTRAST",
        )
      ) {
        return;
      }

      if (
        wideReady &&
        frame % 4 === 0 &&
        makeHighContrast(
          roiWide,
          roiInvert,
          true,
        ) &&
        decodeCanvas(
          oneDReader,
          roiInvert,
          "ZXING_1D_INVERTED",
        )
      ) {
        return;
      }

      if (
        wideReady &&
        frame % ROTATE_EVERY === 0 &&
        rotateCanvas90(
          roiWide,
          roiRotated,
        ) &&
        decodeCanvas(
          oneDReader,
          roiRotated,
          "ZXING_1D_ROTATED",
        )
      ) {
        return;
      }

      if (
        wideReady &&
        frame % MULTI_FORMAT_EVERY === 0 &&
        decodeCanvas(
          multiReader,
          roiWide,
          "ZXING_MULTI_FORMAT_ROI",
        )
      ) {
        return;
      }

      if (!cancelled && !accepted) {
        scanTimerRef.current = window.setTimeout(
          scanFrame,
          FRAME_INTERVAL_MS,
        );
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

      try {
        setScannerMode("STARTING");
        setMessage("Opening rear camera…");

        let stream = await openCamera(
          requestedDeviceId || "",
        );

        stream = await ensureRearCamera(stream);

        if (!stream || cancelled || accepted) return;

        await refreshDevices();
        nativeDetector = await createNativeDetector();

        setScannerMode("ONE_D_ROI");
        setMessage(
          "1D product-barcode scanner active. Keep the complete barcode inside the rectangle and hold steady.",
        );

        void scanFrame();
      } catch (error) {
        if (cancelled || accepted) return;

        setScannerMode("ERROR");
        setMessage(
          `${error?.message || "Could not open barcode camera."} You can still type the barcode below.`,
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      stopScanner();
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
        `Camera zoom ${next.toFixed(1)}×. Keep the full barcode inside the rectangle.`,
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
              Dedicated 1D product-barcode decoder · rear camera preferred ·
              local ZXing/native processing · no paid scanning service.
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

        <div className="mobile-barcode-video-shell mobile-barcode-video-shell-v19">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
          />

          <div
            className="mobile-barcode-guide mobile-barcode-guide-v19"
            aria-hidden="true"
          >
            <span className="mobile-barcode-scan-line" />
          </div>
        </div>

        <div className="mobile-barcode-status">
          <strong>
            {scannerMode === "ONE_D_ROI"
              ? "1D Product Barcode Scanner"
              : scannerMode === "STARTING"
                ? "Opening camera"
                : scannerMode === "ERROR"
                  ? "Camera error"
                  : "Camera"}
          </strong>

          <span>{message}</span>

          <small className="mobile-barcode-camera-meta">
            {[
              activeCameraLabel || "Rear camera preferred",
              cameraResolution || null,
              zoomSupported
                ? `Zoom ${zoomValue.toFixed(1)}×`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </small>
        </div>

        <div className="mobile-barcode-tip">
          <strong>Best way to scan bottle/can barcode</strong>
          <span>
            Keep all black bars and the numbers visible inside the rectangle.
            Hold 10–20 cm away. If blurry, move slightly farther away before using Zoom +.
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
