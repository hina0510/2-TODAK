/* ==========================================================================
   script.js - TODAK SPA 메인 스크립트
   섹션 네비게이션 및 화면별 UI 로직
   ========================================================================== */


/* ------------------------------------------
   SPA 네비게이션
   ------------------------------------------ */

/**
 * 지정한 섹션을 표시하고 나머지를 모두 숨깁니다.
 * @param {string} sectionId - 표시할 섹션의 ID
 */
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(function(section) {
    section.classList.add('hidden');
  });
  var target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
}

/* data-goto 속성이 있는 모든 버튼에 이벤트 위임으로 네비게이션 처리 */
document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-goto]');
  if (btn) {
    var targetId = btn.dataset.goto;
    showSection(targetId);
  }
});


/* ------------------------------------------
   LOGIN SECTION
   ------------------------------------------ */

/* 비밀번호 표시/숨기기 토글 */
(function() {
  var toggleBtn = document.getElementById('pw-toggle');
  var pwInput = document.getElementById('login-password');
  if (!toggleBtn || !pwInput) return;

  toggleBtn.addEventListener('click', function() {
    var isHidden = pwInput.type === 'password';
    pwInput.type = isHidden ? 'text' : 'password';
    toggleBtn.classList.toggle('is-visible', isHidden);
  });
})();


/* 로그인 폼 제출 (더미 — Supabase 연동 전) */
(function() {
  var form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;

    if (!email) {
      showToast('이메일을 입력해주세요.');
      return;
    }
    if (!password) {
      showToast('비밀번호를 입력해주세요.');
      return;
    }

    /* Phase 10에서 Supabase Auth 로그인으로 교체 */
    showToast('로그인 기능은 준비 중입니다.');
  });
})();


/* 비밀번호 찾기 (더미) */
(function() {
  var forgotBtn = document.querySelector('.forgot-pw-btn');
  if (!forgotBtn) return;

  forgotBtn.addEventListener('click', function() {
    showToast('비밀번호 찾기 기능은 준비 중입니다.');
  });
})();


/* ------------------------------------------
   ONBOARDING SECTION
   ------------------------------------------ */

(function() {
  var section = document.getElementById('onboarding-section');
  if (!section) return;

  /* --- 역할 선택 (엄마 / 보호자) --- */
  var roleMomBtn      = document.getElementById('role-mom');
  var roleGuardianBtn = document.getElementById('role-guardian');

  function selectRole(role) {
    var isMom = role === 'mom';

    section.classList.toggle('guardian-mode', !isMom);

    roleMomBtn.classList.toggle('selected', isMom);
    roleMomBtn.setAttribute('aria-pressed', String(isMom));

    roleGuardianBtn.classList.toggle('selected', !isMom);
    roleGuardianBtn.setAttribute('aria-pressed', String(!isMom));
  }

  if (roleMomBtn)      roleMomBtn.addEventListener('click',      function() { selectRole('mom'); });
  if (roleGuardianBtn) roleGuardianBtn.addEventListener('click', function() { selectRole('guardian'); });

  /* --- 현재 상태 선택 (임신 / 출산) --- */
  var statusPregnantBtn = document.getElementById('status-pregnant');
  var statusBirthBtn    = document.getElementById('status-birth');
  var dueDateLabel      = document.getElementById('due-date-label');

  function selectStatus(status) {
    var isPregnant = status === 'pregnant';

    statusPregnantBtn.classList.toggle('selected', isPregnant);
    statusPregnantBtn.setAttribute('aria-pressed', String(isPregnant));

    statusBirthBtn.classList.toggle('selected', !isPregnant);
    statusBirthBtn.setAttribute('aria-pressed', String(!isPregnant));

    if (dueDateLabel) {
      dueDateLabel.textContent = isPregnant ? '출산 예정일' : '출산일';
    }
  }

  if (statusPregnantBtn) statusPregnantBtn.addEventListener('click', function() { selectStatus('pregnant'); });
  if (statusBirthBtn)    statusBirthBtn.addEventListener('click',    function() { selectStatus('birth'); });

  /* --- 시작하기 버튼 (Phase 10에서 Supabase 연동으로 교체) --- */
  var startBtn = document.getElementById('onboarding-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      showSection('home-section');
    });
  }
})();
