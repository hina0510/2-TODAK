const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 390, height: 844 });
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('🔴 콘솔 오류:', msg.text());
    } else if (msg.type() === 'warn') {
      console.warn('🟡 경고:', msg.text());
    } else {
      console.log('📝 로그:', msg.text());
    }
  });
  
  // 페이지 오류 수집
  page.on('pageerror', err => {
    console.error('🔴 페이지 오류:', err.message);
  });
  
  await page.goto('http://localhost:8000/index.html');
  
  await page.click('.btn-todak-start');
  await page.waitForSelector('#role-selection-section:not(.hidden)');
  
  await page.click('#role-card-mom');
  await page.click('#role-sel-next');
  await page.waitForSelector('#signup-section:not(.hidden)');
  
  const email = 'testmom' + Date.now() + '@example.com';
  await page.fill('#signup-name', 'Test Mom');
  await page.fill('#signup-email', email);
  await page.fill('#signup-password', 'TestPassword123!@#');
  await page.fill('#signup-password-confirm', 'TestPassword123!@#');
  await page.click('label.form-check');
  
  console.log('\n📧 회원가입 이메일:', email);
  
  await page.click('form#signup-form button[type="submit"]');
  
  await page.waitForSelector('#onboarding-section:not(.hidden)', { timeout: 15000 });
  console.log('✓ 온보딩 페이지 로드');
  
  await page.fill('#onboarding-taemyeong', '토닥이');
  await page.fill('#onboarding-due-date', '2026-12-25');
  
  console.log('\n⏳ 온보딩 저장 중...');
  await page.click('#onboarding-start-btn');
  
  // 3초 대기 후 콘솔 로그 수집
  await page.waitForTimeout(3000);
  
  try {
    await page.waitForSelector('#home-section:not(.hidden)', { timeout: 5000 });
    console.log('✓ 홈 페이지 로드 성공!');
  } catch (err) {
    console.log('❌ 홈 페이지 로드 실패');
    await page.screenshot({ path: '/tmp/debug-error.png' });
  }
  
  await browser.close();
})().catch(err => {
  console.error('테스트 오류:', err.message);
  process.exit(1);
});
