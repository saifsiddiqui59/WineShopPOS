import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

test("login and recovery retain all existing authentication behavior", () => {
  const login = read("src/pages/Login.jsx");
  assert.match(login, /import LoginBrandOrbit from "\.\/LoginBrandOrbit"/);
  assert.equal((login.match(/<LoginBrandOrbit\s*\/>/g) ?? []).length, 2);
  assert.match(login, /onSubmit=\{submit\}/);
  assert.match(login, /onSubmit=\{sendRecovery\}/);
  assert.match(login, /await signIn\(email\.trim\(\), password\)/);
  assert.match(login, /resetPasswordForEmail/);
});
test("licensed glTF scene uses physically based Three.js, not procedural bottle profiles", () => {
  const component = read("src/pages/LoginBrandOrbit.jsx");
  const engine = read("src/pages/bottle-vortex-three.js");
  const css = read("src/pages/login-brand-orbit.css");
  assert.match(component, /mountBottleVortex/);
  assert.match(component, /aria-hidden="true"/);
  assert.match(engine, /new GLTFLoader\(\)/);
  assert.match(engine, /new THREE\.InstancedMesh/);
  assert.match(engine, /transmission = 0/);
  assert.match(engine, /drawCalls/);
  assert.match(engine, /new THREE\.WebGLRenderer/);
  assert.match(engine, /new RoomEnvironment/);
  assert.match(engine, /ACESFilmicToneMapping/);
  assert.match(engine, /MANIFEST_URL/);
  assert.match(engine, /getDelta\(\)/);
  assert.match(engine, /averageFps/);
  assert.match(engine, /p95FrameMs/);
  assert.match(engine, /visibilitychange/);
  assert.match(engine, /prefers-reduced-motion/);
  assert.match(engine, /webglcontextlost/);
  assert.match(css, /pointer-events: none/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert(!component.includes("bottle-vortex-webgl"), "new login must not use synthetic shader bottle renderer");
  assert(read("package.json").includes('"three"'));
});
test("CC0 asset importer uses known sources and prevents malformed downloads", () => {
  const source = read("scripts/assets/sync-login-models.py");
  assert.match(source, /polyhaven\.com\/files\/wine_bottles_01/);
  assert.match(source, /innerscene\.com\/api\/library/);
  assert.match(source, /hashlib\.sha256/);
  assert.match(source, /valid_filename/);
  assert.match(source, /CC0_ASSETS_READY/);
});
