import { firefox } from 'playwright';

async function captureScreenshots() {
  // Use system Firefox via channel
  const browser = await firefox.launch({ 
    headless: true,
    executablePath: '/run/current-system/sw/bin/firefox'
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'screenshots/01-initial.png', fullPage: false });
  console.log('Screenshot 1: Initial state');

  await page.click('.sidebar-toggle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/02-sidebar-expanded.png', fullPage: false });
  console.log('Screenshot 2: Sidebar expanded');

  await page.click('.sidebar-toggle');
  await page.waitForTimeout(300);

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: 'screenshots/03-scrolled-down.png', fullPage: false });
  console.log('Screenshot 3: Scrolled down');

  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
  }
  await page.screenshot({ path: 'screenshots/04-near-end.png', fullPage: false });
  console.log('Screenshot 4: Near end');

  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/05-at-end-cta.png', fullPage: false });
  console.log('Screenshot 5: At end with CTA');

  await browser.close();
  console.log('All screenshots captured');
}

captureScreenshots().catch(console.error);
