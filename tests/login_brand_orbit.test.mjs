import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

test("login and password reset retain the original authentication logic", () => {
  const login = read("src/pages/Login.jsx");
  assert.match(login, /import LoginBrandOrbit from "\.\/LoginBrandOrbit"/);
  assert.equal((login.match(/<LoginBrandOrbit\s*\/>/g) ?? []).length, 2);
  assert.equal((login.match(/className="auth-screen wsp-login-screen"/g) ?? []).length, 2);
  assert.match(login, /onSubmit=\{submit\}/);
  assert.match(login, /onSubmit=\{sendRecovery\}/);
  assert.match(login, /await signIn\(email\.trim\(\), password\)/);
  assert.match(login, /resetPasswordForEmail/);
});

test("login uses one genuine GPU 3D canvas instead of animated flat SVG cards", () => {
  const c = read("src/pages/LoginBrandOrbit.jsx");
  const shader = read("src/pages/bottle-vortex-webgl.js");
  const css = read("src/pages/login-brand-orbit.css");
  assert.match(c, /mountBottleVortex/);
  assert.match(c, /<canvas/);
  assert.match(c, /wsp-login-webgl/);
  assert.match(c, /aria-hidden="true"/);
  assert.doesNotMatch(c, /<img|Array\.from\(\{ length: 184/);
  assert.match(shader, /getContext\("webgl2"/);
  assert.match(shader, /#version 300 es/);
  assert.match(shader, /makeMesh/);
  assert.match(shader, /makeProgram/);
  assert.match(shader, /drawElements/);
  assert.match(shader, /requestAnimationFrame/);
  assert.match(shader, /visibilitychange/);
  assert.match(shader, /prefers-reduced-motion/);
  assert.match(shader, /dataset\.bottleCount/);
  assert.match(css, /\.wsp-login-webgl/);
  assert.match(css, /pointer-events: none/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("native 3D bottles include cylindrical profiles, shaded glass, labels and caps", () => {
  const shader = read("src/pages/bottle-vortex-webgl.js");
  assert.match(shader, /WINE_PROFILE|wine:/);
  assert.match(shader, /beer:/);
  assert.match(shader, /can:/);
  assert.match(shader, /uBody/);
  assert.match(shader, /uFoil/);
  assert.match(shader, /uLabel/);
  assert.match(shader, /reflect\(-L,N\)/);
  assert.match(shader, /labelTexture/);
  assert.match(shader, /for\(const o of scene\)/);
  const pkg = JSON.parse(read("package.json"));
  assert(!pkg.dependencies.three, "should need no paid GPU or unreviewed WebGL dependency");
});
