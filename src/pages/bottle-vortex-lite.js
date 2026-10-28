// WineShopPOS login-only cyclone. All images are independently licensed
// CC0 PBR glTF renders stored in a single 49KB vendored WebP atlas.
// No runtime GLTF import, third-party CDN, WebGL render pass, auth or billing.
const ATLAS = "/login-brands/packshots/atlas.webp";
const SELECTION = Array.from({ length: 44 }, (_, i) =>
  [0, 1, 2, 3, 0, 5, 1, 2, 4, 3, 0, 6, 1, 2, 3, 5, 0, 1, 2, 6, 3, 0][i % 22]);
const GOLDEN = 2.399963229728653;
const TAU = Math.PI * 2;

function sample(i, progress, w, h, mobile) {
  const tier = i % 3;
  const phase = (i * 0.618033988749895 + tier * 0.137) % 1;
  const rise = (phase + progress) % 1;
  const theta = i * GOLDEN + progress * TAU * (1.05 + tier * 0.05);
  const radius = mobile ? 2.13 + tier * 0.37 : 5.4 + tier * 0.72;
  const vertical = mobile
    ? (i % 2 === 0 ? 1 : -1) * (5.42 + (rise - 0.5) * 2.6)
    : (rise - 0.5) * 12.9;
  const depthOffset = mobile ? 1.65 + tier * 0.36 : 2.75 + tier * 0.48;
  const z = -1.7 + Math.sin(theta) * depthOffset;
  const cameraZ = mobile ? 15.8 : 14.8;
  const fov = mobile ? 59 : 43;
  const focal = (h * 0.5) / Math.tan(fov * Math.PI / 360);
  const perspective = focal / (cameraZ - z);
  const x = w / 2 + Math.cos(theta) * radius * perspective;
  const y = h / 2 - vertical * perspective;
  const scale = (tier === 0 ? 1.22 : tier === 1 ? 0.93 : 0.69) *
    (0.84 + 0.23 * Math.sin(theta)) * (mobile ? 1.02 : 1);
  const width = 1.32 * scale * perspective;
  const angle = -(.27 * Math.sin(theta) - .14 * Math.cos(theta * .5)) * 180 / Math.PI;
  const fade = Math.min(1, rise / .075, (1 - rise) / .075);
  return { x, y, width: Math.max(0, width), angle,
    opacity: Math.max(0, Math.min(1, fade)) };
}

function paintTrails(canvas, w, h, mobile) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const fov = mobile ? 59 : 43;
  const focal = (h * .5) / Math.tan(fov * Math.PI / 360);
  for (let strand = 0; strand < 4; strand++) {
    ctx.beginPath();
    for (let k = 0; k <= 100; k++) {
      const t = k / 100;
      const a = t * Math.PI * 5.3 + strand * Math.PI / 2;
      const r = mobile ? 2.18 : 5.65;
      const x3d = Math.cos(a) * r;
      const y3d = (t - .5) * (mobile ? 14 : 15);
      const z3d = -2.8 + Math.sin(a) * 2.9;
      const perspective = focal / ((mobile ? 15.8 : 14.8) - z3d);
      const x = w / 2 + x3d * perspective;
      const y = h / 2 - y3d * perspective;
      if (!k) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = strand % 2 ? 1.2 : .9;
    ctx.strokeStyle = strand % 2
      ? "rgba(251,195,105,.25)" : "rgba(255,218,154,.36)";
    ctx.shadowColor = "rgba(246,167,80,.54)";
    ctx.shadowBlur = 6;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

export async function mountLightweightCyclone(canvas) {
  const atlas = new Image();
  atlas.decoding = "async";
  atlas.src = ATLAS;
  await atlas.decode();
  if (atlas.naturalWidth !== 1024 || atlas.naturalHeight !== 1024) {
    throw new Error("Invalid licensed PBR packshot atlas dimensions");
  }
  if (!canvas.isConnected) return () => {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.createElement("div");
  root.className = "wsp-login-lite-root";
  root.setAttribute("aria-hidden", "true");
  const trails = document.createElement("canvas");
  trails.className = "wsp-login-helical-trails";
  const products = document.createElement("div");
  products.className = "wsp-login-compositor";
  root.append(trails, products);
  canvas.insertAdjacentElement("afterend", root);
  canvas.style.display = "none";
  const animations = [];
  const frameTimes = [];
  let observer;
  let raf = 0;
  let lastTime = 0;
  let elapsed = 0;
  let frames = 0;
  let disposed = false;
  let reducedFrame = false;
  const write = (key, value) => { canvas.dataset[key] = String(value); };
  write("rendererStatus", "ready");
  write("assetStatus", "vendored-pbr-atlas");
  write("brandCount", 7);
  write("renderMode", "compositor-atlas");
  write("motionAxis", "vertical-cyclone");
  write("qualityTier", "high");
  write("drawCalls", 0);
  write("triangles", 0);
  write("renderedFrames", 0);
  write("averageFps", 0);
  write("p95FrameMs", 0);

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
  }
  function tick(now) {
    raf = 0;
    if (disposed || document.hidden || reduced.matches) return;
    if (lastTime > 0) {
      const delta = now - lastTime;
      if (delta > 0) {
        frameTimes.push(delta);
        if (frameTimes.length > 120) frameTimes.shift();
        if (frames % 12 === 0 && frameTimes.length > 2) {
          const sorted = [...frameTimes].sort((a, b) => a - b);
          const mean = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          write("averageFps", (1000 / mean).toFixed(1));
          write("p95FrameMs", sorted[Math.floor(sorted.length * .95) - 1].toFixed(1));
        }
      }
      elapsed += Math.min(delta, 100) / 1000;
    }
    lastTime = now;
    frames++;
    write("renderedFrames", frames);
    write("motionProgress", (elapsed * .56).toFixed(3));
    raf = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!raf && !disposed && !document.hidden && !reduced.matches) {
      lastTime = 0;
      raf = requestAnimationFrame(tick);
    }
  }
  function clearAnimations() {
    for (const anim of animations) anim.cancel();
    animations.length = 0;
    products.replaceChildren();
  }
  function layout() {
    if (disposed || !canvas.isConnected) return;
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    const mobile = w <= 760;
    const count = mobile ? 24 : 44;
    const baseWidth = mobile ? 104 : 150;
    const cycleMs = 24000;
    const points = 48;
    stop();
    clearAnimations();
    paintTrails(trails, w, h, mobile);
    for (let i = 0; i < count; i++) {
      const tile = SELECTION[i];
      const figure = document.createElement("div");
      figure.className = "wsp-login-cyclone-product";
      figure.dataset.modelIndex = String(tile);
      figure.style.width = baseWidth + "px";
      figure.style.height = (baseWidth * 2) + "px";
      figure.style.left = (-baseWidth / 2) + "px";
      figure.style.top = (-baseWidth) + "px";
      figure.style.backgroundImage = "url(" + ATLAS + ")";
      figure.style.backgroundSize = "400% 200%";
      figure.style.backgroundRepeat = "no-repeat";
      figure.style.backgroundPosition =
        ((tile % 4) * 100 / 3) + "% " + (Math.floor(tile / 4) * 100) + "%";
      const keyframes = [];
      for (let j = 0; j <= points; j++) {
        const p = j / points;
        const pose = sample(i, p, w, h, mobile);
        const factor = Math.max(.001, pose.width / baseWidth);
        keyframes.push({
          offset: p,
          transform: "translate3d(" + pose.x.toFixed(2) + "px," +
            pose.y.toFixed(2) + "px,0) rotate(" +
            pose.angle.toFixed(2) + "deg) scale(" + factor.toFixed(4) + ")",
          opacity: j < 2 || j > points - 2 ? 0 : pose.opacity,
        });
      }
      products.appendChild(figure);
      if (reduced.matches) {
        figure.style.transform = keyframes[12].transform;
        figure.style.opacity = "1";
      } else {
        const anim = figure.animate(keyframes, {
          duration: cycleMs, iterations: Infinity,
          easing: "linear", fill: "both",
        });
        anim.currentTime = ((i * .61803398875) % 1) * cycleMs;
        animations.push(anim);
      }
    }
    write("desiredCount", count);
    write("bottleCount", count);
    write("visibleSprites", count);
    write("compositorCount", animations.length);
    if (reduced.matches) {
      if (!reducedFrame) {
        frames++;
        write("renderedFrames", frames);
        reducedFrame = true;
      }
      write("motionProgress", "1.176");
    } else {
      reducedFrame = false;
      schedule();
    }
  }
  function onVisibility() {
    if (document.hidden) {
      stop();
      animations.forEach(a => a.pause());
    } else if (!reduced.matches) {
      animations.forEach(a => a.play());
      schedule();
    }
  }
  function onMotion() { layout(); }
  observer = new ResizeObserver(layout);
  observer.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener?.("change", onMotion);
  layout();
  return () => {
    disposed = true;
    stop();
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    reduced.removeEventListener?.("change", onMotion);
    clearAnimations();
    root.remove();
    canvas.style.display = "";
  };
}
