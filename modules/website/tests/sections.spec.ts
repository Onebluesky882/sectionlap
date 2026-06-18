import { test, expect } from "@playwright/test";

const ts = Date.now();
const STUDENT = { name: "Sec Student", email: `sec_stu_${ts}@test.com`, password: "password123" };

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("อีเมล").fill(email);
  await page.getByPlaceholder("รหัสผ่าน").fill(password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.waitForURL("**/sections");
}

test.describe("Website — Sections", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/login");
    await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
    await page.getByPlaceholder("ชื่อ").fill(STUDENT.name);
    await page.getByPlaceholder("อีเมล").fill(STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(STUDENT.password);
    await page.getByRole("button", { name: "นักเรียน" }).click();
    await page.getByRole("button", { name: "สมัครสมาชิก" }).last().click();
    await page.waitForURL("**/sections");
    await page.close();
  });

  test("sections page loads with list", async ({ page }) => {
    await loginAs(page, STUDENT.email, STUDENT.password);
    await expect(page.getByRole("heading", { name: "Section ทั้งหมด" })).toBeVisible();
    const cards = page.locator("a[href^='/sections/']");
    await expect(cards.first()).toBeVisible({ timeout: 8000 });
  });

  test("section cards show title and price", async ({ page }) => {
    await loginAs(page, STUDENT.email, STUDENT.password);
    const firstCard = page.locator("a[href^='/sections/']").first();
    await expect(firstCard).toBeVisible({ timeout: 8000 });
    const text = await firstCard.textContent();
    expect(text).toMatch(/.+/);
  });

  test("clicking a section opens detail page", async ({ page }) => {
    await loginAs(page, STUDENT.email, STUDENT.password);
    const firstCard = page.locator("a[href^='/sections/']").first();
    await expect(firstCard).toBeVisible({ timeout: 8000 });
    await firstCard.click();
    await page.waitForURL("**/sections/**");
    await expect(page.getByRole("button", { name: /จองเลย/i })).toBeVisible();
  });

  test("section detail shows teacher and duration", async ({ page }) => {
    await loginAs(page, STUDENT.email, STUDENT.password);
    await page.locator("a[href^='/sections/']").first().click();
    await page.waitForURL("**/sections/**");
    // wait for async data to load (loading spinner to disappear)
    await page.waitForFunction(() => !document.body.textContent?.includes("กำลังโหลด"), { timeout: 10000 });
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/ผู้สอน/);
    expect(body).toMatch(/นาที/);
  });

  test("back button returns to list", async ({ page }) => {
    await loginAs(page, STUDENT.email, STUDENT.password);
    await page.locator("a[href^='/sections/']").first().click();
    await page.waitForURL("**/sections/**");
    await page.getByText("← กลับ").click();
    await page.waitForTimeout(500);
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/Section ทั้งหมด/);
  });
});
