import { test, expect } from "@playwright/test";

const ts = Date.now();
const STUDENT = { name: `Test Student ${ts}`, email: `student_${ts}@test.com`, password: "Test1234!" };
const TEACHER = { name: `Test Teacher ${ts}`, email: `teacher_${ts}@test.com`, password: "Test1234!" };

test.describe("Desktop — Auth", () => {
  test("student signup → sections page", async ({ page }) => {
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
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/section|browse|explore/i);
  });

  test("teacher signup → teacher dashboard", async ({ page }) => {
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
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/dashboard|my section|post/i);
  });

  test("wrong password shows error", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="email"]').first().fill(STUDENT.email);
    await page.locator('input[type="password"]').first().fill("wrongpassword");
    await page.locator('form').getByRole("button", { name: /sign in|login/i }).click();

    await page.waitForTimeout(2000);
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/invalid|incorrect|error|wrong/i);
  });

  test("login as student → sections", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="email"]').first().fill(STUDENT.email);
    await page.locator('input[type="password"]').first().fill(STUDENT.password);
    await page.locator('form').getByRole("button", { name: /sign in|login/i }).click();

    await page.waitForTimeout(2000);
    const body = await page.textContent("body") ?? "";
    expect(body).toMatch(/section|browse/i);
  });
});
