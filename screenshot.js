const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });

  // 홈 화면 표시
  await page.goto('http://localhost:8000/index.html');
  
  // home-section을 보이게 하고 다른 섹션 숨김
  await page.evaluate(() => {
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    document.getElementById('home-section').classList.remove('hidden');
  });

  // 스크린샷 저장
  await page.screenshot({ path: 'home-screen.png', fullPage: true });
  console.log('Screenshot saved: home-screen.png');

  await browser.close();
})();
