// HTML 요소 검증
const checkHTML = () => {
  const guideDetailModal = document.getElementById('guide-detail-modal-overlay');
  if (!guideDetailModal) {
    return { error: '상세 모달 HTML이 없습니다' };
  }

  const modal = guideDetailModal.querySelector('.modal--guide-detail');
  const header = guideDetailModal.querySelector('.modal__header--guide-detail');
  const body = guideDetailModal.querySelector('.modal__body--guide-detail');
  const title = document.getElementById('guide-detail-modal-title');
  const sections = guideDetailModal.querySelectorAll('.guide-detail-section');

  return {
    detailModalExists: !!guideDetailModal,
    modalExists: !!modal,
    headerExists: !!header,
    bodyExists: !!body,
    titleExists: !!title,
    sectionCount: sections.length,
    sectionTitles: Array.from(sections).map(s => s.querySelector('.guide-detail-title')?.textContent)
  };
};

// CSS 검증
const checkCSS = () => {
  const stylesheet = Array.from(document.styleSheets).find(sheet => 
    sheet.href?.includes('common.css')
  );

  if (!stylesheet) {
    return { error: 'common.css를 찾을 수 없습니다' };
  }

  const rules = Array.from(stylesheet.cssRules || []);
  const guideDetailRules = rules.filter(rule => 
    rule.selectorText?.includes('guide-detail') || rule.selectorText?.includes('modal--guide-detail')
  );

  return {
    cssRuleCount: guideDetailRules.length,
    hasModalGuideDetailStyle: guideDetailRules.some(r => r.selectorText?.includes('modal--guide-detail')),
    hasBodyGuideDetailStyle: guideDetailRules.some(r => r.selectorText?.includes('modal__body--guide-detail'))
  };
};

// JavaScript 함수 검증
const checkFunctions = () => {
  return {
    setupGuideDetailModalExists: typeof setupGuideDetailModal === 'function',
    showGuideDetailModalExists: typeof showGuideDetailModal === 'function',
    closeGuideDetailModalExists: typeof closeGuideDetailModal === 'function',
    setupGuideDetailModalCloseExists: typeof setupGuideDetailModalClose === 'function'
  };
};

console.log('=== HTML 검증 ===');
console.log(checkHTML());
console.log('\n=== CSS 검증 ===');
console.log(checkCSS());
console.log('\n=== JavaScript 함수 검증 ===');
console.log(checkFunctions());
