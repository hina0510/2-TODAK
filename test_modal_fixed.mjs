import { chromium } from 'playwright';
import path from 'path';

async function test() {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    page.setViewportSize({ width: 390, height: 844 });

    console.log('📱 앱 로드 중...');
    await page.goto('http://localhost:8000', { waitUntil: 'load', timeout: 30000 });
    console.log('✓ 페이지 로드됨\n');

    // 가이드 섹션 활성화
    await page.evaluate(() => {
      document.getElementById('guide-section')?.classList.remove('hidden');
      document.getElementById('login-section')?.classList.add('hidden');
    });
    console.log('✓ 가이드 섹션 활성화됨');

    const cards = await page.locator('.guide-detail-card').count();
    console.log('✓ 가이드 카드 개수:', cards, '\n');

    if (cards > 0) {
      console.log('🔹 가이드 카드 클릭...');
      await page.locator('.guide-detail-card').first().click();
      await page.waitForTimeout(800);
      console.log('✓ 가이드 카드 클릭됨');

      const guideModalOpen = await page.evaluate(() => {
        return document.getElementById('guide-modal-overlay')?.classList.contains('active');
      });
      console.log('✓ 가이드 모달 열림:', guideModalOpen);

      const sections = await page.locator('.modal__body--guide .guide-modal__section').count();
      console.log('✓ 가이드 모달 섹션 개수:', sections, '\n');

      if (guideModalOpen && sections > 0) {
        console.log('🔹 가이드 모달 섹션 클릭...');
        await page.locator('.modal__body--guide .guide-modal__section').first().click();
        await page.waitForTimeout(500);
        console.log('✓ 섹션 클릭됨\n');

        const detailModalOpen = await page.evaluate(() => {
          const modal = document.getElementById('guide-detail-modal-overlay');
          return modal?.classList.contains('active') || false;
        });
        
        console.log('✓ 상세 모달 열림:', detailModalOpen);

        if (detailModalOpen) {
          console.log('\n✅✅✅ 테스트 성공! ✅✅✅\n');
          
          const title = await page.locator('#guide-detail-modal-title').textContent();
          console.log('✓ 모달 제목:', title);

          const detailSections = await page.locator('.modal__body--guide-detail .guide-detail-section').count();
          console.log('✓ 상세 섹션 개수:', detailSections);

          const titles = await page.locator('.guide-detail-section .guide-detail-title').allTextContents();
          console.log('✓ 섹션 제목:');
          titles.forEach((t, i) => console.log('  ' + (i+1) + '. ' + t));

          const screenshotPath = path.join('/c/Users/win10/Desktop/claude/team2/2-TODAK', 'guide_detail_modal_working.png');
          await page.screenshot({ path: screenshotPath });
          console.log('\n✓ 스크린샷 저장됨');

        } else {
          console.error('✗ 상세 모달이 열리지 않음');
          
          const exists = await page.evaluate(() => !!document.getElementById('guide-detail-modal-overlay'));
          console.log('모달 HTML 존재:', exists);
          
          const hasClass = await page.evaluate(() => {
            const modal = document.getElementById('guide-detail-modal-overlay');
            return modal ? modal.className : 'none';
          });
          console.log('모달 클래스:', hasClass);
        }
      }
    }

    await page.waitForTimeout(2000);
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

test();
