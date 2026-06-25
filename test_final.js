const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 390, height: 844 });
  
  let errorCount = 0;
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.error('🔴', text);
      errorCount++;
    } else if (msg.type() === 'warn') {
      console.warn('🟡', text);
    }
  });
  
  page.on('pageerror', err => {
    console.error('💥 페이지 에러:', err.message);
  });
  
  await page.goto('http://localhost:8000/index.html');
  await page.click('.btn-todak-start');
  await page.waitForSelector('#role-selection-section:not(.hidden)');
  await page.click('#role-card-mom');
  await page.click('#role-sel-next');
  await page.waitForSelector('#signup-section:not(.hidden)');
  
  const email = 'mom' + Date.now() + '@todak.test';
  const pwd = 'Test123!@#';
  
  await page.fill('#signup-name', 'Test Mom');
  await page.fill('#signup-email', email);
  await page.fill('#signup-password', pwd);
  await page.fill('#signup-password-confirm', pwd);
  await page.click('label.form-check');
  await page.click('form#signup-form button[type="submit"]');
  
  console.log('\n📧 회원가입:', email);
  
  await page.waitForSelector('#onboarding-section:not(.hidden)', { timeout: 10000 });
  console.log('✓ 온보딩 로드됨');
  
  await page.fill('#onboarding-taemyeong', '토닥이');
  await page.fill('#onboarding-due-date', '2026-12-25');
  
  console.log('\n⏳ 시작하기 클릭...');
  await page.click('#onboarding-start-btn');
  
  await page.waitForTimeout(2000);
  
  const isHome = await page.locator('#home-section:not(.hidden)').isVisible().catch(() => false);
  if (isHome) {
    console.log('✓✓✓ 홈 페이지 로드 성공!');
    await page.screenshot({ path: '/tmp/success.png' });
  } else {
    console.log('❌ 홈 페이지 로드 실패');
    const toasts = await page.locator('.toast').allTextContents();
    if (toasts.length > 0) {
      console.log('토스트 메시지:', toasts);
    }
    await page.screenshot({ path: '/tmp/fail.png' });
  }
  
  if (errorCount > 0) {
    console.log(`\n⚠️  콘솔 에러 ${errorCount}개 발생`);
  }
  
  await browser.close();
})().catch(e => {
  console.error('🔥', e.message);
  process.exit(1);
});
