/* ==========================================================================
   supabase.js - Supabase 클라이언트 설정
   Phase 9에서 실제 URL과 Key를 입력하여 연결
   ========================================================================== */

/* Supabase 프로젝트 설정값 (Phase 9에서 실제 값으로 교체) */
const SUPABASE_URL = 'https://ozpfycpnckeqsknnthfi.supabase.co/';
const SUPABASE_ANON_KEY = 'sb_publishable_IHHZVcUWy01f0LNhQr7uKg_lcjg7fG4';

/* Supabase 클라이언트 초기화 */
let supabase = null;
try {
  const { createClient } = window.supabase;
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('[TODAK] Supabase 초기화 실패 — 더미 모드로 동작합니다.', e.message);
}

/* ----------------------------------------
   인증 관련 함수 (Phase 10에서 구현)
   ---------------------------------------- */

/* 회원가입 */
// async function signUp(email, password) { ... }

/* 로그인 */
// async function signIn(email, password) { ... }

/* 로그아웃 */
// async function signOut() { ... }

/* 현재 사용자 가져오기 */
// async function getCurrentUser() { ... }

/* ----------------------------------------
   데이터베이스 관련 함수 (Phase 11~14에서 구현)
   ---------------------------------------- */

/* profiles 테이블 */
/* children 테이블 */
/* guardians 테이블 */
/* records 테이블 */
