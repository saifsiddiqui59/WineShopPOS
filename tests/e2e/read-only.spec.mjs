import { test, expect } from "@playwright/test";

const email=process.env.E2E_EMAIL||"";
const password=process.env.E2E_PASSWORD||"";
const expectAdmin=process.env.E2E_EXPECT_ADMIN==="1";

async function login(page){
  test.skip(!email||!password,"Set E2E_EMAIL and E2E_PASSWORD for authenticated E2E.");
  await page.goto("./#/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button",{name:"Login"}).click();
  await expect(page.getByRole("heading",{name:"Account Disabled"})).toHaveCount(0);
  await expect(page.getByRole("heading",{name:"Shop Access Suspended"})).toHaveCount(0);
  await expect(page.getByRole("navigation",{name:"Main navigation"})).toBeVisible();
}

test("public login page renders",async({page})=>{
  await page.goto("./#/login");
  await expect(page.getByRole("heading",{name:"WineShop POS"})).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("valid active account enters app without browser refresh",async({page})=>{
  test.skip(!email||!password,"Set E2E_EMAIL and E2E_PASSWORD.");
  await page.goto("./#/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button",{name:"Login"}).click();
  await expect(page.getByRole("heading",{name:"Account Disabled"})).toHaveCount(0);
  await expect(page.getByRole("heading",{name:"Shop Access Suspended"})).toHaveCount(0);
  try{
    await expect(page.getByRole("navigation",{name:"Main navigation"})).toBeVisible({timeout:12000});
  }catch(error){
    console.log("LOGIN_DIAGNOSTIC_URL",page.url());
    console.log("LOGIN_DIAGNOSTIC_BODY",await page.locator("body").innerText());
    throw error;
  }
});

test.describe("authenticated read-only smoke",()=>{
  test.beforeEach(async({page})=>login(page));

  test("core modules load",async({page})=>{
    await page.goto("./#/pos");
    await expect(page.getByRole("heading",{name:"Fast POS Billing"})).toBeVisible();
    await page.goto("./#/products");
    await expect(page.locator("body")).toContainText(/Product/);
    await page.goto("./#/inventory");
    await expect(page.getByRole("heading",{name:"Inventory & Product Stock",level:2,exact:true})).toBeVisible();
  });

  test("Invoice Inbox exposes friendly labels",async({page})=>{
    await page.goto("./#/purchasing/invoices");
    await expect(page.getByRole("heading",{name:"Invoice Inbox"})).toBeVisible();
    const status=page.getByLabel("Status");
    await expect(status).toContainText("All Invoices");
    await expect(status).toContainText("Needs Review");
    await expect(status).toContainText("Ready for Stock");
    await expect(status).toContainText("Completed");
    await expect(page.getByText(/Completed = stock was received/i)).toBeVisible();
  });

  test("POS search and scanner diagnostics follow current shift-safe placement",async({page})=>{
    await page.goto("./#/pos");
    await expect(page.getByRole("heading",{name:"Fast POS Billing",level:2,exact:true})).toBeVisible();
    await expect(page.getByLabel("Scan barcode or search products")).toBeVisible();

    await page.goto("./#/admin/hardware");
    await expect(page.getByRole("heading",{name:"Hardware & Device Setup",level:2,exact:true})).toBeVisible();
    await expect(page.getByRole("link",{name:/Barcode Scanner/i})).toBeVisible();

    await page.goto("./#/admin/hardware/scanner");
    await expect(page.getByRole("heading",{name:"Scanner Test & Settings",level:2,exact:true})).toBeVisible();
  });

  test("Admin Product Cleanup opens without deletion",async({page})=>{
    test.skip(!expectAdmin,"Set E2E_EXPECT_ADMIN=1 for an ADMIN test account.");
    await page.goto("./#/admin/product-cleanup");
    await expect(page.locator("h2").filter({hasText:/^Product Cleanup$/})).toBeVisible();
    await expect(page.getByText(/Transaction history is protected/i)).toBeVisible();
  });

  test("Admin Backup & Recovery loads restore history without schema error",async({page})=>{
    test.skip(!expectAdmin,"Set E2E_EXPECT_ADMIN=1 for an ADMIN test account.");
    await page.goto("./#/admin/backup");
    await expect(page.getByRole("heading",{name:"Backup & Recovery",level:2,exact:true})).toBeVisible();
    await expect(page.getByRole("heading",{name:"Restore Test History"})).toBeVisible();
    await expect(page.getByText("Unable to load restore-test history.")).toHaveCount(0);
  });
});
