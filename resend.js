const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Load cookies
  const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
  await page.setCookie(...cookies);

  // Inject localStorage before navigation
  await page.evaluateOnNewDocument((data) => {
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, value);
    }
  }, JSON.parse(fs.readFileSync('localStorage.json', 'utf8')));

  // Go to broadcast page
  await page.goto('https://bizichat.ai/en/broadcasts?acc=1550934', {
    waitUntil: 'networkidle2',
  });

  // Step 1: Wait for and click the menu (3-dots)
  await page.waitForSelector('.actionButton.el-popover__reference');
  const menuButtons = await page.$$('.actionButton.el-popover__reference');

  if (menuButtons.length === 0) {
    console.log('❌ No broadcast action buttons found.');
    await browser.close();
    return;
  }

  await menuButtons[0].click();
  await new Promise(resolve => setTimeout(resolve, 1000)); // wait for dropdown

  // Step 2: Click the "Resend" item
  const spans = await page.$$('span');
  let foundResend = false;

  for (let span of spans) {
    const text = await page.evaluate(el => el.textContent, span);
    if (text.trim().toLowerCase() === 'resend') {
      const box = await span.boundingBox();
      if (box) {
        await span.click();
        foundResend = true;
        break;
      }
    }
  }

  if (!foundResend) {
    console.log("❌ Couldn't find 'Resend' in dropdown.");
    await browser.close();
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000)); // wait for modal

  // Step 3: Click the confirm "Resend" button in modal
  const buttons = await page.$$('button');

  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.trim().toLowerCase() === 'resend') {
      const box = await btn.boundingBox();
      if (box) {
        await btn.click();
        console.log("✅ Broadcast resent.");
        await browser.close();
        return;
      }
    }
  }

  console.log("❌ Couldn't find confirm Resend button.");
  await browser.close();
})();