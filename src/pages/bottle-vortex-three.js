import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Login-only, decorative CC0 glTF showroom. Authentication never enters this module.
// Models are vendored by the asset-import workflow, not fetched from a third-party CDN.
const MANIFEST_URL = "/login-brands/models/manifest.json";
const GOLD = 0xe8b97c;
const MAX_DPR_DESKTOP = 1.5;
const MAX_DPR_MOBILE = 1.15;

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
        mat.envMapIntensity = 0.88;
        mat.needsUpdate = true;
      }
    }
  });
  return copy;
}


// Self-created generic branding: never imitates a manufacturer's trademark.
function bespokeLabel(kind) {
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
  const radius = can ? 0.478 : kind === "beer" ? 0.299 : 0.288;
  const geometry = new THREE.CylinderGeometry(radius, radius, can ? 0.99 : 0.73,
    64, 1, true, -Math.PI * 0.79, Math.PI * 1.58);
  const material = new THREE.MeshPhysicalMaterial({
    map, roughness: 0.7, metalness: can ? 0.20 : 0.03,
    side: THREE.DoubleSide, depthWrite: true,
  });
  const wrap = new THREE.Mesh(geometry, material);
  wrap.position.y = can ? -0.01 : -0.29;
  return wrap;
}

export function mountBottleVortex(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, depth: true,
      powerPreference: "high-performance", preserveDrawingBuffer: false,
    });
  } catch (error) {
    canvas.dataset.rendererStatus = "unsupported";
    console.warn("WineShopPOS 3D unavailable:", error.message);
    return () => {};
  }

  const stage = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 90);
  camera.position.set(0, 0, 13.3);
  camera.lookAt(0, 0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const envMap = pmrem.fromScene(environment, 0.035).texture;
  stage.environment = envMap;
  stage.add(new THREE.HemisphereLight(0xffdbbd, 0x1c101a, 0.75));
  function spotlight(color, intensity, x, y, z) {
    const light = new THREE.PointLight(color, intensity, 24, 2);
    light.position.set(x, y, z);
    stage.add(light);
  }
  spotlight(0xffb46c, 68, -5.6, 4, 6);
  spotlight(0xffe1c7, 52, 5.6, 1.8, 5);
  spotlight(0xba3159, 40, 1.0, -4.5, -2);
  spotlight(0x8a9ecb, 35, -1.6, 2.7, -6);

  // Layered golden perspective rings, like a luminous photographic tunnel.
  // Geometry is behind the card; no full-screen bloom postprocessing needed.
  const halos = [];
  for (let j = 0; j < 7; j++) {
    const radius = 2.5 + j * 0.48;
    for (let glow = 0; glow < 2; glow++) {
      const geo = new THREE.TorusGeometry(radius, glow ? 0.065 : 0.014,
        glow ? 6 : 8, 160);
      const material = new THREE.MeshBasicMaterial({
        color: j % 2 ? 0xffaa65 : 0xffca7c, transparent: true,
        opacity: glow ? 0.085 : 0.49,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const ring = new THREE.Mesh(geo, material);
      ring.rotation.x = 0.12 + j * 0.035;
      ring.rotation.y = 0.075 + j * 0.02;
      ring.position.z = -3.7 - j * 0.42;
      stage.add(ring);
      halos.push(ring);
    }
  }
  const particlePositions = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    const a = i * 2.399963229728653;
    const radius = 2.2 + ((i * 47) % 107) / 107 * 6.5;
    particlePositions[i * 3] = Math.cos(a) * radius;
    particlePositions[i * 3 + 1] = Math.sin(a) * radius * 0.63;
    particlePositions[i * 3 + 2] = -2 - (i % 7) * 1.2;
  }
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({
    color: 0xf4be85, size: 0.035, transparent: true, opacity: 0.65,
    depthWrite: false, sizeAttenuation: true,
  }));
  stage.add(particles);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const models = [];
  const sourceModels = [];
  const labelCache = new Map();
  const frameTimes = [];
  const clock = new THREE.Clock();
  let disposed = false, raf = 0, frames = 0, isMobile = false, elapsed = 0;
  let lastFrame = 0;
  canvas.dataset.rendererStatus = "loading";
  canvas.dataset.assetStatus = "loading";
  canvas.dataset.renderedFrames = "0";
  canvas.dataset.averageFps = "0";
  canvas.dataset.p95FrameMs = "0";

  function resize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    isMobile = w <= 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
      isMobile ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = isMobile ? 15.4 : 13.3;
    camera.fov = isMobile ? 57 : 42;
    camera.updateProjectionMatrix();
    for (let i = 0; i < models.length; i++) models[i].visible = i < (isMobile ? 12 : 26);
    canvas.dataset.bottleCount = String(Math.min(models.length, isMobile ? 12 : 26));
    if (reduced.matches && canvas.dataset.rendererStatus === "ready") renderFrame(2.1);
  }

  function renderFrame(t) {
    if (disposed || renderer.getContext().isContextLost()) return;
    models.forEach((item, i) => {
      if (!item.visible) return;
      const phase = i * 2.399963229728653 + Math.sin(i * 1.73) * 0.15;
      const a = phase + t * (0.23 + (i % 4) * 0.009);
      const orbitR = (isMobile ? 4.9 : 5.35) + (i % 4) * 0.43;
      item.position.set(
        Math.cos(a) * orbitR,
        Math.sin(a) * (isMobile ? 3.35 : 3.05) + 0.22 * Math.sin(a * 2.0),
        Math.sin(a + i * 0.07) * 4.25 - 2.1 - (i % 3) * 0.35 + (i % 9 === 0 ? 2.9 : 0)
      );
      item.rotation.set(
        0.15 * Math.sin(t * 0.37 + i),
        -a * 0.74 + 0.26 * Math.sin(t * 0.22 + i),
        0.11 * Math.cos(t * 0.34 + phase)
      );
      item.scale.setScalar((i % 7 === 0 ? 1.2 : 0.92) * (isMobile ? 0.89 : 1));
    });
    halos.forEach((ring, i) => {
      ring.rotation.z = t * (i % 2 ? -0.065 : 0.047) + i * 0.3;
    });
    particles.rotation.z = -t * 0.012;
    renderer.render(stage, camera);
    frames++;
    canvas.dataset.renderedFrames = String(frames);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
  }

  function animate(now) {
    raf = 0;
    if (disposed || document.hidden || reduced.matches || canvas.dataset.rendererStatus !== "ready") return;
    if (lastFrame > 0) {
      const dt = now - lastFrame;
      if (dt > 0) {
        frameTimes.push(dt);
        if (frameTimes.length > 180) frameTimes.shift();
        if (frameTimes.length >= 2) {
          const sorted = [...frameTimes].sort((a, b) => a - b);
          const mean = frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length;
          canvas.dataset.averageFps = (1000 / mean).toFixed(1);
          canvas.dataset.p95FrameMs = sorted[Math.floor(0.95 * (sorted.length - 1))].toFixed(1);
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
        canvas.dataset.rendererStatus === "ready") {
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
    if (document.hidden) stop();
    else if (reduced.matches) renderFrame(2.1);
    else schedule();
  }
  function onMotion() {
    if (reduced.matches) { stop(); renderFrame(2.1); }
    else schedule();
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
      for (let i = 0; i < 26; i++) {
        const entry = loaded[i % loaded.length];
        // Clone only nodes/transforms: geometries and PBR textures are shared.
        // Animate the outer rig, not the glTF node. The child retains the
        // normalization scale required for real-world-meter source assets.
        const instance = new THREE.Group();
        instance.add(entry.source.clone(true));
        if (!entry.spec.name.startsWith("Poly Haven")) {
          if (!labelCache.has(entry.spec.kind)) {
            labelCache.set(entry.spec.kind, bespokeLabel(entry.spec.kind));
          }
          instance.add(labelCache.get(entry.spec.kind).clone());
        }
        stage.add(instance);
        models.push(instance);
      }
      canvas.dataset.assetStatus = "vendored-glTF";
      canvas.dataset.brandCount = String(loaded.length);
      canvas.dataset.rendererStatus = "ready";
      resize();
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
    for (const object of [...sourceModels, ...models, ...halos, particles])
      disposeObject(object, seen);
    environment.dispose();
    envMap.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}
