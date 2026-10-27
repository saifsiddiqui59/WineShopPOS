import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.env.LOGIN_PREVIEW_URL || "http://127.0.0.1:4173";
const output = "artifacts/login-orbit";
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  for (const scene of [
    { name: "desktop", viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference", expectedImages: 78 },
    { name: "mobile", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", expectedImages: 78 },
    { name: "reduced-motion", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", expectedImages: 78 },
  ]) {
    const context = await browser.newContext({
      viewport: scene.viewport,
      reducedMotion: scene.reducedMotion,
      serviceWorkers: "block",
      ...(scene.name === "desktop" ? {
        recordVideo: { dir: output, size: { width: 960, height: 600 } },
      } : {}),
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));

    await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "WineShop POS" }).waitFor();
    await page.getByRole("button", { name: "Login" }).waitFor();
    await page.locator(".wsp-login-echo").first().waitFor({ state: "attached" });

    assert.equal(await page.locator(".wsp-login-echo").count(), scene.expectedImages);
    assert.equal(await page.locator(".wsp-login-product img").count(), scene.expectedImages);
    await page.locator(".wsp-login-product img").first().evaluate(el => el.decode());
    const missingImages = await page.locator(".wsp-login-product img").evaluateAll(els =>
      els.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src));
    assert.deepEqual(missingImages, [], "decorative SVG files should be available from public/");
    const uniqueBrands = new Set(await page.locator(".wsp-login-product-label").allTextContents());
    assert.equal(uniqueBrands.size, 10, "all wine and beer brands should appear in the Echo field");

    // Assert the pieces actually move in the browser. Static render counts and
    // single screenshots do NOT qualify a swirling animation.
    const samplePoints = () => page.locator(".wsp-login-echo").evaluateAll(els =>
      els.slice(0, 24).map(el => {
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      })
    );
    const t0 = await samplePoints();
    await page.waitForTimeout(700);
    const t1 = await samplePoints();
    const distance = t0.map((point, i) =>
      Math.hypot(point.x - t1[i].x, point.y - t1[i].y));
    if (scene.reducedMotion === "reduce") {
      assert(distance.every(d => d < 1), "reduced motion must freeze every Echo bottle");
    } else {
      assert(distance.filter(d => d > 25).length >= 12,
        "at least 12 of 24 Echo bottles must swirl more than 25px in 700ms");
      assert(Math.max(...distance) > 70,
        "Echo must show strong visible movement, not subtle drifting");
    }

    const trajectory = await page.locator(".wsp-login-echo").first().evaluate(el =>
      ["p0", "p1", "p2", "p3"].map(id => ({
        x: parseFloat(el.style.getPropertyValue("--echo-" + id + "x")),
        y: parseFloat(el.style.getPropertyValue("--echo-" + id + "y")),
      }))
    );
    const angles = trajectory.map(p => Math.atan2(p.y, p.x));
    const clockwise = angles.slice(1).map((angle, i) => {
      const d = angle - angles[i];
      return d < 0 ? d + 2 * Math.PI : d;
    });
    assert(clockwise.every(d => d > .5 && d < 2.1),
      "Echo path must sweep clockwise at each waypoint, not remain static");

    const animation = await page.locator(".wsp-login-echo").first().evaluate(el =>
      getComputedStyle(el).animationName);
    assert.equal(animation, scene.reducedMotion === "reduce" ? "none" : "wsp-login-echo-swirl");

    const card = await page.locator(".auth-card").boundingBox();
    assert(card && card.width > 240 && card.x >= 0 &&
      card.x + card.width <= scene.viewport.width + 1, "login card must fit viewport");
    await page.screenshot({ path: `${output}/${scene.name}.png` });
    if (scene.name === "desktop") {
      await page.waitForTimeout(750);
      await page.screenshot({ path: `${output}/desktop-motion-next.png` });
      // Include a genuine browser-recorded motion clip for visual review;
      // two screenshots alone cannot validate a swirl's aesthetic quality.
      await page.waitForTimeout(1800);
    }
    assert.deepEqual(pageErrors, [], "Login should render without JS runtime errors");
    await context.close();
    console.log(`LOGIN_ECHO_VISUAL_${scene.name.toUpperCase().replaceAll("-", "_")}=PASS`);
  }
} finally {
  await browser.close();
}
