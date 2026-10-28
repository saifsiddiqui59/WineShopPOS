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
    { name: "desktop", viewport: { width: 1440, height: 900 }, motion: "no-preference", bottles: 44 },
    { name: "mobile", viewport: { width: 390, height: 844 }, motion: "no-preference", bottles: 24 },
    { name: "reduced-motion", viewport: { width: 1440, height: 900 }, motion: "reduce", bottles: 44 },
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
    const navigationStart = Date.now();
    await page.goto(base + "/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "WineShop POS" }).waitFor({ timeout: 30000 });
    await page.getByRole("button", { name: "Login" }).waitFor();
    const canvas = page.locator(".wsp-login-webgl");
    await canvas.waitFor({ state: "attached" });
    await page.waitForFunction(() =>
      document.querySelector(".wsp-login-webgl")?.dataset.rendererStatus === "ready",
      null, { timeout: 60000 });
    const readyMs = Date.now() - navigationStart;
    assert(readyMs < 15000, "licensed atlas must avoid the slow GLB startup path");
    assert.equal(await canvas.getAttribute("data-asset-status"), "vendored-pbr-atlas");
    assert.equal(Number(await canvas.getAttribute("data-desired-count")), scene.bottles);
    assert.equal(await canvas.getAttribute("data-motion-axis"), "vertical-cyclone");
    const visibleBottles = Number(await canvas.getAttribute("data-bottle-count"));
    assert(visibleBottles >= (scene.name === "mobile" ? 18 : 29),
      "adaptive cyclone must preserve a visible product field");
    assert.equal(Number(await canvas.getAttribute("data-brand-count")), 7);
    assert.equal(await page.locator(".wsp-login-helical-trails").count(), 1);
    assert.equal(await canvas.getAttribute("data-render-mode"), "compositor-atlas");
    assert.equal(await page.locator(".wsp-login-cyclone-product").count(),
      scene.name === "mobile" ? 24 : 44);
    assert.equal(await page.locator(".wsp-login-product").count(), 0);
    const card = await page.locator(".auth-card").boundingBox();
    assert(card && card.width > 230 && card.x >= 0 &&
      card.x + card.width <= scene.viewport.width + 1, "login form cannot clip");
    await page.getByLabel("Email").waitFor();
    const firstFrame = Number(await canvas.getAttribute("data-rendered-frames"));
    await page.waitForTimeout(scene.name === "desktop" ? 8500 : 3000);
    const afterFrame = Number(await canvas.getAttribute("data-rendered-frames"));
    const progress = Number(await canvas.getAttribute("data-motion-progress"));
    assert(progress >= 0, "cyclone must report continuous time-based motion");
    const productCoverage = await page.locator(".wsp-login-cyclone-product")
      .evaluateAll((nodes) => {
        let left = 0, right = 0;
        const width = window.innerWidth;
        for (const node of nodes) {
          if (Number(getComputedStyle(node).opacity) < 0.15) continue;
          const box = node.getBoundingClientRect();
          if (box.width < 6 || box.height < 12) continue;
          const cx = box.x + box.width / 2;
          if (cx < width * 0.42) left++;
          if (cx > width * 0.58) right++;
        }
        return { left, right };
      });
    assert(productCoverage.left >= (scene.name === "mobile" ? 2 : 5) &&
      productCoverage.right >= (scene.name === "mobile" ? 2 : 5),
      "Cyclone must distribute visible products on BOTH sides, not a single clustered column");
    await page.screenshot({ path: output + "/" + scene.name + ".png" });
    const perf = await canvas.evaluate(el => ({
      fps: Number(el.dataset.averageFps), p95FrameMs: Number(el.dataset.p95FrameMs),
      frames: Number(el.dataset.renderedFrames), calls: Number(el.dataset.drawCalls),
      triangles: Number(el.dataset.triangles), assets: el.dataset.assetStatus,
      quality: el.dataset.qualityTier, targetDensity: Number(el.dataset.desiredCount),
      visibleDensity: Number(el.dataset.bottleCount), motionAxis: el.dataset.motionAxis,
      renderMode: el.dataset.renderMode, compositorCount: Number(el.dataset.compositorCount || 0),
      visibleSprites: Number(el.dataset.visibleSprites || "0"),
      glError: el.getContext("webgl2")?.getError(),
    }));
    results.push({ scene: scene.name, readyMs, productCoverage, firstFrame, afterFrame, ...perf });
    await fs.writeFile(output + "/performance.json", JSON.stringify(results, null, 2));
    console.log("VISUAL_MEASUREMENT " + JSON.stringify(results.at(-1)));
    if (scene.motion === "reduce") assert.equal(afterFrame, firstFrame);
    else assert(afterFrame > firstFrame, "rendering must advance at least one frame");
    assert.equal(perf.glError, 0, "WebGL error must be zero");
    if (scene.name === "desktop") {
      assert(Number.isFinite(perf.fps) && perf.fps > 0 && perf.p95FrameMs > 0, "actual FPS/p95 samples are required");
      assert.equal(perf.calls, 0, "vendored atlas must avoid runtime WebGL calls");
      assert.equal(perf.triangles, 0, "vendored atlas must avoid runtime GLB geometry");
    }
    assert(perf.visibleSprites >= 18, "cyclone must show dense licensed packshots");
    if (scene.motion === "reduce") assert.equal(perf.compositorCount, 0);
    else assert(perf.compositorCount >= (scene.name === "mobile" ? 24 : 44));
    assert.deepEqual(errors, [], "browser page errors");
    if (scene.name === "desktop") {
      await page.screenshot({ path: output + "/first-ready-desktop.png" });
      // Read-only auth smoke: no real account credentials, no Supabase write.
      const primaryBackground = await page.getByRole("button", { name: "Login" })
        .evaluate(button => getComputedStyle(button).backgroundImage);
      assert.match(primaryBackground, /linear-gradient/i,
        "the branded wine-red login button must not be overridden by global theme");
      await page.getByRole("button", { name: "Forgot Password?" }).click();
      await page.getByRole("heading", { name: "Forgot Password" }).waitFor();
      await page.getByRole("button", { name: "Back to Login" }).click();
      await page.getByRole("heading", { name: "WineShop POS" }).waitFor();
    }
    await context.close();
  }
  await fs.writeFile(output + "/performance.json", JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
