import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Login-only, decorative CC0 glTF showroom. Authentication never enters this module.
// Models are vendored by the asset-import workflow, not fetched from a third-party CDN.
const MANIFEST_URL = "/login-brands/models/manifest.json";
const GOLD = 0xe8b97c;
const MAX_DPR_DESKTOP = 1.25;
const MAX_DPR_MOBILE = 1;

function disposeObject(object, seen) {
  object.traverse((node) => {
    if (node.geometry && !seen.has(node.geometry)) {
      seen.add(node.geometry);
      node.geometry.dispose();
    }
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      if (!material || seen.has(material)) continue;
      seen.add(material);
      for (const value of Object.values(material)) {
        if (value?.isTexture && !seen.has(value)) {
          seen.add(value);
          value.dispose();
        }
      }
      material.dispose();
    }
  });
}

function normalizedModel(source, kind) {
  const copy = source.clone(true);
  const box = new THREE.Box3().setFromObject(copy);
  const dimensions = box.getSize(new THREE.Vector3());
  if (!Number.isFinite(dimensions.y) || dimensions.y <= 0.0001) {
    throw new Error("Invalid glTF model bounds: " + kind);
  }
  const scale = (kind === "can" ? 1.8 : 2.35) / dimensions.y;
  copy.scale.setScalar(scale);
  // Center the source mesh at the local origin, including models exported in meters.
  const midpoint = box.getCenter(new THREE.Vector3());
  copy.position.set(-midpoint.x * scale, -midpoint.y * scale, -midpoint.z * scale);
  copy.traverse((child) => {
    if (!child.isMesh) return;
    child.frustumCulled = true;
    child.castShadow = false;
    child.receiveShadow = false;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of materials) {
      if (mat?.isMeshStandardMaterial || mat?.isMeshPhysicalMaterial) {
        // GLTF KHR_materials_transmission adds a costly whole-scene prepass.
        // Retain real PBR maps, glass shape and environment reflections but
        // disable screen-space transmission in this many-instance decorative scene.
        const name = (mat.name || "").toLowerCase();
        // Transparent physical materials become pale, chalky white if the
        // transmission pass is removed without preserving an absorbent tint.
        // These saturated, PBR-lit tones mimic dark green/burgundy/amber glass
        // and avoid opaque white cut-outs in the cinematic background.
        const bottleTints = [
          ["glass_green", "#0b291b"],
          ["glass_yellow", "#2b2711"],
          ["glass_orange", "#412014"],
          ["glass_clear", "#39463a"],
          ["wine_light_red", "#441b24"],
          ["wine_red", "#280d17"],
          ["wine_clear", "#51401e"],
        ];
        const tinted = bottleTints.find(([prefix]) => name.includes(prefix));
        if (tinted) {
          mat.color.set(tinted[1]);
          mat.metalness = 0.11;
          mat.roughness = 0.17;
          if (mat.isMeshPhysicalMaterial) {
            mat.clearcoat = 0.9;
            mat.clearcoatRoughness = 0.11;
          }
        } else if (!mat.map && kind !== "can" && !/label|paper|seal|cap/.test(name)) {
          mat.color.set(kind === "beer" ? "#6c3616" : "#1e3223");
          mat.metalness = 0.08;
          mat.roughness = 0.22;
        }
        mat.transmission = 0;
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
        mat.side = THREE.FrontSide;
        mat.envMapIntensity = tinted ? 3.0 : 1.75;
        mat.needsUpdate = true;
      }
    }
  });
  return copy;
}


// Self-created generic branding: never imitates a manufacturer's trademark.
function bespokeLabel(kind, sourceModel) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const c = canvas.getContext("2d");
  const can = kind === "can";
  const g = c.createLinearGradient(0, 0, 512, 384);
  g.addColorStop(0, can ? "#49121a" : "#f6e8cb");
  g.addColorStop(0.48, can ? "#8c2436" : "#ddc6a0");
  g.addColorStop(1, can ? "#270f1e" : "#fcf1dc");
  c.fillStyle = g;
  c.fillRect(0, 0, 512, 384);
  c.strokeStyle = can ? "#d5a95b" : "#9c713c";
  c.lineWidth = 14;
  c.strokeRect(16, 16, 480, 352);
  c.lineWidth = 2;
  c.strokeRect(36, 35, 440, 314);
  const ink = can ? "#fff1d2" : "#3f2220";
  c.textAlign = "center";
  c.fillStyle = ink;
  c.font = "24px Georgia, serif";
  c.fillText("EST. 1926  •  PRIVATE SELECTION", 256, 88);
  c.font = "bold 66px Georgia, serif";
  c.fillText(can ? "GOLDEN" : kind === "beer" ? "AMBER" : "MERIDIAN", 256, 177);
  c.font = "bold 44px Georgia, serif";
  c.fillText(can ? "CASK" : kind === "beer" ? "LAGER" : "CELLARS", 256, 230);
  c.font = "22px Georgia, serif";
  c.fillText(can ? "PREMIUM MALT" : kind === "beer" ? "SMALL BATCH" : "VINTAGE RESERVE", 256, 285);
  c.font = "20px Georgia, serif";
  c.fillText("ORIGINAL COLLECTION", 256, 326);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  // Fit the paper wrap OUTSIDE the actual GLB surface, not inside a generic
  // assumed radius (which previously hid the labels behind opaque cans).
  const bounds = new THREE.Box3().setFromObject(sourceModel);
  const dims = bounds.getSize(new THREE.Vector3());
  const radius = Math.max(dims.x, dims.z) * 0.51 + 0.016;
  const paperHeight = dims.y * (can ? 0.64 : 0.32);
  const geometry = new THREE.CylinderGeometry(radius, radius, paperHeight,
    64, 1, true, -Math.PI, Math.PI * 2);
  const material = new THREE.MeshStandardMaterial({
    map, roughness: 0.68, metalness: can ? 0.15 : 0.03,
    side: THREE.DoubleSide, depthWrite: true,
  });
  const wrap = new THREE.Mesh(geometry, material);
  wrap.position.y = can ? 0 : -dims.y * 0.13;
  return wrap;
}

export function mountBottleVortex(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: false, depth: true,
      powerPreference: "high-performance", preserveDrawingBuffer: false,
    });
  } catch (error) {
    canvas.dataset.rendererStatus = "unsupported";
    console.warn("WineShopPOS 3D unavailable:", error.message);
    return () => {};
  }

  // Full-screen, low-cost amber-gold light tunnel. This is only atmospheric
  // lighting behind genuine textured glTF geometry, never flat product images.
  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.Camera();
  const bgUniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  };
  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      depthTest: false,
      depthWrite: false,
      vertexShader: `
        void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: `
        precision mediump float;
        uniform float uTime;
        uniform vec2 uResolution;
        void main() {
          vec2 q = (gl_FragCoord.xy - uResolution * 0.5) / max(1.0, uResolution.y);
          float rad = length(q * vec2(1.0, 1.23));
          float theta = atan(q.y, q.x);
          float spiral = sin(rad * 38.0 - theta * 1.5 - uTime * 0.36);
          float arc = max(0.0, spiral) * max(0.0, spiral);
          float glow = 1.0 - smoothstep(0.1, 0.79, rad);
          vec3 color = mix(vec3(0.026, 0.006, 0.013),
            vec3(0.105, 0.031, 0.034), glow);
          color += vec3(0.30, 0.115, 0.026) * arc *
            smoothstep(0.10, 0.23, rad) * (1.0 - smoothstep(0.48, 0.94, rad));
          color += vec3(0.105, 0.045, 0.018) * glow * glow;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  );
  background.frustumCulled = false;
  bgScene.add(background);

  const stage = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 90);
  camera.position.set(0, 0, 13.3);
  camera.lookAt(0, 0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.07;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const envMap = pmrem.fromScene(environment, 0.035).texture;
  stage.environment = envMap;
  stage.add(new THREE.HemisphereLight(0xffdfc2, 0x1c101a, 1.25));
  function spotlight(color, intensity, x, y, z) {
    const light = new THREE.PointLight(color, intensity, 24, 2);
    light.position.set(x, y, z);
    stage.add(light);
  }
  spotlight(0xffbd7e, 98, -6, 4.6, 7);
  spotlight(0xffe2bf, 84, 6, 1.8, 7);
  spotlight(0xcf3459, 58, 1.0, -4.5, -2);
  spotlight(0xb5a5c9, 40, -1.6, 2.7, -6);

  // Layered golden perspective rings, like a luminous photographic tunnel.
  // Geometry is behind the card; no full-screen bloom postprocessing needed.
  // Fast physical-depth concentric gold arcs, not flat SVG sticker layers.
  // A thin bright ring and a wider glow ring share the same world depth.
  // Actual upright cyclone light trails. Each ribbon is a 3D helix around
  // the screen-vertical Y axis rather than a flat ring in the XY plane.
  const halos = [];
  const helixGroup = new THREE.Group();
  stage.add(helixGroup);
  for (let strand = 0; strand < 3; strand++) {
    const samples = [];
    for (let k = 0; k <= 96; k++) {
      const h = k / 96;
      const phase = h * Math.PI * 5.3 + strand * (Math.PI * 2 / 3);
      const radius = 5.7 + 0.9 * Math.sin(h * Math.PI);
      samples.push(new THREE.Vector3(
        Math.cos(phase) * radius,
        (h - 0.5) * 15.0,
        -2.7 + Math.sin(phase) * 3.1
      ));
    }
    const curve = new THREE.CatmullRomCurve3(samples, false, "centripetal");
    for (let glow = 0; glow < 2; glow++) {
      const tube = new THREE.TubeGeometry(curve, 80, glow ? 0.075 : 0.014, 4, false);
      const material = new THREE.MeshBasicMaterial({
        color: strand % 2 ? 0xffc079 : 0xffdf9b,
        transparent: true, depthWrite: false,
        opacity: glow ? 0.052 : 0.28,
        blending: THREE.AdditiveBlending,
      });
      const ribbon = new THREE.Mesh(tube, material);
      ribbon.frustumCulled = false;
      helixGroup.add(ribbon);
      halos.push(ribbon);
    }
  }
  const particlePositions = new Float32Array(540 * 3);
  for (let i = 0; i < 540; i++) {
    const a = i * 2.399963229728653;
    const radius = 2.2 + ((i * 47) % 107) / 107 * 6.5;
    particlePositions[i * 3] = Math.cos(a) * radius;
    particlePositions[i * 3 + 1] = Math.sin(a) * radius * 0.63;
    particlePositions[i * 3 + 2] = -2 - (i % 7) * 1.2;
  }
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({
    color: 0xffd39a, size: 0.058, transparent: true, opacity: 0.77,
    depthWrite: false, sizeAttenuation: true,
  }));
  stage.add(particles);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sourceModels = [];
  const bakedTargets = [];
  const bakedImages = [];
  const spriteOverlay = document.createElement("canvas");
  spriteOverlay.className = "wsp-login-sprite-layer";
  spriteOverlay.setAttribute("aria-hidden", "true");
  canvas.insertAdjacentElement("afterend", spriteOverlay);
  const spriteCtx = spriteOverlay.getContext("2d", { alpha: true, desynchronized: true });
  const trailsCanvas = document.createElement("canvas");
  trailsCanvas.className = "wsp-login-helical-trails";
  canvas.insertAdjacentElement("afterend", trailsCanvas);
  const trailCtx = trailsCanvas.getContext("2d");
  const compositor = document.createElement("div");
  compositor.className = "wsp-login-compositor";
  trailsCanvas.insertAdjacentElement("afterend", compositor);
  const animations = [];
  const sourceUrls = [];
  let useCompositor = false;
  const screenPoint = new THREE.Vector3();
  const drawItems = [];
  let useCanvas2d = false;
  let viewportWidth = 1;
  let viewportHeight = 1;
  const trailPoint = new THREE.Vector3();

  function paintVerticalTrails() {
    if (!trailCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.3);
    trailsCanvas.width = Math.max(1, Math.round(viewportWidth * dpr));
    trailsCanvas.height = Math.max(1, Math.round(viewportHeight * dpr));
    trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    trailCtx.clearRect(0, 0, viewportWidth, viewportHeight);
    const radius = isMobile ? 2.25 : 5.8;
    for (let strand = 0; strand < 4; strand++) {
      trailCtx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const h = i / 120;
        const a = h * Math.PI * 5.3 + strand * Math.PI / 2;
        trailPoint.set(Math.cos(a) * radius, (h - 0.5) * (isMobile ? 14 : 15),
          -3.0 + Math.sin(a) * 3);
        trailPoint.project(camera);
        const x = (trailPoint.x + 1) * viewportWidth * 0.5;
        const y = (1 - trailPoint.y) * viewportHeight * 0.5;
        if (i === 0) trailCtx.moveTo(x, y);
        else trailCtx.lineTo(x, y);
      }
      trailCtx.lineWidth = strand % 2 ? 1.8 : 1.15;
      trailCtx.strokeStyle = strand % 2
        ? "rgba(247,193,111,0.26)" : "rgba(255,217,162,0.36)";
      trailCtx.shadowColor = "rgba(245,157,65,0.62)";
      trailCtx.shadowBlur = 11;
      trailCtx.stroke();
    }
    trailCtx.shadowBlur = 0;
  }

  function stopCompositor() {
    animations.forEach(animation => animation.cancel());
    animations.length = 0;
    compositor.replaceChildren();
  }

  function buildCompositor() {
    if (!useCompositor || disposed) return;
    stopCompositor();
    const cycleMs = 24000;
    const sampleCount = 48;
    const focal = viewportHeight * 0.5 /
      Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5);
    const baseWidth = isMobile ? 104 : 150;
    const baseHeight = baseWidth * 2;
    for (let i = 0; i < activeCount; i++) {
      const img = document.createElement("img");
      img.src = sourceUrls[selection[i]];
      img.alt = "";
      img.draggable = false;
      img.className = "wsp-login-cyclone-product";
      img.style.width = baseWidth + "px";
      img.style.height = baseHeight + "px";
      img.style.left = (-baseWidth / 2) + "px";
      img.style.top = (-baseHeight / 2) + "px";
      const keyframes = [];
      for (let j = 0; j <= sampleCount; j++) {
        const t = 24 * j / sampleCount;
        pose(i, t);
        trailPoint.copy(position).project(camera);
        const depth = Math.max(0.5, camera.position.z - position.z);
        const projectedWidth = 1.32 * scale.x * focal / depth;
        const x = (trailPoint.x + 1) * viewportWidth * 0.5;
        const y = (1 - trailPoint.y) * viewportHeight * 0.5;
        const factor = Math.max(0.001, projectedWidth / baseWidth);
        keyframes.push({
          offset: j / sampleCount,
          transform: `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${(-rotation.z * 180 / Math.PI).toFixed(2)}deg) scale(${factor.toFixed(4)})`,
          opacity: j < 2 || j > sampleCount - 2 ? 0 : 1,
        });
      }
      compositor.appendChild(img);
      if (reduced.matches) {
        img.style.transform = keyframes[12].transform;
        img.style.opacity = "1";
      } else {
        const animation = img.animate(keyframes, {
          duration: cycleMs, iterations: Infinity, easing: "linear", fill: "both",
        });
        animation.currentTime = (i * 0.61803398875 % 1) * cycleMs;
        animations.push(animation);
      }
    }
    canvas.dataset.visibleSprites = String(activeCount);
    canvas.dataset.compositorCount = String(animations.length);
  }

  // Slow or software GPU paths animate images baked from the actual
  // licensed PBR glTF, not generic procedural cylinders or fake asset URLs.
  // All visible product instances are simple textured planes, while their
  // world-space paths retain the full X/Y/Z perspective cyclone.
  const bakeScene = new THREE.Scene();
  bakeScene.environment = envMap;
  bakeScene.add(new THREE.HemisphereLight(0xffe5ce, 0x27202a, 1.75));
  const frontKey = new THREE.DirectionalLight(0xffebd2, 4.2);
  frontKey.position.set(-3, 5, 7);
  bakeScene.add(frontKey);
  const rimKey = new THREE.DirectionalLight(0xf7ad65, 3);
  rimKey.position.set(3, -1, -1);
  bakeScene.add(rimKey);
  const bakeCamera = new THREE.PerspectiveCamera(30, 0.5, 0.1, 50);
  bakeCamera.position.set(0, 0, 5.7);
  bakeCamera.lookAt(0, 0, 0);
  const bakeClear = new THREE.Color();

  // Once per licensed source model, render a sharp, alpha-transparent
  // studio packshot into a GPU texture. It is re-used by all 44/24 bottles.
  function bakePackshot(source, kind, label) {
    const target = new THREE.WebGLRenderTarget(384, 768, {
      format: THREE.RGBAFormat, depthBuffer: true,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      generateMipmaps: true,
    });
    target.texture.colorSpace = THREE.SRGBColorSpace;
    bakedTargets.push(target);
    const rig = new THREE.Group();
    rig.add(source.clone(true));
    if (label) rig.add(label.clone());
    bakeScene.add(rig);
    const previousTarget = renderer.getRenderTarget();
    renderer.getClearColor(bakeClear);
    const previousAlpha = renderer.getClearAlpha();
    const previousAutoClear = renderer.autoClear;
    renderer.autoClear = true;
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear(true, true, true);
    renderer.render(bakeScene, bakeCamera);
    const pixels = new Uint8Array(384 * 768 * 4);
    renderer.readRenderTargetPixels(target, 0, 0, 384, 768, pixels);
    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = 384;
    imageCanvas.height = 768;
    const context = imageCanvas.getContext("2d");
    if (!context) throw new Error("Packshot baking requires a 2D canvas");
    const imageData = context.createImageData(384, 768);
    const rowBytes = 384 * 4;
    for (let y = 0; y < 768; y++) {
      imageData.data.set(
        pixels.subarray((767 - y) * rowBytes, (768 - y) * rowBytes),
        y * rowBytes
      );
    }
    context.putImageData(imageData, 0, 0);
    renderer.setRenderTarget(previousTarget);
    renderer.setClearColor(bakeClear, previousAlpha);
    renderer.autoClear = previousAutoClear;
    bakeScene.remove(rig);
    return { texture: target.texture, image: imageCanvas };
  }
  const pools = [];
  const labelCache = new Map();
  const frameTimes = [];
  const clock = new THREE.Clock();
  const matrix = new THREE.Matrix4();
  const composed = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const rotation = new THREE.Euler(0, 0, 0, "YXZ");
  const quaternion = new THREE.Quaternion();
  // 4 phototextured Poly Haven bottles, 3 distinct CC0 beer/can/wine props.
  // Keep wine dominant; avoid multiplying 20 low-fidelity product designs.
  // Four CC0 wine silhouettes dominate, while beer/cans punctuate the flow.
  // Forty-four source instances reuse GLB mesh/material buffers through instancing.
  const selection = Array.from({ length: 44 }, (_, i) =>
    [0, 1, 2, 3, 0, 5, 1, 2, 4, 3, 0, 6, 1, 2, 3, 5, 0, 1, 2, 6, 3, 0][i % 22]);
  const poses = Array.from({ length: selection.length }, () => new THREE.Matrix4());
  const desiredCount = { desktop: selection.length, mobile: 24 };
  let qualityTier = "high";
  let qualityDpr = 1;
  let disposed = false, raf = 0, frames = 0, isMobile = false, elapsed = 0;
  let lastFrame = 0;
  let activeCount = 0;
  canvas.dataset.rendererStatus = "loading";
  canvas.dataset.assetStatus = "loading";
  canvas.dataset.renderedFrames = "0";
  canvas.dataset.averageFps = "0";
  canvas.dataset.p95FrameMs = "0";
  canvas.dataset.drawCalls = "0";
  canvas.dataset.triangles = "0";

  function setQuality(tier) {
    if (tier === qualityTier) return;
    qualityTier = tier;
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    qualityDpr = tier === "low" ? 0.62 : tier === "medium" ? 0.79 : 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
      isMobile ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP) * qualityDpr);
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(bgUniforms.uResolution.value);
    activeCount = tier === "low" ? (isMobile ? 18 : 29)
      : tier === "medium" ? (isMobile ? 21 : 36)
      : desiredCount[isMobile ? "mobile" : "desktop"];
    canvas.dataset.qualityTier = tier;
    canvas.dataset.bottleCount = String(pools.length ? activeCount : 0);
  }

  function resize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    isMobile = w <= 760;
    viewportWidth = w;
    viewportHeight = h;
    const spriteDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    spriteOverlay.width = Math.max(1, Math.round(w * spriteDpr));
    spriteOverlay.height = Math.max(1, Math.round(h * spriteDpr));
    if (spriteCtx) spriteCtx.setTransform(spriteDpr, 0, 0, spriteDpr, 0, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
      isMobile ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP) * qualityDpr);
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(bgUniforms.uResolution.value);
    bgUniforms.uAspect.value = w / h;
    camera.aspect = w / h;
    camera.position.z = isMobile ? 15.8 : 14.8;
    camera.fov = isMobile ? 59 : 43;
    camera.updateProjectionMatrix();
    if ((useCanvas2d || useCompositor) && canvas.dataset.rendererStatus === "ready") {
      paintVerticalTrails();
      if (useCanvas2d) drawWebGLBackdrop(2.1);
      if (useCompositor) buildCompositor();
    }
    helixGroup.scale.set(isMobile ? 0.43 : 1, isMobile ? 1.05 : 1, isMobile ? 0.72 : 1);
    activeCount = qualityTier === "low" ? (isMobile ? 18 : 29)
      : qualityTier === "medium" ? (isMobile ? 21 : 36)
      : desiredCount[isMobile ? "mobile" : "desktop"];
    canvas.dataset.desiredCount = String(desiredCount[isMobile ? "mobile" : "desktop"]);
    canvas.dataset.bottleCount = String(pools.length ? activeCount : 0);
    canvas.dataset.qualityTier = qualityTier;
    if (reduced.matches && canvas.dataset.rendererStatus === "ready") renderFrame(2.1);
  }

  // Vertical cyclone: Y is the screen-up spine; each bottle orbits in the X/Z
  // depth plane. Local Z rotation makes the product bank into the airflow.
  // This differs from the rejected flat XY carousel / central clock-face orbit.
  // Slot heights repeat modulo 1; size fades to zero at each boundary so
  // re-entry from bottom is invisible, avoiding hard position jumps.
  function pose(index, t) {
    const tier = index % 3;
    const phase = (index * 0.618033988749895 + tier * 0.137) % 1;
    const speed = 0.036 + tier * 0.004;
    const rise = (phase + t * speed) % 1;
    const fade = Math.min(1, rise / 0.095, (1 - rise) / 0.095);
    const angle = index * 2.399963229728653 + t * (0.56 + tier * 0.045);
    // Widen the screen-filling cyclone: foreground large, rear layer small.
    const radius = isMobile ? (2.18 + tier * 0.36) : (5.5 + tier * 0.91);
    const height = isMobile ? 16.2 : 12.6;
    const depth = isMobile
      ? -1.9 + Math.sin(angle) * (1.7 + tier * 0.3)
      : -1.6 + Math.sin(angle) * (2.7 + tier * 0.65);
    // On a phone the login card spans almost the entire width. The same
    // helix passes *behind* the form, but visible strands are composed into
    // the bands above and below it to avoid an apparently empty backdrop.
    const strandY = isMobile
      ? (index % 2 === 0 ? 1 : -1) * (5.42 + (rise - 0.5) * 2.4)
      : (rise - 0.5) * height + 0.16 * Math.sin(angle * 0.65);
    position.set(Math.cos(angle) * radius, strandY, depth);
    const perspective = 0.84 + 0.23 * Math.sin(angle);
    const baseScale = tier === 0 ? 1.25 : tier === 1 ? 0.93 : 0.68;
    scale.setScalar(Math.max(0.0001,
      baseScale * perspective * (isMobile ? 1.06 : 1) * Math.max(0, fade)));
    rotation.set(
      0.045 * Math.cos(angle),
      0.075 * Math.sin(angle * 0.65),
      // Z-axis rolling tilt follows the swirling air, not a carousel spin.
      0.27 * Math.sin(angle) - 0.14 * Math.cos(angle * 0.5)
    );
    quaternion.setFromEuler(rotation);
    return matrix.compose(position, quaternion, scale);
  }

  function drawPackshots2d(t) {
    if (!spriteCtx) return;
    const w = viewportWidth;
    const h = viewportHeight;
    spriteCtx.clearRect(0, 0, w, h);
    drawItems.length = 0;
    const focal = h * 0.5 / Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5);
    for (let i = 0; i < activeCount; i++) {
      pose(i, t);
      // perspective projection from the same camera as the original 3D helix.
      screenPoint.copy(position).project(camera);
      const depth = Math.max(0.5, camera.position.z - position.z);
      const apparentHeight = 2.92 * scale.y * focal / depth;
      const apparentWidth = 1.32 * scale.x * focal / depth;
      const x = (screenPoint.x + 1) * w * 0.5;
      const y = (1 - screenPoint.y) * h * 0.5;
      if (apparentHeight < 2 || x < -apparentWidth || x > w + apparentWidth ||
          y < -apparentHeight || y > h + apparentHeight) continue;
      drawItems.push({ x, y, depth, width: apparentWidth,
        height: apparentHeight, tilt: rotation.z, image: bakedImages[selection[i]] });
    }
    // Distant objects are drawn behind foreground bottles.
    drawItems.sort((a, b) => b.depth - a.depth);
    spriteCtx.imageSmoothingEnabled = true;
    spriteCtx.imageSmoothingQuality = "high";
    for (const item of drawItems) {
      if (!item.image) continue;
      spriteCtx.save();
      spriteCtx.translate(item.x, item.y);
      spriteCtx.rotate(-item.tilt);
      spriteCtx.drawImage(item.image, -item.width / 2, -item.height / 2,
        item.width, item.height);
      spriteCtx.restore();
    }
    canvas.dataset.visibleSprites = String(drawItems.length);
  }

  function drawWebGLBackdrop(t) {
    bgUniforms.uTime.value = t;
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(bgScene, bgCamera);
    renderer.clearDepth();
    renderer.render(stage, camera);
    renderer.autoClear = true;
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
  }

  function renderFrame(t) {
    if (disposed || renderer.getContext().isContextLost()) return;
    if (useCompositor) {
      frames++;
      canvas.dataset.renderedFrames = String(frames);
      canvas.dataset.motionAxis = "vertical-cyclone";
      canvas.dataset.motionProgress = (t * 0.56).toFixed(3);
      return;
    }
    if (useCanvas2d) {
      drawPackshots2d(t);
      frames++;
      canvas.dataset.renderedFrames = String(frames);
      canvas.dataset.motionAxis = "vertical-cyclone";
      canvas.dataset.motionProgress = (t * 0.56).toFixed(3);
      return;
    }
    // Each source mesh is rendered once as an InstancedMesh; repeated
    // physical materials, texture maps and geometry share GPU memory.
    for (let i = 0; i < activeCount; i++) poses[i].copy(pose(i, t));
    for (const pool of pools) {
      let slot = 0;
      for (const index of pool.indices) {
        if (index >= activeCount) continue;
        for (const part of pool.parts) {
          composed.multiplyMatrices(poses[index], part.localMatrix);
          part.mesh.setMatrixAt(slot, composed);
        }
        slot++;
      }
      for (const part of pool.parts) {
        part.mesh.count = slot;
        if (slot) part.mesh.instanceMatrix.needsUpdate = true;
      }
    }
    helixGroup.rotation.y = t * 0.16;
    helixGroup.rotation.z = 0.04 * Math.sin(t * 0.22);
    particles.rotation.z = -t * 0.012;
    bgUniforms.uTime.value = t;
    drawWebGLBackdrop(t);
    frames++;
    canvas.dataset.renderedFrames = String(frames);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.renderMode ||= "loading";
    canvas.dataset.triangles = String(renderer.info.render.triangles);
    canvas.dataset.motionAxis = "vertical-cyclone";
    canvas.dataset.motionProgress = (t * 0.56).toFixed(3);
  }

  function animate(now) {
    raf = 0;
    if (disposed || document.hidden || reduced.matches ||
        !["loading", "ready"].includes(canvas.dataset.rendererStatus)) return;
    if (lastFrame > 0) {
      const dt = now - lastFrame;
      if (dt > 0) {
        frameTimes.push(dt);
        if (frameTimes.length > 180) frameTimes.shift();
        // Only sample metrics periodically. Sorting on every frame induces
        // avoidable JS garbage collection and additional animation stutter.
        if (frameTimes.length >= 2 && frames % 8 === 0) {
          const sorted = [...frameTimes].sort((a, b) => a - b);
          const mean = frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length;
          const fps = 1000 / mean;
          canvas.dataset.averageFps = fps.toFixed(1);
          canvas.dataset.p95FrameMs = sorted[Math.floor(0.95 * (sorted.length - 1))].toFixed(1);
          // Trim GPU overdraw on weak mobile and software renderers, preserving
          // 44 / 24 bottle abundance for capable browsers.
          // Compositor-owned WAAPI transforms are independent of JS canvas
          // paints. Never cull bottles merely because headless CI rAF is slow.
          if (!useCompositor && frames > 6 && fps < 18 && qualityTier === "high") setQuality("medium");
          if (!useCompositor && frames > 14 && fps < 10 && qualityTier === "medium") setQuality("low");
        }
      }
    }
    lastFrame = now;
    elapsed += clock.getDelta();
    renderFrame(elapsed);
    raf = window.requestAnimationFrame(animate);
  }
  function schedule() {
    if (!raf && !disposed && !document.hidden && !reduced.matches &&
        ["loading", "ready"].includes(canvas.dataset.rendererStatus)) {
      clock.getDelta();
      lastFrame = 0;
      raf = window.requestAnimationFrame(animate);
    }
  }
  function stop() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    lastFrame = 0;
  }
  function onVisibility() {
    if (document.hidden) {
      stop();
      animations.forEach(animation => animation.pause());
    } else if (reduced.matches) renderFrame(2.1);
    else {
      animations.forEach(animation => animation.play());
      schedule();
    }
  }
  function onMotion() {
    if (reduced.matches) { stop(); buildCompositor(); renderFrame(2.1); }
    else { buildCompositor(); schedule(); }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener?.("change", onMotion);
  const contextLost = (event) => {
    event.preventDefault();
    stop();
    canvas.dataset.rendererStatus = "unsupported";
  };
  canvas.addEventListener("webglcontextlost", contextLost);
  resize();
  // Draw the complete light tunnel immediately while glTF fetch/parse occurs.
  // The UI must not be a blank stage for the first seconds of the recording.
  renderFrame(reduced.matches ? 2.1 : 0);
  schedule();

  const loader = new GLTFLoader();
  async function loadAssets() {
    try {
      const response = await fetch(MANIFEST_URL, { cache: "force-cache" });
      if (!response.ok) throw new Error("Model manifest missing: " + response.status);
      const manifest = await response.json();
      if (!Array.isArray(manifest.models) || manifest.models.length < 2)
        throw new Error("Expected wine and beer glTF models");
      const loaded = (await Promise.all(manifest.models.map(async (spec) => {
        if (!spec.path?.startsWith("/login-brands/models/"))
          throw new Error("Model path outside vendored library");
        const gltf = await loader.loadAsync(spec.path);
        // Poly Haven's original glTF has four separate, fully textured bottle nodes.
        // Move these bottles individually rather than orbiting a rigid four-pack.
        const roots = spec.name.startsWith("Poly Haven")
          ? gltf.scene.children.filter((child) => {
              let hasMesh = false;
              child.traverse((node) => { if (node.isMesh) hasMesh = true; });
              return hasMesh;
            })
          : [gltf.scene];
        if (!roots.length) throw new Error("No mesh nodes for " + spec.name);
        return roots.map((root, index) => ({
          spec, source: normalizedModel(root, spec.kind), assetIndex: index,
        }));
      }))).flat();
      if (disposed) {
        for (const entry of loaded) sourceModels.push(entry.source);
        return;
      }
      loaded.forEach((entry) => sourceModels.push(entry.source));
      if (loaded.length !== 7) throw new Error("Expected 4 Poly Haven + 3 additional CC0 models");
      // Suspend the competing animated render during short texture-bake passes.
      // Loading state keeps the golden tunnel alive until the new bottles arrive.
      stop();
      for (let sourceIndex = 0; sourceIndex < loaded.length; sourceIndex++) {
        const entry = loaded[sourceIndex];
        const indices = selection.map((selected, index) =>
          selected === sourceIndex ? index : -1).filter(index => index >= 0);
        let label = null;
        if (!entry.spec.name.startsWith("Poly Haven")) {
          if (!labelCache.has(entry.spec.kind)) {
            labelCache.set(entry.spec.kind, bespokeLabel(entry.spec.kind, entry.source));
          }
          label = labelCache.get(entry.spec.kind);
          label.updateMatrixWorld(true);
        }
        const baked = bakePackshot(entry.source, entry.spec.kind, label);
        bakedImages[sourceIndex] = baked.image;
        const texture = baked.texture;
        const geometry = new THREE.PlaneGeometry(1.32, 2.92);
        const material = new THREE.MeshBasicMaterial({
          map: texture, transparent: true, alphaTest: 0.035,
          depthWrite: false, side: THREE.DoubleSide,
          toneMapped: false,
        });
        const instanced = new THREE.InstancedMesh(geometry, material, indices.length);
        instanced.frustumCulled = false;
        instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        instanced.count = 0;
        instanced.renderOrder = 2;
        stage.add(instanced);
        pools.push({ indices, parts: [{
          mesh: instanced, localMatrix: new THREE.Matrix4(),
        }] });
        // Yield to the browser between sources so login keeps responding.
        if (sourceIndex % 2 === 1) await new Promise(resolve => setTimeout(resolve, 0));
        if (disposed) return;
      }
      useCompositor = typeof Element.prototype.animate === "function"
        && bakedImages.length === loaded.length;
      useCanvas2d = !useCompositor && Boolean(spriteCtx)
        && bakedImages.length === loaded.length;
      if (useCompositor) {
        bakedImages.forEach((image, index) => {
          sourceUrls[index] = image.toDataURL("image/webp", 0.94);
        });
        pools.forEach(pool => pool.parts.forEach(part => { part.mesh.visible = false; }));
        canvas.dataset.renderMode = "compositor-keyframes-pbr";
        spriteOverlay.style.display = "none";
      } else if (useCanvas2d) {
        pools.forEach(pool => pool.parts.forEach(part => { part.mesh.visible = false; }));
        canvas.dataset.renderMode = "canvas2d-cached-pbr";
      } else {
        canvas.dataset.renderMode = "cached-pbr-packshots";
      }
      frameTimes.length = 0;
      lastFrame = 0;
      if (qualityTier !== "high") setQuality("high");
      canvas.dataset.assetStatus = "vendored-glTF";
      canvas.dataset.brandCount = String(loaded.length);
      canvas.dataset.rendererStatus = "ready";
      resize();
      if (useCanvas2d) drawWebGLBackdrop(reduced.matches ? 2.1 : 0);
      if (useCompositor) {
        canvas.style.opacity = "0";
        paintVerticalTrails();
        buildCompositor();
      }
      renderFrame(reduced.matches ? 2.1 : 0);
      schedule();
    } catch (error) {
      if (!disposed) {
        canvas.dataset.rendererStatus = "fallback";
        canvas.dataset.assetStatus = "failed";
        console.warn("WineShopPOS licensed bottle models unavailable:", error);
      }
    }
  }
  void loadAssets();

  return () => {
    disposed = true;
    stop();
    observer.disconnect();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    reduced.removeEventListener?.("change", onMotion);
    canvas.removeEventListener("webglcontextlost", contextLost);
    const seen = new Set();
    for (const object of [...sourceModels, ...pools.flatMap(pool => pool.parts.map(part => part.mesh)), ...labelCache.values(), ...halos, particles])
      disposeObject(object, seen);
    environment.dispose();
    envMap.dispose();
    pmrem.dispose();
    background.geometry.dispose();
    background.material.dispose();
    bakedTargets.forEach(target => target.dispose());
    stopCompositor();
    compositor.remove();
    trailsCanvas.remove();
    spriteOverlay.remove();
    renderer.dispose();
  };
}
