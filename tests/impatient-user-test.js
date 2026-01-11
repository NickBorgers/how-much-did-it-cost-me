// Impatient User Test - Automated Playwright test for PR reviews
// This test simulates a user who wants to quickly check federal spending costs
// and expects the app to remember their information for faster repeat visits

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || './test-screenshots';
const RESULTS_FILE = process.env.RESULTS_FILE || './test-results.json';

(async () => {
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const results = {
    status: 'PASSED',
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    firstVisit: {
      steps: [],
      success: true
    },
    secondVisit: {
      steps: [],
      success: true
    },
    issues: [],
    screenshots: []
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Helper to take screenshot and record it
  async function screenshot(name) {
    const filename = `${name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    results.screenshots.push(filename);
    return filename;
  }

  // Helper to add step result
  function addStep(visit, message, success = true) {
    results[visit].steps.push({ message, success, timestamp: new Date().toISOString() });
    console.log(`[${visit}] ${success ? '✓' : '✗'} ${message}`);
    if (!success) {
      results[visit].success = false;
      results.status = 'FAILED';
    }
  }

  // Helper to add issue
  function addIssue(issue) {
    results.issues.push(issue);
    console.log(`[ISSUE] ${issue}`);
  }

  try {
    console.log('\n=== FIRST VISIT (New User Experience) ===\n');

    // Step 1: Navigate to the app
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await screenshot('01-initial-load');
    addStep('firstVisit', 'Page loaded successfully');

    // Step 2: Verify title
    const title = await page.locator('h1').textContent();
    if (title && title.includes('How Much Did It Cost Me')) {
      addStep('firstVisit', `Title verified: "${title}"`);
    } else {
      addStep('firstVisit', `Title not found or incorrect: "${title}"`, false);
      addIssue('Page title missing or incorrect');
    }

    // Step 3: Verify NO welcome back banner on first visit
    const bannerVisible = await page.locator('#returningBanner').isVisible();
    if (!bannerVisible) {
      addStep('firstVisit', 'No "Welcome back" banner shown (correct for first visit)');
    } else {
      addStep('firstVisit', 'Welcome back banner incorrectly shown on first visit', false);
      addIssue('Welcome back banner should not appear on first visit');
    }

    // Step 4: Enter income
    await page.locator('#income').fill('85000');
    await page.waitForTimeout(1000);
    await screenshot('02-income-entered');
    addStep('firstVisit', 'Entered income: $85,000');

    // Step 5: Verify tax calculation appears
    const taxVisible = await page.locator('#taxResult').isVisible();
    if (taxVisible) {
      const taxText = await page.locator('#calculatedTax').textContent();
      addStep('firstVisit', `Tax calculation displayed: ${taxText}`);
      await screenshot('03-tax-calculated');
    } else {
      addStep('firstVisit', 'Tax calculation did not appear', false);
      addIssue('Tax calculation failed to display after entering income');
    }

    // Step 6: Click Continue to Stage 2
    const continueBtn = page.locator('#continueToStage2');
    if (await continueBtn.isEnabled()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
      await screenshot('04-stage2');
      addStep('firstVisit', 'Proceeded to Stage 2 (Spending Amount)');
    } else {
      addStep('firstVisit', 'Continue button not enabled', false);
      addIssue('Continue button should be enabled after entering valid income');
    }

    // Step 7: Click on James Webb Space Telescope chip
    const jwstChip = page.locator('button:has-text("James Webb Space Telescope")');
    if (await jwstChip.count() > 0) {
      await jwstChip.click();
      await page.waitForTimeout(500);
      await screenshot('05-spending-selected');
      addStep('firstVisit', 'Selected "James Webb Space Telescope" spending example');
    } else {
      // Try entering a manual amount instead
      await page.locator('#spending').fill('10');
      await page.waitForTimeout(500);
      addStep('firstVisit', 'Entered spending amount manually: $10 billion');
    }

    // Step 8: Click Continue to Stage 3
    const continueBtn2 = page.locator('#continueToStage3');
    if (await continueBtn2.isVisible() && await continueBtn2.isEnabled()) {
      await continueBtn2.click();
      await page.waitForTimeout(1000);
      await screenshot('06-stage3');
      addStep('firstVisit', 'Proceeded to Stage 3 (Category Selection)');
    }

    // Step 9: Select General Government category (or verify auto-selected)
    const generalBtn = page.locator('[data-category="general"]');
    if (await generalBtn.count() > 0) {
      const isSelected = await generalBtn.getAttribute('class');
      if (!isSelected?.includes('selected')) {
        await generalBtn.click();
        await page.waitForTimeout(500);
      }
      addStep('firstVisit', 'Category: General Government selected');
    }

    // Step 10: Proceed to results
    const visibleContinue = page.locator('#stage3 button:has-text("Continue"), button:has-text("Calculate")').first();
    if (await visibleContinue.count() > 0 && await visibleContinue.isVisible()) {
      await visibleContinue.click();
      await page.waitForTimeout(1000);
    }
    await screenshot('07-results');
    addStep('firstVisit', 'Proceeded to Stage 4 (Results)');

    // Step 11: Verify results are shown
    const resultShare = page.locator('#resultShare');
    if (await resultShare.isVisible()) {
      const shareText = await resultShare.textContent();
      addStep('firstVisit', `Personal share displayed: ${shareText}`);
    } else {
      addStep('firstVisit', 'Results not displayed', false);
      addIssue('Results page should show personal share amount');
    }

    console.log('\n=== SECOND VISIT (Returning User Experience) ===\n');

    // Navigate back to simulate return visit (localStorage persists in same context)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await screenshot('08-return-visit');

    // Verify welcome back banner IS visible
    const bannerNowVisible = await page.locator('#returningBanner').isVisible();
    if (bannerNowVisible) {
      addStep('secondVisit', 'Welcome back banner displayed (correct for returning user)');
    } else {
      addStep('secondVisit', 'Welcome back banner NOT shown on return visit', false);
      addIssue('Returning users should see the welcome back banner');
    }

    // Verify income is pre-filled
    const incomeValue = await page.locator('#income').inputValue();
    if (incomeValue === '85000' || incomeValue === '85,000') {
      addStep('secondVisit', `Income pre-filled: $${incomeValue}`);
    } else {
      addStep('secondVisit', `Income not pre-filled correctly (got: "${incomeValue}")`, false);
      addIssue('Income should be remembered from first visit');
    }

    // Verify tax is pre-calculated
    const taxStillVisible = await page.locator('#taxResult').isVisible();
    if (taxStillVisible) {
      addStep('secondVisit', 'Tax calculation pre-displayed');
    } else {
      addStep('secondVisit', 'Tax not pre-calculated on return visit', false);
      addIssue('Tax should be pre-calculated for returning users');
    }

    // Verify Continue button is enabled
    const continueEnabled = await page.locator('#continueToStage2').isEnabled();
    if (continueEnabled) {
      addStep('secondVisit', 'Continue button ready (no re-entry needed)');
    } else {
      addStep('secondVisit', 'Continue button not enabled on return', false);
      addIssue('Continue button should be enabled for returning users');
    }

    await screenshot('09-return-ready');
    addStep('secondVisit', 'Returning user can immediately proceed to spending selection');

  } catch (error) {
    results.status = 'FAILED';
    addIssue(`Test error: ${error.message}`);
    console.error('Test error:', error);
    try {
      await screenshot('error');
    } catch (e) {
      // Ignore screenshot errors
    }
  } finally {
    await browser.close();
  }

  // Calculate summary
  results.summary = {
    firstVisitSteps: results.firstVisit.steps.length,
    firstVisitPassed: results.firstVisit.success,
    secondVisitSteps: results.secondVisit.steps.length,
    secondVisitPassed: results.secondVisit.success,
    totalIssues: results.issues.length,
    screenshotCount: results.screenshots.length
  };

  // Write results to file
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\n=== TEST ${results.status} ===`);
  console.log(`Results saved to: ${RESULTS_FILE}`);
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}/`);

  process.exit(results.status === 'PASSED' ? 0 : 1);
})();
