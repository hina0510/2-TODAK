import { chromium } from 'playwright';
import path from 'path';

async function test() {
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    page.setViewportSize({ width: 390, height: 844 });

    await page.goto('http://localhost:8000', { waitUntil: 'load', timeout: 30000 });
    console.log('✓ 페이지 로드됨');

    // 가이드 섹션 활성화
    await page.evaluate(() => {
      document.getElementById('guide-section')?.classList.remove('hidden');
      document.getElementById('login-section')?.classList.add('hidden');
    });
    console.log('✓ 가이드 섹션 활성화됨');

    // 상세 모달 HTML 확인
    const detailModalExists = await page.evaluate(() => {
      return !!document.getElementById('guide-detail-modal-overlay');
    });
    console.log('✓ 상세 모달 HTML 존재:', detailModalExists);

    // 상세 모달 CSS 클래스 확인
    const modalInfo = await page.evaluate(() => {
      const el = document.getElementById('guide-detail-modal-overlay');
      if (!el) return null;
      return {
        classes: el.className,
        childModals: el.querySelectorAll('.modal--guide-detail').length
      };
    });
    console.log('✓ 모달 정보:', modalInfo);

    // 가이드 카드 클릭
    const cards = await page.locator('.guide-detail-card').count();
    console.log('✓ 가이드 카드 개수:', cards);

    if (cards > 0) {
      await page.locator('.guide-detail-card').first().click();
      await page.waitForTimeout(800);
      console.log('✓ 가이드 카드 클릭됨');

      // 가이드 모달 상태
      const guideModalOpen = await page.evaluate(() => {
        return document.getElementById('guide-modal-overlay')?.classList.contains('active');
      });
      console.log('✓ 가이드 모달 열림:', guideModalOpen);

      if (guideModalOpen) {
        // 가이드 모달 내 섹션 확인
        const sections = await page.locator('.guide-modal__section').count();
        console.log('✓ 가이드 모달 섹션 개수:', sections);

        if (sections > 0) {
          // 섹션 클릭
          await page.locator('.guide-modal__section').first().click();
          await page.waitForTimeout(500);
          console.log('✓ 모달 섹션 클릭됨');

          // 상세 모달 상태 확인
          const detailModalOpen = await page.evaluate(() => {
            return document.getElementById('guide-detail-modal-overlay')?.classList.contains('active');
          });
          console.log('✓ 상세 모달 열림:', detailModalOpen);

          if (detailModalOpen) {
            console.log('\n✓✓✓ 상세 모달 기능 성공! ✓✓✓\n');
            
            // 스크린샷
            const screenshotPath = path.join('/c/Users/win10/Desktop/claude/team2/2-TODAK', 'guide_detail_modal_working.png');
            await page.screenshot({ path: screenshotPath, fullPage: false });
            console.log('✓ 스크린샷 저장됨');

            // 제목 확인
            const title = await page.locator('#guide-detail-modal-title').textContent();
            console.log('✓ 모달 제목: "' + title + '"');

            // 상세 섹션 개수
            const detailSections = await page.locator('.modal__body--guide-detail .guide-detail-section').count();
            console.log('✓ 상세 섹션 개수: ' + detailSections);

          } else {
            console.error('✗ 상세 모달이 열리지 않음');
          }
        }
      }
    }

    await browser.close();
  } catch (error) {
    console.error('오류:', error.message);
    if (browser) await browser.close();
  }
}

test();
