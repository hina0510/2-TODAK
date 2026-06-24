const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }
  });

  try {
    console.log('🌐 앱 로드 중...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 0. 초기 상태 확인
    const onboardingActive = await page.locator('#onboarding-overlay.active').isVisible();
    console.log(`📍 onboarding-overlay.active: ${onboardingActive}`);

    const loginSection = await page.locator('#login-section').isVisible();
    console.log(`📍 login-section: ${loginSection}`);

    // 1. 초기 화면 스크린샷
    await page.screenshot({ path: 'screenshot-1-initial.png' });
    console.log('✓ 초기 화면 스크린샷 저장됨');

    // 2. Modal handle 확인
    const handle = await page.$('#onboarding-overlay .modal__handle');
    if (handle) {
      console.log('✓ Onboarding: modal__handle 존재함');
    }

    // 3. Onboarding close-btn 클릭
    const onboardingCloseBtn = await page.$('#onboarding-overlay .modal__close-btn');
    if (onboardingCloseBtn) {
      console.log('✓ Onboarding: modal__close-btn 존재함');

      // visibility 체크
      const isVisible = await page.isVisible('#onboarding-overlay .modal__close-btn');
      console.log(`  - 가시성: ${isVisible ? '보임' : '숨김'}`);

      // boundingBox 확인
      const bbox = await onboardingCloseBtn.boundingBox();
      console.log(`  - 위치: ${JSON.stringify(bbox)}`);

      // 버튼이 보이지 않으면 scroll 후 시도
      if (!isVisible) {
        console.log('  ⚠️ 버튼이 안보여서 page 컨텐츠 확인 중...');
        // evaluate로 버튼 정보 확인
        const btnInfo = await page.evaluate(() => {
          const btn = document.querySelector('#onboarding-overlay .modal__close-btn');
          if (!btn) return null;
          const rect = btn.getBoundingClientRect();
          const style = window.getComputedStyle(btn);
          return {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          };
        });
        console.log(`  - 버튼 정보: ${JSON.stringify(btnInfo)}`);
      } else {
        // 버튼을 강제로 클릭 (좌표 기반)
        await onboardingCloseBtn.click();
        await page.waitForTimeout(500);
        const hidden = await page.isHidden('#onboarding-overlay');
        if (hidden || !await page.$('.modal-overlay--center.active')) {
          console.log('✓ Onboarding close-btn 클릭 → 모달 닫힘 ✓');
        }
      }
      await page.screenshot({ path: 'screenshot-2-after-close.png' });
    }

    // 4. Birth modal 열기
    const statusBirthBtn = await page.$('#status-birth');
    if (statusBirthBtn) {
      await statusBirthBtn.click();
      await page.waitForTimeout(500);

      // 5. Birth modal의 modal__handle 확인
      const birthHandle = await page.$('#birth-registration-overlay .modal__handle');
      if (birthHandle) {
        console.log('✓ Birth: modal__handle 존재함');
      }

      // 6. Birth close-btn 확인
      const birthCloseBtn = await page.$('#birth-registration-overlay .modal__close-btn');
      if (birthCloseBtn) {
        console.log('✓ Birth: modal__close-btn 존재함');
      }

      // 7. Birth datetime input 확인
      const datetimeInput = await page.$('#birth-datetime');
      if (datetimeInput) {
        console.log('✓ Birth: datetime input 존재함');

        // 8. datetime input이 input-field--date 클래스를 가지고 있는지 확인
        const hasDateClass = await page.$('#birth-datetime.input-field--date');
        if (hasDateClass) {
          console.log('✓ Birth: datetime input에 input-field--date 클래스 있음');
        }
      }

      // 9. datetime 아이콘 확인
      const datetimeIcon = await page.$('#birth-registration-overlay .input-wrapper__icon');
      if (datetimeIcon) {
        console.log('✓ Birth: datetime icon 존재함');

        // 10. datetime 아이콘 클릭 테스트
        await datetimeIcon.click();
        await page.waitForTimeout(300);
        console.log('✓ Birth: datetime icon 클릭 가능함');
      }

      await page.screenshot({ path: 'screenshot-3-birth-modal.png' });
      console.log('✓ Birth 모달 스크린샷 저장됨');

      // 11. Birth close-btn 클릭
      if (birthCloseBtn) {
        await birthCloseBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ Birth close-btn 클릭됨');
      }
    }

    // 12. Growth Stage modal 테스트
    const characterArea = await page.$('.character-area');
    if (characterArea) {
      await characterArea.click();
      await page.waitForTimeout(500);

      const growthHandle = await page.$('#growth-stage-overlay .modal__handle');
      if (growthHandle) {
        console.log('✓ Growth Stage: modal__handle 존재함');
      }

      const growthCloseBtn = await page.$('#growth-stage-overlay .modal__close-btn');
      if (growthCloseBtn) {
        console.log('✓ Growth Stage: modal__close-btn 존재함');
      }

      await page.screenshot({ path: 'screenshot-4-growth-stage.png' });
    }

    console.log('\n✅ 모든 테스트 완료!');
    console.log('📸 스크린샷:');
    console.log('  - screenshot-1-initial.png');
    console.log('  - screenshot-2-after-close.png');
    console.log('  - screenshot-3-birth-modal.png');
    console.log('  - screenshot-4-growth-stage.png');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
})();
