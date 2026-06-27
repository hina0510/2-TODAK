import { chromium } from 'playwright';
import path from 'path';

async function test() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
  
  const screenshotPath = path.join('/c/Users/win10/Desktop/claude/team2/2-TODAK', 'initial_page.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('스크린샷 저장: ' + screenshotPath);

  // 페이지 상태 확인
  const visibleSections = await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    return Array.from(sections).map(s => ({
      id: s.id,
      hidden: s.classList.contains('hidden'),
      display: window.getComputedStyle(s).display
    }));
  });

  console.log('섹션 상태:', JSON.stringify(visibleSections, null, 2));

  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
}

test().catch(console.error);
