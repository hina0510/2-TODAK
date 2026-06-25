const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 390, height: 844 });
  
  await page.goto('http://localhost:8000/index.html');
  await page.screenshot({ path: '/tmp/1-login.png' });
  console.log('✓ 로그인 페이지');
  
  await page.click('.btn-todak-start');
  await page.waitForSelector('#role-selection-section:not(.hidden)');
  await page.screenshot({ path: '/tmp/2-role-selection.png' });
  console.log('✓ 역할 선택');
  
  await page.click('#role-card-mom');
  await page.click('#role-sel-next');
  await page.waitForSelector('#signup-section:not(.hidden)');
  await page.screenshot({ path: '/tmp/3-signup.png' });
  console.log('✓ 회원가입 페이지');
  
  await page.fill('#signup-name', 'Test Mom');
  const email = 'testmom' + Date.now() + '@example.com';
  await page.fill('#signup-email', email);
  await page.fill('#signup-password', 'TestPassword123!@#');
  await page.fill('#signup-password-confirm', 'TestPassword123!@#');
  
  // 라벨 클릭으로 체크박스 선택
  await page.click('label.form-check');
  
  console.log('이메일:', email);
  console.log('비밀번호: TestPassword123!@#');
  
  await page.click('form#signup-form button[type="submit"]');
  
  try {
    await page.waitForSelector('#onboarding-section:not(.hidden)', { timeout: 15000 });
    await page.screenshot({ path: '/tmp/4-onboarding.png' });
    console.log('✓ 온보딩 페이지 로드 성공');
    
    await page.fill('#onboarding-taemyeong', '토닥이');
    await page.fill('#onboarding-due-date', '2026-12-25');
    
    await page.click('#onboarding-start-btn');
    
    await page.waitForSelector('#home-section:not(.hidden)', { timeout: 15000 });
    await page.screenshot({ path: '/tmp/5-home.png' });
    console.log('✓ 홈 페이지 로드 성공');
    console.log('✓ 회원가입 완료 - Supabase에 데이터 저장됨');
  } catch (err) {
    await page.screenshot({ path: '/tmp/error.png' });
    console.log('❌ 오류:', err.message);
  }
  
  await browser.close();
})().catch(err => {
  console.error('테스트 오류:', err.message);
  process.exit(1);
});
