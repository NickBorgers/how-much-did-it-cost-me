#!/usr/bin/env node
// Script to generate screenshots for documentation
// Used by pre-commit hook to keep screenshots up-to-date

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const SCREENSHOTS_DIR = join(ROOT_DIR, 'docs', 'screenshots');

const PORT = 8090; // Use a different port to avoid conflicts
const BASE_URL = `http://localhost:${PORT}`;

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npx', ['http-server', '.', '-p', String(PORT), '-s'], {
      cwd: ROOT_DIR,
      stdio: 'pipe'
    });

    // Give server time to start
    setTimeout(() => resolve(server), 1500);

    server.on('error', reject);
  });
}

async function runFullFlow(page, modeName) {
  // Stage 1: Enter income
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.fill('#income', '75000');
  await page.waitForTimeout(500);

  // Click continue to stage 2
  await page.click('#continueToStage2');
  await page.waitForSelector('#stage2.visible');
  await page.waitForTimeout(500);

  // Stage 2: Select the Aircraft Carrier chip
  const carrierChip = page.locator('button:has-text("Aircraft Carrier")');
  await carrierChip.click();
  await page.waitForTimeout(300);

  // Click continue to stage 3
  await page.click('#continueToStage3');
  await page.waitForSelector('#stage3.visible');
  await page.waitForTimeout(500);

  // Stage 3: Select Defense & Military category
  await page.click('[data-category="defense"]');
  await page.waitForSelector('#stage4.visible');
  await page.waitForTimeout(500);

  // Stage 4: Expand the math breakdown
  await page.click('.math-toggle');
  await page.waitForTimeout(300);

  // Take full page screenshot
  const screenshotPath = join(SCREENSHOTS_DIR, `${modeName}-mode.png`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });
  console.log(`✓ ${modeName}-mode.png generated`);
}

async function main() {
  console.log('Generating screenshots...\n');

  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Start local server
  console.log('Starting local server...');
  const server = await startServer();

  const browser = await chromium.launch({ headless: true });

  try {
    // Light mode
    const lightContext = await browser.newContext({
      colorScheme: 'light',
      viewport: { width: 1280, height: 900 }
    });
    const lightPage = await lightContext.newPage();
    await runFullFlow(lightPage, 'light');
    await lightContext.close();

    // Dark mode
    const darkContext = await browser.newContext({
      colorScheme: 'dark',
      viewport: { width: 1280, height: 900 }
    });
    const darkPage = await darkContext.newPage();
    await runFullFlow(darkPage, 'dark');
    await darkContext.close();

    console.log('\n✓ Screenshots generated successfully');
  } catch (error) {
    console.error('Error generating screenshots:', error);
    process.exit(1);
  } finally {
    await browser.close();
    server.kill();
  }
}

main();
