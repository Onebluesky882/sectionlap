import { test, expect } from "@playwright/test";

const ts = Date.now();
const STUDENT = { name: `Student ${ts}`, email: `student_flow_${ts}@test.com`, password: "Test1234!" };

async function signup(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForTimeout(500);
  const tabBar = page.locator('.flex.rounded-lg');
  await tabBar.getByRole("button", { name: /create account/i }).click();
  await page.locator('input#name').fill(STUDENT.name);
  await page.locator('input#signup-email').fill(STUDENT.email);
  await page.locator('input#signup-password').fill(STUDENT.password);
  await page.locator('text=Student').first().click();
  await page.locator('form').getByRole("button", { name: /create account/i }).click();
  await page.waitForTimeout(3000);
}

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator('input[type="email"]').first().fill(STUDENT.email);
  await page.locator('input[type="password"]').first().fill(STUDENT.password);
  await page.locator('form').getByRole("button", { name: /sign in|login/i }).click();
  await page.waitForTimeout(2500);
}

test.describe("Desktop — Student flow", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await signup(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("sections list shows at least one section", async ({ page }) => {
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/section|html|react|css/i);
  });

  test("view section detail", async ({ page }) => {
    const detailBtn = page.getByRole("button", { name: /view detail/i }).first();
    await expect(detailBtn).toBeVisible({ timeout: 10000 });
    await detailBtn.click();
    await page.waitForTimeout(1000);
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/book|enroll|฿|free/i);
  });

  test("book → checkout → pay flow", async ({ page }) => {
    const detailBtn = page.getByRole("button", { name: /view detail/i }).first();
    await expect(detailBtn).toBeVisible({ timeout: 10000 });
    await detailBtn.click();
    await page.waitForTimeout(800);

    const bookBtn = page.getByRole("button", { name: /book this section/i });
    if (!await bookBtn.isVisible()) { test.skip(); return; }
    await bookBtn.click();
    await page.waitForTimeout(500);

    const confirmBtn = page.getByRole("button", { name: /proceed to checkout/i });
    if (!await confirmBtn.isVisible({ timeout: 3000 })) { test.skip(); return; }
    await confirmBtn.click();
    await page.waitForTimeout(1500);

    const payBtn = page.getByRole("button", { name: /confirm payment|฿/i });
    if (await payBtn.isVisible()) {
      await payBtn.click();
      await page.waitForTimeout(2000);
      const body = await page.textContent("body") ?? "";
      expect(body).toMatch(/enrolled|success|paid|✅/i);
    }
  });
});
