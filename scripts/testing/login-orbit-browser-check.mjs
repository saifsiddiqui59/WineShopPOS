import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.env.LOGIN_PREVIEW_URL || "http://127.0.0.1:4173";
const output = "artifacts/login-orbit";
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  for (const scene of [
    { name: "desktop", viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference", expectedImages: 10 },
    { name: "mobile", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", expectedImages: 10 },
    { name: "reduced-motion", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", expectedImages: 10 },
  ]) {
    const context = await browser.newContext({
      viewport: scene.viewport,
      reducedMotion: scene.reducedMotion,
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));

    await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "WineShop POS" }).waitFor();
    await page.getByRole("button", { name: "Login" }).waitFor();
    await page.locator(".wsp-login-orbiter").first().waitFor({ state: "attached" });

    assert.equal(await page.locator(".wsp-login-orbiter").count(), scene.expectedImages);
    assert.equal(await page.locator(".wsp-login-product img").count(), scene.expectedImages);
    await page.locator(".wsp-login-product img").first().evaluate(el => el.decode());
    const missingImages = await page.locator(".wsp-login-product img").evaluateAll(els =>
      els.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src));
    assert.deepEqual(missingImages, [], "decorative SVG files should be available from public/");

    const animation = await page.locator(".wsp-login-orbiter").first().evaluate(el =>
      getComputedStyle(el).animationName);
    assert.equal(animation, scene.reducedMotion === "reduce" ? "none" : "wsp-login-clockwise");

    const card = await page.locator(".auth-card").boundingBox();
    assert(card && card.width > 240 && card.x >= 0 &&
      card.x + card.width <= scene.viewport.width + 1, "login card must fit viewport");
    await page.screenshot({ path: `${output}/${scene.name}.png`, animations: "disabled" });
    assert.deepEqual(pageErrors, [], "Login should render without JS runtime errors");
    await context.close();
    console.log(`LOGIN_ORBIT_VISUAL_${scene.name.toUpperCase().replaceAll("-", "_")}=PASS`);
  }
} finally {
  await browser.close();
}
