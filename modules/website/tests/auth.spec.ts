import { test, expect } from "@playwright/test";

const timestamp = Date.now();
const TEST_STUDENT = {
  name: "Test Student",
  email: `student_${timestamp}@test.com`,
  password: "password123",
};
const TEST_TEACHER = {
  name: "Test Teacher",
  email: `teacher_${timestamp}@test.com`,
  password: "password123",
};

// ─── Signup ──────────────────────────────────────────────────────────────────

test.describe("Signup", () => {
  test("student can sign up and land on /sections", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "สมัครสมาชิก" }).click();

    await page.getByPlaceholder("ชื่อ").fill(TEST_STUDENT.name);
    await page.getByPlaceholder("อีเมล").fill(TEST_STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(TEST_STUDENT.password);
    await page.getByRole("button", { name: "นักเรียน" }).click();
    await page.getByRole("button", { name: "สมัครสมาชิก" }).last().click();

    await page.waitForURL("**/sections");
    expect(page.url()).toContain("/sections");
  });

  test("teacher can sign up and land on /dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "สมัครสมาชิก" }).click();

    await page.getByPlaceholder("ชื่อ").fill(TEST_TEACHER.name);
    await page.getByPlaceholder("อีเมล").fill(TEST_TEACHER.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(TEST_TEACHER.password);
    await page.getByRole("button", { name: "ผู้สอน" }).click();
    await page.getByRole("button", { name: "สมัครสมาชิก" }).last().click();

    await page.waitForURL("**/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("duplicate email shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "สมัครสมาชิก" }).click();

    await page.getByPlaceholder("ชื่อ").fill("Dup User");
    await page.getByPlaceholder("อีเมล").fill(TEST_STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(TEST_STUDENT.password);
    await page.getByRole("button", { name: "สมัครสมาชิก" }).last().click();

    await expect(page.getByText("สมัครสมาชิกไม่สำเร็จ")).toBeVisible();
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

test.describe("Login", () => {
  test("student login redirects to /sections", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("อีเมล").fill(TEST_STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(TEST_STUDENT.password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await page.waitForURL("**/sections");
    expect(page.url()).toContain("/sections");
  });

  test("teacher login redirects to /dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("อีเมล").fill(TEST_TEACHER.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(TEST_TEACHER.password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await page.waitForURL("**/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("wrong password shows error", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("อีเมล").fill(TEST_STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill("wrongpassword");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await expect(page.getByText("อีเมลหรือรหัสผ่านไม่ถูกต้อง")).toBeVisible();
  });
});

// ─── Session ─────────────────────────────────────────────────────────────────

test.describe("Session", () => {
  test("token is persisted in localStorage after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("อีเมล").fill(TEST_STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(TEST_STUDENT.password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await page.waitForURL("**/sections");

    const stored = await page.evaluate(() => localStorage.getItem("sectionlap-auth"));
    const parsed = JSON.parse(stored ?? "{}");
    expect(parsed?.state?.token).toBeTruthy();
    expect(parsed?.state?.user?.email).toBe(TEST_STUDENT.email);
  });

  test("session is restored on page reload", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("อีเมล").fill(TEST_STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(TEST_STUDENT.password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await page.waitForURL("**/sections");

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should still be on /sections, not kicked to /login
    expect(page.url()).not.toContain("/login");
  });

  test("signout clears token and redirects to /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("อีเมล").fill(TEST_STUDENT.email);
    await page.getByPlaceholder("รหัสผ่าน").fill(TEST_STUDENT.password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await page.waitForURL("**/sections");

    await page.goto("/profile");
    await page.getByRole("button", { name: "ออกจากระบบ" }).click();
    await page.waitForURL("**/login");

    const stored = await page.evaluate(() => localStorage.getItem("sectionlap-auth"));
    const parsed = JSON.parse(stored ?? "{}");
    expect(parsed?.state?.token).toBeFalsy();
  });
});
