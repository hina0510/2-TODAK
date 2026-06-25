/* ==========================================================================
   supabase.js - Supabase 클라이언트 설정
   ========================================================================== */

(function() {
  // Supabase 설정 (임시 비활성화 - 새로운 프로젝트 생성 후 설정할 예정)
  // 새 Supabase 프로젝트 생성 후 아래 값들을 업데이트하세요
  var SUPABASE_URL = '';
  var SUPABASE_ANON_KEY = '';

  // Supabase SDK 로드 대기
  var attempts = 0;
  var maxAttempts = 50;

  function initSupabase() {
    attempts++;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.log('[TODAK] Supabase 설정이 없습니다. 새 프로젝트 생성 후 설정하세요.');
      return;
    }

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[TODAK] Supabase 초기화 성공');
      } catch (e) {
        console.warn('[TODAK] Supabase 초기화 실패:', e.message);
      }
    } else if (attempts < maxAttempts) {
      setTimeout(initSupabase, 100);
    } else {
      console.warn('[TODAK] Supabase SDK 로드 타임아웃');
    }
  }

  initSupabase();
})();
