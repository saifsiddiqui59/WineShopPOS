import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.env.LOGIN_PREVIEW_URL || "http://127.0.0.1:4173";
const output = "artifacts/login-orbit";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true, channel: "chrome",
  args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const results = [];
try {
  for (const scene of [
    { name: "desktop", viewport: { width: 1440, height: 900 }, motion: "no-preference", bottles: 26 },
    { name: "mobile", viewport: { width: 390, height: 844 }, motion: "no-preference", bottles: 12 },
    { name: "reduced-motion", viewport: { width: 1440, height: 900 }, motion: "reduce", bottles: 26 },
  ]) {
    const context = await browser.newContext({
      viewport: scene.viewport, reducedMotion: scene.motion, serviceWorkers: "block",
      ...(scene.name === "desktop" ? { recordVideo: {
        dir: output, size: { width: 960, height: 600 },
      } } : {}),
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "WineShop POS" }).waitFor({ timeout: 30000 });
    await page.getByRole("button", { name: "Login" }).waitFor();
    const canvas = page.locator(".wsp-login-webgl");
    await canvas.waitFor({ state: "attached" });
    await page.waitForFunction(() =>
      document.querySelector(".wsp-login-webgl")?.dataset.rendererStatus === "ready",
      null, { timeout: 60000 });
    assert.equal(await canvas.getAttribute("data-asset-status"), "vendored-glTF");
    assert.equal(Number(await canvas.getAttribute("data-bottle-count")), scene.bottles);
    assert.equal(Number(await canvas.getAttribute("data-brand-count")), 7);
    assert.equal(await page.locator(".wsp-login-product").count(), 0);
    const card = await page.locator(".auth-card").boundingBox();
    assert(card && card.width > 230 && card.x >= 0 &&
      card.x + card.width <= scene.viewport.width + 1, "login form cannot clip");
    await page.getByLabel("Email").waitFor();
    const firstFrame = Number(await canvas.getAttribute("data-rendered-frames"));
    await page.waitForTimeout(scene.name === "desktop" ? 8500 : 3000);
    const afterFrame = Number(await canvas.getAttribute("data-rendered-frames"));
    await page.screenshot({ path: output + "/" + scene.name + ".png" });
    const perf = await canvas.evaluate(el => ({
      fps: Number(el.dataset.averageFps), p95FrameMs: Number(el.dataset.p95FrameMs),
      frames: Number(el.dataset.renderedFrames), calls: Number(el.dataset.drawCalls),
      triangles: Number(el.dataset.triangles), assets: el.dataset.assetStatus,
      glError: el.getContext("webgl2")?.getError(),
    }));
    results.push({ scene: scene.name, firstFrame, afterFrame, ...perf });
    await fs.writeFile(output + "/performance.json", JSON.stringify(results, null, 2));
    console.log("VISUAL_MEASUREMENT " + JSON.stringify(results.at(-1)));
    if (scene.motion === "reduce") assert.equal(afterFrame, firstFrame);
    else assert(afterFrame > firstFrame, "rendering must advance at least one frame");
    assert.equal(perf.glError, 0, "WebGL error must be zero");
    if (scene.name === "desktop") {
      assert(Number.isFinite(perf.fps) && perf.fps > 0 && perf.p95FrameMs > 0, "actual FPS/p95 samples are required");
      assert(perf.calls > 0 && perf.triangles > 0, "must render real mesh triangles");
    }
    assert.deepEqual(errors, [], "browser page errors");
    await context.close();
  }
  await fs.writeFile(output + "/performance.json", JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
