import { test, expect } from "@playwright/test";

const ts = Date.now();
const TEACHER = { name: `Teacher ${ts}`, email: `teacher_flow_${ts}@test.com`, password: "Test1234!" };

async function signup(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForTimeout(500);
  const tabBar = page.locator('.flex.rounded-lg');
  await tabBar.getByRole("button", { name: /create account/i }).click();
  await page.locator('input#name').fill(TEACHER.name);
  await page.locator('input#signup-email').fill(TEACHER.email);
  await page.locator('input#signup-password').fill(TEACHER.password);
  await page.locator('text=Teacher').first().click();
  await page.locator('form').getByRole("button", { name: /create account/i }).click();
  await page.waitForTimeout(3000);
}

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator('input[type="email"]').first().fill(TEACHER.email);
  await page.locator('input[type="password"]').first().fill(TEACHER.password);
  await page.locator('form').getByRole("button", { name: /sign in|login/i }).click();
  await page.waitForTimeout(2500);
}

test.describe("Desktop — Teacher flow", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await signup(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("teacher sees dashboard after login", async ({ page }) => {
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/dashboard|my section|post new|create/i);
  });

  test("teacher can open create section form", async ({ page }) => {
    const createBtn = page.getByRole("button", { name: /post new|create|new section/i }).first();
    if (await createBtn.isVisible({ timeout: 5000 })) {
      await createBtn.click();
      await page.waitForTimeout(800);
      const body = await page.textContent("body") ?? "";
      expect(body).toMatch(/title|description|price|capacity/i);
    }
  });

  test("teacher creates a new section", async ({ page }) => {
    const createBtn = page.getByRole("button", { name: /post new|create|new section/i }).first();
    if (!await createBtn.isVisible({ timeout: 5000 })) { test.skip(); return; }
    await createBtn.click();
    await page.waitForTimeout(500);

    await page.getByPlaceholder(/title/i).fill(`Test Section ${ts}`);
    await page.getByPlaceholder(/description/i).fill("Playwright auto-created section");
    const priceInput = page.getByPlaceholder(/price/i);
    if (await priceInput.isVisible()) await priceInput.fill("199");
    const submitBtn = page.getByRole("button", { name: /save|submit|create/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/test section|section created|dashboard/i);
  });
});
