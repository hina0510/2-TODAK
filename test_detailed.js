const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 390, height: 844 });
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('TODAK') || text.includes('[')) {
      console.log('📝', text);
    } else if (msg.type() === 'error') {
      console.error('❌', text);
    } else if (msg.type() === 'warn') {
      console.warn('⚠️ ', text);
    }
  });
  
  await page.goto('http://localhost:8000/index.html');
  await page.waitForTimeout(1000);
  
  console.log('\n🔵 로그인 페이지에서 토닥 시작하기 클릭');
  await page.click('.btn-todak-start');
  await page.waitForSelector('#role-selection-section:not(.hidden)');
  
  console.log('🔵 엄마 역할 선택');
  await page.click('#role-card-mom');
  await page.click('#role-sel-next');
  await page.waitForSelector('#signup-section:not(.hidden)');
  
  const email = 'test' + Date.now() + '@todak.com';
  const pwd = 'Test123!@#';
  
  console.log('\n🔵 회원가입 폼 입력');
  console.log('📧', email);
  console.log('🔐', pwd);
  
  await page.fill('#signup-name', 'Test Mom');
  await page.fill('#signup-email', email);
  await page.fill('#signup-password', pwd);
  await page.fill('#signup-password-confirm', pwd);
  await page.click('label.form-check');
  
  console.log('\n🔵 회원가입 제출');
  await page.click('form#signup-form button[type="submit"]');
  
  await page.waitForTimeout(3000);
  
  const isOnboarding = await page.locator('#onboarding-section:not(.hidden)').isVisible().catch(() => false);
  
  if (isOnboarding) {
    console.log('✓ 온보딩 페이지 로드됨');
  } else {
    console.log('❌ 온보딩 페이지 미로드');
    const allText = await page.locator('body').innerText();
    const toasts = await page.locator('.toast').allTextContents();
    console.log('🔴 토스트:', toasts);
  }
  
  await browser.close();
})().catch(e => {
  console.error('테스트 오류:', e.message);
  process.exit(1);
});
