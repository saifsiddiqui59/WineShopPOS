import { test, expect } from "@playwright/test";

const email=process.env.E2E_EMAIL||"";
const password=process.env.E2E_PASSWORD||"";
const productSearch=process.env.E2E_PRODUCT_SEARCH||"";
const expectAdmin=process.env.E2E_EXPECT_ADMIN==="1";

async function login(page){
  test.skip(!email||!password,"Set E2E_EMAIL and E2E_PASSWORD for authenticated E2E.");
  await page.goto("/#/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button",{name:"Login"}).click();
  await expect(page.getByRole("navigation",{name:"Main navigation"})).toBeVisible();
}

test("public login page renders",async({page})=>{
  await page.goto("/#/login");
  await expect(page.getByRole("heading",{name:"WineShop POS"})).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test.describe("authenticated read-only smoke",()=>{
  test.beforeEach(async({page})=>login(page));

  test("core modules load",async({page})=>{
    await page.goto("/#/pos");
    await expect(page.getByRole("heading",{name:"Fast POS Billing"})).toBeVisible();
    await page.goto("/#/products");
    await expect(page.locator("body")).toContainText(/Product/);
    await page.goto("/#/inventory");
    await expect(page.getByRole("heading",{name:"Inventory"})).toBeVisible();
  });

  test("Invoice Inbox exposes friendly labels",async({page})=>{
    await page.goto("/#/purchasing/invoices");
    await expect(page.getByRole("heading",{name:"Invoice Inbox"})).toBeVisible();
    const status=page.getByLabel("Status");
    await expect(status).toContainText("All Invoices");
    await expect(status).toContainText("Needs Review");
    await expect(status).toContainText("Ready for Stock");
    await expect(status).toContainText("Completed");
    await expect(page.getByText(/Completed = stock was received/i)).toBeVisible();
  });

  test("POS cart survives Scanner Test navigation",async({page})=>{
    test.skip(!productSearch,"Set E2E_PRODUCT_SEARCH to a stocked positive-price product.");
    await page.goto("/#/pos");
    await page.getByLabel("Manual Search").fill(productSearch);
    const first=page.locator(".search-result").first();
    await expect(first).toBeVisible();
    const productName=(await first.locator("span").first().textContent())?.trim();
    await first.click();
    if(productName) await expect(page.locator("body")).toContainText(productName);
    await page.getByRole("button",{name:"Scanner Test"}).click();
    await expect(page.locator("body")).toContainText(/Scanner/i);
    await page.goto("/#/pos");
    if(productName) await expect(page.locator("body")).toContainText(productName);
  });

  test("Admin Product Cleanup opens without deletion",async({page})=>{
    test.skip(!expectAdmin,"Set E2E_EXPECT_ADMIN=1 for an ADMIN test account.");
    await page.goto("/#/admin/product-cleanup");
    await expect(page.getByRole("heading",{name:"Product Cleanup"})).toBeVisible();
    await expect(page.getByText(/Transaction history is protected/i)).toBeVisible();
  });
});
