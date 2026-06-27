import { chromium } from 'playwright';
import path from 'path';

async function test() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
  console.log('✓ 앱 로드됨');

  // 가이드 섹션 직접 활성화
  await page.evaluate(() => {
    document.getElementById('guide-section').classList.remove('hidden');
    document.getElementById('login-section').classList.add('hidden');
  });
  console.log('✓ 가이드 섹션 활성화');

  await page.waitForTimeout(300);

  // 가이드 카드 클릭 (모달 열기)
  const guideCard = await page.locator('.guide-detail-card').first();
  await guideCard.click();
  console.log('✓ 가이드 카드 클릭');

  await page.waitForTimeout(500);

  // 가이드 모달 확인
  const isGuideModalOpen = await page.evaluate(() => {
    return document.getElementById('guide-modal-overlay').classList.contains('active');
  });
  console.log('✓ 가이드 모달 열림:', isGuideModalOpen);

  await page.waitForTimeout(500);

  // 모달 섹션 클릭
  const modalSection = await page.locator('.guide-modal__section').first();
  await modalSection.click();
  console.log('✓ 모달 섹션 클릭');

  await page.waitForTimeout(500);

  // 상세 모달 확인
  const isDetailModalOpen = await page.evaluate(() => {
    return document.getElementById('guide-detail-modal-overlay')?.classList.contains('active') || false;
  });
  console.log('✓ 상세 모달 열림:', isDetailModalOpen);

  if (isDetailModalOpen) {
    console.log('✓✓✓ 상세 모달 테스트 성공! ✓✓✓');

    // 상세 모달 스크린샷
    const screenshotPath = path.join('/c/Users/win10/Desktop/claude/team2/2-TODAK', 'guide_detail_modal_success.png');
    await page.screenshot({ path: screenshotPath });
    console.log('✓ 스크린샷 저장: ' + screenshotPath);

    // 제목 확인
    const title = await page.locator('#guide-detail-modal-title').textContent();
    console.log('✓ 모달 제목:', title);

    // 섹션 개수 확인
    const sections = await page.locator('.modal__body--guide-detail .guide-detail-section').count();
    console.log('✓ 상세 섹션 수:', sections);

    // 각 섹션 제목 확인
    const sectionTitles = await page.locator('.guide-detail-section .guide-detail-title').allTextContents();
    console.log('✓ 섹션 제목들:', sectionTitles);

  } else {
    console.error('✗ 상세 모달이 열리지 않음');
    
    // 디버깅 정보
    const guideDetailModal = await page.evaluate(() => {
      const el = document.getElementById('guide-detail-modal-overlay');
      if (!el) return 'HTML 요소가 없음';
      return {
        exists: !!el,
        classList: el.className,
        visible: el.classList.contains('active')
      };
    });
    console.log('디버깅 정보:', guideDetailModal);
  }

  await page.waitForTimeout(3000);
  await browser.close();
}

test().catch(console.error);
