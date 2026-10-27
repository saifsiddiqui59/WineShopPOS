import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

test("login uses an isolated decorative Echo for sign-in and password recovery", () => {
  const login = read("src/pages/Login.jsx");
  assert.match(login, /import LoginBrandOrbit from "\.\/LoginBrandOrbit"/);
  assert.equal((login.match(/<LoginBrandOrbit\s*\/>/g) ?? []).length, 2);
  assert.equal((login.match(/className="auth-screen wsp-login-screen"/g) ?? []).length, 2);
  assert.match(login, /onSubmit=\{submit\}/);
  assert.match(login, /onSubmit=\{sendRecovery\}/);
  assert.match(login, /await signIn\(email\.trim\(\), password\)/);
  assert.match(login, /resetPasswordForEmail/);
});

test("iMessage-style radial Echo bursts and reduced-motion preference are declared", () => {
  const component = read("src/pages/LoginBrandOrbit.jsx");
  const css = read("src/pages/login-brand-orbit.css");
  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /\/login-brands\//);
  assert.match(component, /Array\.from\(\{ length: 30 \}/);
  assert.match(component, /--echo-x/);
  assert.match(component, /--echo-y/);
  assert.match(component, /--echo-delay/);
  assert.match(css, /@keyframes wsp-login-echo-burst/);
  assert.match(css, /@keyframes wsp-login-echo-halo/);
  assert.match(css, /calc\(-50% \+ var\(--echo-x\)\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /\.auth-screen\.wsp-login-screen/);
});

test("all locally hosted beer and wine illustrations exist and are self-contained SVGs", () => {
  const assets = [
    "kingfisher", "bira-91", "budweiser", "tuborg", "heineken",
    "carlsberg", "corona", "sula", "fratelli", "jacobs-creek",
  ];
  for (const name of assets) {
    const svg = read(`public/login-brands/${name}.svg`);
    assert.match(svg, /<svg[\s\S]+viewBox=/);
    assert.match(svg, /<title>/);
    assert.doesNotMatch(svg, /<script|xlink:href|<foreignObject|href=/i);
  }
  assert.equal(assets.length, 10);
});
