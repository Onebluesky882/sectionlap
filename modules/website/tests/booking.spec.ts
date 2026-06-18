import { test, expect } from "@playwright/test";

const ts = Date.now();
const STUDENT = { name: "Book Student", email: `book_stu_${ts}@test.com`, password: "password123" };

// Signup once, login for each test
test.describe("Website — Booking flow", () => {
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

  async function login(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.getByPlaceholder("อีเมล").fill(STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(STUDENT.password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await page.waitForURL("**/sections");
  }

  test("book button visible on section detail", async ({ page }) => {
    await login(page);
    await page.locator("a[href^='/sections/']").first().click();
    await page.waitForURL("**/sections/**");
    await page.waitForFunction(() => !document.body.textContent?.includes("กำลังโหลด"), { timeout: 10000 });
    await expect(page.getByRole("button", { name: /จองเลย/i })).toBeVisible();
  });

  test("/booking page renders date and time picker", async ({ page }) => {
    await login(page);
    await page.goto("/booking");
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.getByText("08:00")).toBeVisible();
  });

  test("booking submit disabled without date+time", async ({ page }) => {
    await login(page);
    await page.goto("/booking");
    const submitBtn = page.getByRole("button", { name: /ยืนยันการจอง/i });
    await expect(submitBtn).toBeDisabled();
  });

  test("booking submit enabled after date+time selected", async ({ page }) => {
    await login(page);
    await page.goto("/booking");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.locator('input[type="date"]').fill(tomorrow.toISOString().slice(0, 10));
    await page.getByText("09:00").click();

    await expect(page.getByRole("button", { name: /ยืนยันการจอง/i })).toBeEnabled();
  });

  test("profile page shows booking history section", async ({ page }) => {
    await login(page);
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "โปรไฟล์" })).toBeVisible();
    await expect(page.getByText("การจองของฉัน")).toBeVisible();
  });
});
