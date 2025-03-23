const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Go to Bizichat broadcasts page
  await page.goto('https://bizichat.ai/en/broadcasts?acc=1642972');

  console.log("⚠️ Please log in manually using Google or Facebook. You have 1 minute...");

  // Give you time to log in
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Save cookies
  const cookies = await page.cookies();
  fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));

  // Save local storage
  const localStorageData = await page.evaluate(() => {
    let data = {};
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  });
  fs.writeFileSync('localStorage.json', JSON.stringify(localStorageData, null, 2));

  console.log("✅ Session saved. You can now close the browser.");
  await browser.close();
})();
