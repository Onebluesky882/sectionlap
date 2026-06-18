const { chromium } = require('/Users/onebluesky882/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:5173";
const SS_DIR = path.join(__dirname, "screenshots");
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

let stepIdx = 0;
async function shot(page, name) {
  stepIdx++;
  const file = path.join(SS_DIR, `${String(stepIdx).padStart(2,"0")}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[screenshot] ${path.basename(file)}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(12000);

  try {
    const ts = Date.now();
    const email = `student-${ts}@test.com`;
    const password = "Test1234!";
    const name = `Test Student ${ts}`;

    // 1. Load app
    console.log(`[1] Opening app`);
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(2000);
    await shot(page, "app-start");

    // 2. Switch to Create Account tab
    console.log(`[2] Switching to signup tab`);
    // Click the tab (not the submit button) - use the tab container
    const tabBar = page.locator('.flex.rounded-lg.bg-muted\\/60');
    const signupTabBtn = tabBar.getByRole("button", { name: /create account/i });
    if (await signupTabBtn.isVisible()) {
      await signupTabBtn.click();
      await page.waitForTimeout(300);
    }

    // 3. Fill signup form
    console.log(`[3] Filling signup form: ${email}`);
    await page.locator('input#name').fill(name);
    await page.locator('input#signup-email').fill(email);
    await page.locator('input#signup-password').fill(password);
    // Student is default — click just to confirm
    await page.locator('text=Student').first().click();
    await shot(page, "signup-form-filled");

    // Submit via form submit button (the gradient button)
    await page.locator('form').getByRole("button", { name: /create account/i }).click();
    await page.waitForTimeout(3000);
    await shot(page, "after-signup");

    // Check for errors
    const errBox = page.locator('.text-destructive').first();
    if (await errBox.isVisible()) {
      const msg = await errBox.textContent();
      console.log(`[!] Error after signup: ${msg}`);
    }

    // 4. Sections list
    console.log(`[4] Sections list check`);
    await page.waitForTimeout(1000);
    await shot(page, "sections-list");
    const bodyText = await page.textContent("body") ?? "";
    console.log(`    Contains "Section": ${bodyText.includes("Section")}`);
    console.log(`    Contains "Browse": ${bodyText.includes("Browse")}`);

    // 5. View Details on first section
    console.log(`[5] View Details`);
    const detailBtns = page.getByRole("button", { name: /view detail/i });
    const btnCount = await detailBtns.count();
    console.log(`    Found ${btnCount} View Details buttons`);

    if (btnCount > 0) {
      await detailBtns.first().click();
      await page.waitForTimeout(1000);
      await shot(page, "section-detail");

      // 6. Book this Section
      console.log(`[6] Booking`);
      const bookBtn = page.getByRole("button", { name: /book this section/i });
      if (await bookBtn.isVisible()) {
        await bookBtn.click();
        await page.waitForTimeout(600);
        await shot(page, "confirm-modal");

        const confirmBtn = page.getByRole("button", { name: /proceed to checkout/i });
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
          await shot(page, "checkout-page");
          console.log(`    On checkout page`);

          // 7. Pay
          console.log(`[7] Paying`);
          const payBtn = page.getByRole("button", { name: /confirm payment|฿/i });
          if (await payBtn.isVisible()) {
            await payBtn.click();
            await page.waitForTimeout(2000);
            await shot(page, "payment-result");
            const finalText = await page.textContent("body") ?? "";
            if (finalText.includes("enrolled") || finalText.includes("✅")) {
              console.log(`    ✅ SUCCESS: Enrolled confirmation visible`);
            } else {
              console.log(`    NOTE: Check screenshot for result`);
            }
          } else {
            await shot(page, "no-pay-btn");
            console.log(`    WARN: Pay button not found`);
          }
        }
      } else {
        const allBtns = await page.locator("button").allTextContents();
        console.log(`    WARN: no Book button. Buttons: ${allBtns.slice(0,6).join(", ")}`);
        await shot(page, "no-book-btn");
      }
    } else {
      console.log(`    WARN: no View Details buttons`);
    }

    // 8. My Enrollments
    console.log(`[8] My Enrollments`);
    const myEnrollLink = page.getByRole("link", { name: /enrollment|my class/i });
    if (await myEnrollLink.count() > 0) {
      await myEnrollLink.first().click();
      await page.waitForTimeout(1000);
      await shot(page, "my-enrollments");
      const enrollText = await page.textContent("body") ?? "";
      if (enrollText.includes("paid") || enrollText.includes("enrolled")) {
        console.log(`    ✅ Paid booking visible in My Enrollments`);
      }
    }

    console.log(`\n✅ Test complete. Screenshots: ${SS_DIR}`);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    await shot(page, "error-state").catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
