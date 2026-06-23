/* ==========================================================================
   utils.js - TODAK 공통 유틸리티 함수
   모든 페이지에서 공통으로 사용하는 함수 모음
   ========================================================================== */

/* ----------------------------------------
   페이지 이동
   ---------------------------------------- */

/**
 * 페이지 이동
 * @param {string} url - 이동할 페이지 경로
 */
function goTo(url) {
  window.location.href = url;
}

/**
 * 뒤로가기
 */
function goBack() {
  window.history.back();
}

/* ----------------------------------------
   날짜 유틸리티
   ---------------------------------------- */

/**
 * 날짜를 'YYYY.MM.DD' 형식으로 포맷
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 날짜를 'MM월 DD일' 형식으로 포맷
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateKo(date) {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}월 ${day}일`;
}

/**
 * D-Day 계산 (예정일까지 남은 날)
 * @param {string} dueDate - 예정일 (YYYY-MM-DD)
 * @returns {number} 양수: 남은 날, 음수: 지난 날
 */
function calcDDay(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = due - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * 아기 나이 계산 (개월 수)
 * @param {string} birthDate - 출생일 (YYYY-MM-DD)
 * @returns {object} { months, days }
 */
function calcBabyAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  const days = today.getDate() - birth.getDate();
  if (days < 0) months -= 1;
  return { months: Math.max(0, months), days: Math.max(0, days) };
}

/**
 * 임신 주차 계산
 * @param {string} dueDate - 예정일 (YYYY-MM-DD)
 * @returns {number} 현재 임신 주차
 */
function calcPregnancyWeek(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  /* 예정일 기준 280일(40주) 전이 마지막 생리일 */
  const lmp = new Date(due - 280 * 24 * 60 * 60 * 1000);
  const diff = today - lmp;
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(40, week));
}

/**
 * 임신 스테이지 반환
 * @param {number} week - 임신 주차
 * @returns {object} { stage, name }
 */
function getPregnancyStage(week) {
  if (week >= 4 && week <= 11)  return { stage: 1, name: '초기 적응기' };
  if (week >= 12 && week <= 19) return { stage: 2, name: '안정기' };
  if (week >= 20 && week <= 27) return { stage: 3, name: '태동기' };
  if (week >= 28 && week <= 35) return { stage: 4, name: '성장기' };
  return { stage: 5, name: '출산 준비기' };
}

/**
 * 출산 후 스테이지 반환
 * @param {number} months - 개월 수
 * @returns {object} { stage, name }
 */
function getBirthStage(months) {
  if (months < 4)  return { stage: 1, name: '신생아' };
  if (months < 7)  return { stage: 2, name: '4~6개월' };
  return { stage: 3, name: '7~9개월' };
}

/* ----------------------------------------
   Toast 메시지
   ---------------------------------------- */

/**
 * 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {number} duration - 표시 시간 (ms), 기본 2000
 */
function showToast(message, duration = 2000) {
  /* 기존 토스트 제거 */
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  /* 애니메이션 */
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  });
}

/* ----------------------------------------
   로컬 스토리지 유틸리티
   ---------------------------------------- */

/**
 * 로컬 스토리지에 저장 (JSON 직렬화)
 * @param {string} key
 * @param {any} value
 */
function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

/**
 * 로컬 스토리지에서 가져오기 (JSON 파싱)
 * @param {string} key
 * @returns {any}
 */
function getLocal(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.warn('localStorage 읽기 실패:', e);
    return null;
  }
}

/**
 * 로컬 스토리지에서 삭제
 * @param {string} key
 */
function removeLocal(key) {
  localStorage.removeItem(key);
}

/* ----------------------------------------
   모달 유틸리티
   ---------------------------------------- */

/**
 * 모달 열기
 * @param {string} overlayId - 모달 오버레이 요소 ID
 */
function openModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * 모달 닫기
 * @param {string} overlayId - 모달 오버레이 요소 ID
 */
function closeModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ----------------------------------------
   바텀 네비게이션 활성화
   ---------------------------------------- */

/**
 * 현재 페이지에 맞는 바텀 네비 아이템 활성화
 * @param {string} currentPage - 현재 페이지명 ('home'|'record'|'guide'|'mypage')
 */
function activateBottomNav(currentPage) {
  const items = document.querySelectorAll('.bottom-nav__item');
  items.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === currentPage) {
      item.classList.add('active');
    }
  });
}
