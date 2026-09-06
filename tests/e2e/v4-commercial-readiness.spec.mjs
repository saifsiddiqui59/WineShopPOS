import { test, expect } from "@playwright/test";

const demoEmail = process.env.V4_DEMO_EMAIL || "admin@demowineshop.com";
const demoPassword = process.env.V4_DEMO_PASSWORD || "1234";

async function expectNoHorizontalOverflow(page) {
  const values = await page.evaluate(() => ({
    body:document.body.scrollWidth,
    viewport:window.innerWidth,
    html:document.documentElement.scrollWidth,
  }));
  expect(values.body).toBeLessThanOrEqual(values.viewport + 2);
  expect(values.html).toBeLessThanOrEqual(values.viewport + 2);
}

test("V4 demo login is usable on phone viewport", async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.goto("/#/login?mode=demo");
  await expect(page.getByText("DEMO LOGIN")).toBeVisible();
  await expect(page.getByRole("button", { name:"Enter Demo" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("V4 demo stays isolated and mobile-safe", async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.goto("/#/login?mode=demo");
  await page.getByLabel("Email").fill(demoEmail);
  await page.getByLabel("Password").fill(demoPassword);
  await page.getByRole("button", { name:"Enter Demo" }).click();
  await expect(page.getByText(/Demo business data is temporary/i)).toBeVisible({ timeout:15000 });
  await expect(page).toHaveURL(/#\/demo/);
  await expectNoHorizontalOverflow(page);
});

test("V4 tablet login layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width:768, height:1024 });
  await page.goto("/#/login?mode=demo");
  await expectNoHorizontalOverflow(page);
});
