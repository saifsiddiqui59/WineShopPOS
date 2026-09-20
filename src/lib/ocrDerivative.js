const MAX_OUTPUT_DIMENSION = 1800;
const MAX_OUTPUT_PIXELS = 2_800_000;
const MAX_DERIVATIVE_BYTES = 950_000;

function clamp(value, min = 0, max = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function safeRegion(region) {
  if (!region) return null;
  const xMin = clamp(region.xMin);
  const xMax = clamp(region.xMax);
  const yMin = clamp(region.yMin);
  const yMax = clamp(region.yMax);
  if (xMax - xMin < 0.02 || yMax - yMin < 0.015) return null;
  return { xMin, xMax, yMin, yMax };
}

function relativeToDerivative(fieldRegion, derivativeRegion) {
  const field = safeRegion(fieldRegion);
  const derivative = safeRegion(derivativeRegion);
  if (!field || !derivative) return null;
  const width = Math.max(0.0001, derivative.xMax - derivative.xMin);
  const height = Math.max(0.0001, derivative.yMax - derivative.yMin);
  return {
    xMin: clamp((field.xMin - derivative.xMin) / width),
    xMax: clamp((field.xMax - derivative.xMin) / width),
    yMin: clamp((field.yMin - derivative.yMin) / height),
    yMax: clamp((field.yMax - derivative.yMin) / height),
  };
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error || new Error("Unable to encode OCR derivative"));
    reader.readAsDataURL(blob);
  });
}

function canvasBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Unable to create temporary OCR derivative"));
      else resolve(blob);
    }, "image/jpeg", quality);
  });
}

function sharpenCanvas(canvas) {
  if (canvas.width * canvas.height > MAX_OUTPUT_PIXELS) return;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;
  const source = context.getImageData(0, 0, canvas.width, canvas.height);
  const src = source.data;
  const copy = new Uint8ClampedArray(src);
  const width = canvas.width;
  const height = canvas.height;
  const channels = 4;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const center = (y * width + x) * channels;
      const left = center - channels;
      const right = center + channels;
      const up = center - width * channels;
      const down = center + width * channels;
      for (let c = 0; c < 3; c += 1) {
        copy[center + c] = Math.max(
          0,
          Math.min(255, 5 * src[center + c] - src[left + c] - src[right + c] - src[up + c] - src[down + c]),
        );
      }
    }
  }
  source.data.set(copy);
  context.putImageData(source, 0, 0);
}

export function canCreateAdaptiveOcrDerivative(file) {
  return Boolean(file && /^image\/(jpeg|jpg|png|webp)$/i.test(String(file.type || "")));
}

export async function createAdaptiveOcrDerivatives(file, rescueGroups = []) {
  if (!canCreateAdaptiveOcrDerivative(file) || !rescueGroups.length) return [];

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const output = [];
    for (const group of rescueGroups.slice(0, 6)) {
      const region = safeRegion(group?.region);
      if (!region || Number(group?.page || 1) !== 1) continue;

      const sourceWidth = bitmap.width;
      const sourceHeight = bitmap.height;
      const paddingX = Math.max(3, Math.round(sourceWidth * 0.015));
      const paddingY = Math.max(3, Math.round(sourceHeight * 0.012));
      const sx = Math.max(0, Math.floor(region.xMin * sourceWidth) - paddingX);
      const sy = Math.max(0, Math.floor(region.yMin * sourceHeight) - paddingY);
      const ex = Math.min(sourceWidth, Math.ceil(region.xMax * sourceWidth) + paddingX);
      const ey = Math.min(sourceHeight, Math.ceil(region.yMax * sourceHeight) + paddingY);
      const sw = Math.max(1, ex - sx);
      const sh = Math.max(1, ey - sy);

      const byDimension = MAX_OUTPUT_DIMENSION / Math.max(sw, sh);
      const byPixels = Math.sqrt(MAX_OUTPUT_PIXELS / Math.max(1, sw * sh));
      const scale = Math.max(1, Math.min(3, byDimension, byPixels));
      const width = Math.max(1, Math.round(sw * scale));
      const height = Math.max(1, Math.round(sh * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) continue;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.filter = "grayscale(1) contrast(1.45)";
      context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
      context.filter = "none";
      sharpenCanvas(canvas);

      let blob = await canvasBlob(canvas, 0.92);
      if (blob.size > MAX_DERIVATIVE_BYTES) blob = await canvasBlob(canvas, 0.78);
      if (blob.size > MAX_DERIVATIVE_BYTES * 1.35) continue;

      const derivativeRegion = {
        xMin: sx / sourceWidth,
        xMax: ex / sourceWidth,
        yMin: sy / sourceHeight,
        yMax: ey / sourceHeight,
      };
      output.push({
        groupId: group.groupId,
        group: {
          ...group,
          derivativeRegion,
          fields: (group.fields || []).map((field) => ({
            ...field,
            relativeRegion: relativeToDerivative(field.region, derivativeRegion),
          })),
        },
        contentType: "image/jpeg",
        contentBase64: await blobToBase64(blob),
        width,
        height,
        derivativeStored: false,
      });
    }
    return output;
  } finally {
    bitmap.close();
  }
}
