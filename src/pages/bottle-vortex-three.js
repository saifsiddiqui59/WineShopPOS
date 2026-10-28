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
        precision highp float;
        uniform float uTime;
        uniform float uAspect;
        uniform vec2 uResolution;
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        void main() {
          vec2 xy = gl_FragCoord.xy;
          float H = max(1.0, uResolution.y);
          vec2 q = (xy - 0.5 * uResolution) / H;
          q.x *= 1.0;
          float a = atan(q.y, q.x);
          float r = length(q * vec2(1.0, 1.32));
          float vignette = 1.0 - smoothstep(0.12, 0.96, r);
          vec3 dark = vec3(0.032, 0.009, 0.014);
          vec3 wine = vec3(0.123, 0.029, 0.030);
          vec3 base = mix(dark, wine, 0.44 + 0.38 * vignette);
          base += vec3(0.11, 0.037, 0.015) * exp(-r * 3.0);
          float ringPhase = r * 45.0 - a + 0.70 * sin(a * 3.0 + r * 5.0) - uTime * 0.19;
          float streak = pow(0.5 + 0.5 * cos(ringPhase), 8.0);
          float ribbons = pow(0.5 + 0.5 * cos(ringPhase + 0.64 * sin(a * 2.0)),
            5.0);
          float centralFade = smoothstep(0.08, 0.22, r);
          base += vec3(0.91, 0.39, 0.095) *
            (0.37 * streak + 0.13 * ribbons) * centralFade * exp(-r * 1.15);
          float arc = pow(max(0.0, sin(a * 3.0 + r * 18.0 - uTime * 0.11)), 30.0);
          base += vec3(0.39, 0.13, 0.045) * arc * exp(-r * 2.2);
          vec2 cell = floor(xy / 14.0);
          vec2 local = fract(xy / 14.0) - 0.5;
          float chance = step(0.986, hash(cell));
          float dotGlow = exp(-dot(local, local) * 110.0) * chance;
          base += vec3(1.0, 0.63, 0.30) * dotGlow * (0.35 + 0.3 * sin(uTime + cell.x));
          base *= 1.0 - 0.46 * smoothstep(0.34, 0.92, r);
          gl_FragColor = vec4(base, 1.0);
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
  const halos = [];
  for (let j = 0; j < 7; j++) {
    const radius = 2.65 + j * 0.43;
    for (let glow = 0; glow < 2; glow++) {
      const geometry = new THREE.TorusGeometry(radius, glow ? 0.068 : 0.012,
        glow ? 4 : 5, 128);
      const material = new THREE.MeshBasicMaterial({
        color: j % 3 === 0 ? 0xffb76a : 0xffd492,
        transparent: true, opacity: glow ? 0.18 : 0.78,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = 0.25 + j * 0.023;
      ring.rotation.y = -0.13 + j * 0.027;
      ring.position.z = -2.0 - j * 0.56;
      stage.add(ring);
      halos.push(ring);
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
  const selection = [0, 1, 2, 3, 0, 5, 1, 2, 2, 6, 0, 4, 1,
    2, 3, 5, 0, 1, 2, 6, 3, 0, 4, 1, 2, 5];
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

  function resize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    isMobile = w <= 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
      isMobile ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP));
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(bgUniforms.uResolution.value);
    bgUniforms.uAspect.value = w / h;
    camera.aspect = w / h;
    camera.position.z = isMobile ? 15.8 : 14.5;
    camera.fov = isMobile ? 58 : 43;
    camera.updateProjectionMatrix();
    activeCount = isMobile ? 12 : selection.length;
    canvas.dataset.bottleCount = String(pools.length ? activeCount : 0);
    if (reduced.matches && canvas.dataset.rendererStatus === "ready") renderFrame(2.1);
  }

  function pose(index, t) {
    const phi = index * 2.399963229728653;
    const a = phi + t * (0.37 + (index % 3) * 0.012);
    // Echo abundance: golden-angle phases, but orbit in continuous 3D.
    // The two near-hero bottles intentionally crop at the viewport edges.
    const hero = index === 0 || index === 7 || index === 18;
    const front = index % 5 === 0 || hero;
    if (isMobile) {
      // Keep complete product silhouettes in the visible top/bottom margins,
      // instead of hiding most bottles behind the full-width sign-in card.
      const lane = index % 3;
      const above = Math.floor(index / 3) % 2 === 0;
      position.set(
        (lane - 1) * 1.9 + Math.sin(a * 0.3) * 0.22,
        (above ? 1 : -1) * (6.65 + 0.26 * Math.cos(a)),
        -2.8 + Math.cos(a) * 1.2
      );
      scale.setScalar(hero ? 0.9 : (front ? 0.78 : 0.62));
    } else if (hero) {
      // Three restrained hero packshots at left/right edges; never let
      // a giant bottle or can sweep over the login form or crop at the top.
      const side = index === 7 ? 1 : -1;
      position.set(
        side * (6.7 + Math.sin(a * 0.35) * 0.27),
        (index === 18 ? -1.75 : index === 7 ? 0.7 : 1.25) + Math.sin(a) * 0.45,
        3.05 + Math.cos(a) * 0.45
      );
      scale.setScalar(index === 18 ? 1.32 : 1.39);
    } else {
      const radius = 5.5 + (index % 4) * 0.47;
      position.set(
        Math.cos(a) * radius,
        Math.sin(a * 0.97) * 4.12,
        -2.7 + Math.sin(a + index * 0.11) * 3.75
      );
      scale.setScalar(front ? 1.02 : 0.69);
    }
    rotation.set(
      0.24 * Math.sin(a * 0.8 + index),
      Math.sin(t * 0.26 + index * 0.8) * 0.26,
      hero ? (index === 7 ? -0.49 : 0.47) + 0.19 * Math.sin(t * 0.3 + index) : 0.35 * Math.sin(a + index * 0.27)
    );
    quaternion.setFromEuler(rotation);
    return matrix.compose(position, quaternion, scale);
  }

  function renderFrame(t) {
    if (disposed || renderer.getContext().isContextLost()) return;
    // Each source mesh is rendered once as an InstancedMesh; repeated
    // physical materials, texture maps and geometry share GPU memory.
    const poses = [];
    for (let i = 0; i < activeCount; i++) poses[i] = pose(i, t).clone();
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
    halos.forEach((ring, i) => {
      ring.rotation.z = t * (i % 2 ? -0.045 : 0.033) + i * 0.14;
    });
    particles.rotation.z = -t * 0.012;
    bgUniforms.uTime.value = t;
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(bgScene, bgCamera);
    renderer.clearDepth();
    renderer.render(stage, camera);
    renderer.autoClear = true;
    frames++;
    canvas.dataset.renderedFrames = String(frames);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
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
      for (let sourceIndex = 0; sourceIndex < loaded.length; sourceIndex++) {
        const entry = loaded[sourceIndex];
        const indices = selection.map((selected, index) =>
          selected === sourceIndex ? index : -1).filter((index) => index >= 0);
        const parts = [];
        const meshes = [];
        entry.source.updateMatrixWorld(true);
        entry.source.traverse((node) => { if (node.isMesh) meshes.push(node); });
        if (!entry.spec.name.startsWith("Poly Haven")) {
          const key = entry.spec.kind;
          if (!labelCache.has(key)) labelCache.set(key, bespokeLabel(key, entry.source));
          const label = labelCache.get(key);
          label.updateMatrixWorld(true);
          meshes.push(label);
        }
        for (const sourceMesh of meshes) {
          const instanced = new THREE.InstancedMesh(
            sourceMesh.geometry, sourceMesh.material, indices.length);
          instanced.frustumCulled = false;
          instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          instanced.count = 0;
          stage.add(instanced);
          parts.push({ mesh: instanced, localMatrix: sourceMesh.matrixWorld.clone() });
        }
        pools.push({ indices, parts });
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
    for (const object of [...sourceModels, ...pools.flatMap(pool => pool.parts.map(part => part.mesh)), ...labelCache.values(), ...halos, particles])
      disposeObject(object, seen);
    environment.dispose();
    envMap.dispose();
    pmrem.dispose();
    background.geometry.dispose();
    background.material.dispose();
    renderer.dispose();
  };
}
