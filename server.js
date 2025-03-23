const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

app.post('/resend', async (req, res) => {
  console.log("🔥 Webhook hit: starting resend automation...");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Load session from env
    const cookies = JSON.parse(process.env.COOKIE_JSON);
    const localStorageData = JSON.parse(process.env.LOCALSTORAGE_JSON || '{}');

    await page.setCookie(...cookies);

    // Load localStorage before navigation
    await page.evaluateOnNewDocument((data) => {
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, value);
      }
    }, localStorageData);

    // Go to Bizichat broadcast page
    await page.goto('https://bizichat.ai/en/broadcasts?acc=1642972', {
      waitUntil: 'networkidle2',
    });

    // Click the first menu button
    await page.waitForSelector('.actionButton.el-popover__reference');
    const menuButtons = await page.$$('.actionButton.el-popover__reference');
    await menuButtons[0].click();

    // Wait for dropdown and click "Resend"
    await page.waitForTimeout(1000);
    const spans = await page.$$('span');
    for (const span of spans) {
      const text = await page.evaluate(el => el.textContent, span);
      if (text.trim().toLowerCase() === 'resend') {
        const box = await span.boundingBox();
        if (box) {
          await span.click();
          break;
        }
      }
    }

    // Wait and confirm "Resend" in modal
    await page.waitForTimeout(1000);
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.trim().toLowerCase() === 'resend') {
        const box = await btn.boundingBox();
        if (box) {
          await btn.click();
          break;
        }
      }
    }

    await browser.close();
    console.log("✅ Resend completed from cloud.");
    res.status(200).send('✅ Broadcast resent from cloud.');
  } catch (err) {
    console.error("❌ Error during resend:", err);
    res.status(500).send('❌ Failed to resend.');
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server live on port ${PORT}`);
});