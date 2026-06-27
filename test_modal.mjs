import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function test() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  try {
    const page = await browser.newPage();
    page.setViewportSize({ width: 390, height: 844 });

    await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
    console.log('✓ 앱 로드됨');

    // 가이드 네비게이션 버튼 클릭
    const guideNavBtn = await page.locator('[data-goto="guide-section"]').first();
    await guideNavBtn.click();
    await page.waitForTimeout(500);
    console.log('✓ 가이드 섹션으로 이동');

    // 가이드 카드 클릭 (모달 열기)
    const guideCard = await page.locator('.guide-detail-card').first();
    await guideCard.click();
    await page.waitForTimeout(500);
    console.log('✓ 가이드 카드 클릭');

    // 모달이 열렸는지 확인
    const guideModal = await page.locator('#guide-modal-overlay.active');
    const isModalVisible = await guideModal.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isModalVisible) {
      console.log('✓ 가이드 모달 열림');

      // 모달 내 섹션 클릭
      const modalSection = await page.locator('.guide-modal__section').first();
      await modalSection.click();
      await page.waitForTimeout(500);
      console.log('✓ 모달 섹션 클릭');

      // 상세 모달이 열렸는지 확인
      const detailModal = await page.locator('#guide-detail-modal-overlay.active');
      const isDetailVisible = await detailModal.isVisible({ timeout: 2000 }).catch(() => false);

      if (isDetailVisible) {
        console.log('✓ 상세 모달 열림 - 테스트 성공!');
        
        // 스크린샷
        const screenshotPath = path.join('/c/Users/win10/Desktop/claude/team2/2-TODAK', 'guide_detail_modal.png');
        await page.screenshot({ path: screenshotPath });
        console.log('✓ 스크린샷 저장: ' + screenshotPath);

        // 제목 확인
        const title = await page.locator('#guide-detail-modal-title').textContent();
        console.log('✓ 모달 제목: ' + title);

        // 섹션 개수 확인
        const sections = await page.locator('.modal__body--guide-detail .guide-detail-section').count();
        console.log('✓ 상세 섹션 수: ' + sections);

        // 닫기 버튼 테스트
        const closeBtn = await page.locator('#guide-detail-modal-overlay .modal__close-btn');
        await closeBtn.click();
        await page.waitForTimeout(300);
        
        const stillVisible = await detailModal.isVisible({ timeout: 500 }).catch(() => false);
        if (!stillVisible) {
          console.log('✓ 모달 닫기 성공');
        }
      } else {
        console.error('✗ 상세 모달이 열리지 않음');
      }
    } else {
      console.error('✗ 가이드 모달이 열리지 않음');
    }

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

test();
