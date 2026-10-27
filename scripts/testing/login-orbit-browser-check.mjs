import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.env.LOGIN_PREVIEW_URL || "http://127.0.0.1:4173";
const output = "artifacts/login-orbit";
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
  args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
try {
  for (const scene of [
    { name: "desktop", viewport: { width: 1440, height: 900 }, motion: "no-preference", bottles: 32 },
    { name: "mobile", viewport: { width: 390, height: 844 }, motion: "no-preference", bottles: 18 },
    { name: "reduced-motion", viewport: { width: 1440, height: 900 }, motion: "reduce", bottles: 32 },
  ]) {
    const context = await browser.newContext({
      viewport: scene.viewport,
      reducedMotion: scene.motion,
      serviceWorkers: "block",
      ...(scene.name === "desktop" ? { recordVideo: {
        dir: output, size: { width: 960, height: 600 },
      } } : {}),
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "WineShop POS" }).waitFor({ timeout: 30000 });
    await page.getByRole("button", { name: "Login" }).waitFor();
    const canvas = page.locator(".wsp-login-webgl");
    await canvas.waitFor({ state: "attached" });
    await page.waitForFunction(() =>
      document.querySelector(".wsp-login-webgl")?.dataset.rendererStatus === "ready",
      null, { timeout: 20000 });
    assert.equal(await canvas.getAttribute("data-renderer"), "wsp-bottle-vortex");
    assert.equal(Number(await canvas.getAttribute("data-bottle-count")), scene.bottles);
    assert.equal(Number(await canvas.getAttribute("data-brand-count")), 10);
    assert.equal(await page.locator(".wsp-login-product").count(), 0,
      "old SVG product DOM swarm must be gone");
    const canvasRect = await canvas.boundingBox();
    assert(canvasRect && canvasRect.width >= scene.viewport.width - 2 &&
      canvasRect.height >= scene.viewport.height - 2, "3D renderer must cover login viewport");
    const card = await page.locator(".auth-card").boundingBox();
    assert(card && card.width > 230 && card.x >= 0 &&
      card.x + card.width <= scene.viewport.width + 1, "login must fit viewport");

    const firstFrame = Number(await canvas.getAttribute("data-rendered-frames"));
    const imageA = await canvas.screenshot({ path: `${output}/${scene.name}-3d-first.png` });
    await page.waitForTimeout(950);
    const laterFrame = Number(await canvas.getAttribute("data-rendered-frames"));
    const imageB = await canvas.screenshot({ path: `${output}/${scene.name}-3d-later.png` });
    if (scene.motion === "reduce") {
      assert.equal(laterFrame, firstFrame, "reduced motion must render once and stop");
    } else {
      assert(laterFrame >= firstFrame + 5,
        "real 3D animation must advance at least five frames in 950ms");
      assert(!imageA.equals(imageB), "GPU-rendered image must visibly change over time");
    }
    await page.screenshot({ path: `${output}/${scene.name}.png` });
    if (scene.name === "desktop") await page.waitForTimeout(1400);
    assert.deepEqual(errors, [], "WebGL login should not throw browser errors");
    await context.close();
    console.log(`WINESHOPPOS_REAL_3D_${scene.name.toUpperCase().replaceAll("-", "_")}=PASS; frames=${firstFrame}->${laterFrame}`);
  }
} finally {
  await browser.close();
}
