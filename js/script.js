/* ==========================================================================
   script.js - TODAK SPA 메인 스크립트
   섹션 네비게이션 및 화면별 UI 로직
   ========================================================================== */

/* ------------------------------------------
   Toast 메시지 유틸리티
   ------------------------------------------ */

/**
 * 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 */
function showToast(message) {
  var existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  var toast = document.createElement("div");
  toast.className = "toast show";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
    }, 200);
  }, 2000);
}

/* ------------------------------------------
   SPA 네비게이션
   ------------------------------------------ */

/**
 * 지정한 섹션을 표시하고 나머지를 모두 숨깁니다.
 * @param {string} sectionId - 표시할 섹션의 ID
 */
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(function (section) {
    section.classList.add("hidden");
  });
  var target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  /* 네비게이션 활성 상태 업데이트 */
  var navItems = document.querySelectorAll(".bottom-nav__item");
  navItems.forEach(function (item) {
    var isActive = item.dataset.goto === sectionId;
    item.classList.toggle("active", isActive);
  });

  /* 홈 섹션이 표시될 때 아이 정보 업데이트 */
  if (sectionId === "home-section") {
    updateHomeDisplay();
    initTodakSection();
  }

  /* 마이페이지 섹션이 표시될 때 사용자 정보 로드 */
  if (sectionId === "mypage-section") {
    loadMypageUserInfo();
    if (_currentChild) {
      updateMypageChildInfo();
    }
  }

  /* 온보딩 섹션이 표시될 때 사용자 역할 확인 */
  if (sectionId === "onboarding-section") {
    initOnboarding();
  }

  /* 토닥 섹션이 표시될 때 미션 로드 */
  if (sectionId === "todak-section") {
    if (window.loadTodakMissions) {
      window.loadTodakMissions().then(function() {
        console.log("[토닥] 미션 로드 완료");
        initTodakSection();
      }).catch(function(err) {
        console.error("[토닥] 미션 로드 실패:", err);
        initTodakSection();
      });
    } else {
      initTodakSection();
    }
  }

  /* 가이드 섹션이 표시될 때 가이드 로드 */
  if (sectionId === "guide-section") {
    initGuideSection();
  }

  /* Record 섹션이 표시될 때 오늘 날짜 기록 로드 */
  if (sectionId === "record-section") {
    initRecordSection();
  }

  /* 성장기록상세 섹션이 표시될 때 최신 기록 로드 */
  if (sectionId === "growth-detail-section") {
    initGrowthDetailSection();
  }
}

/* data-goto 속성이 있는 모든 버튼에 이벤트 위임으로 네비게이션 처리 */
document.addEventListener("click", function (e) {
  var btn = e.target.closest("[data-goto]");
  if (btn) {
    var targetId = btn.dataset.goto;
    showSection(targetId);
  }
});

/* ------------------------------------------
   LOGIN SECTION
   ------------------------------------------ */

/* 비밀번호 표시/숨기기 토글 */
(function () {
  var toggleBtn = document.getElementById("pw-toggle");
  var pwInput = document.getElementById("login-password");
  if (!toggleBtn || !pwInput) return;

  toggleBtn.addEventListener("click", function () {
    var isHidden = pwInput.type === "password";
    pwInput.type = isHidden ? "text" : "password";
    toggleBtn.classList.toggle("is-visible", isHidden);
  });
})();

/* ------------------------------------------
   ROLE SELECTION SECTION
   ------------------------------------------ */

(function () {
  var section = document.getElementById("role-selection-section");
  if (!section) return;

  var roleCards = section.querySelectorAll(".role-card");

  /* 카드 단일 선택 */
  roleCards.forEach(function (card) {
    card.addEventListener("click", function () {
      roleCards.forEach(function (c) {
        c.classList.remove("role-card--selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("role-card--selected");
      card.setAttribute("aria-pressed", "true");
    });
  });

  /* 뒤로가기 */
  var backBtn = document.getElementById("role-sel-back");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      showSection("login-section");
    });
  }

  /* 다음 — 선택 역할을 회원가입 폼에 반영 후 signup-section 이동 */
  var nextBtn = document.getElementById("role-sel-next");
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var selected = section.querySelector(".role-card--selected");
      var role = selected ? selected.dataset.role : "mom";
      var isMom = role !== "guardian";

      var signupRoleHidden = document.getElementById("signup-role-value");
      if (signupRoleHidden) signupRoleHidden.value = role;

      showSection("signup-section");
    });
  }
})();

/* ------------------------------------------
   ONBOARDING SECTION
   ------------------------------------------ */

(function () {
  var section = document.getElementById("onboarding-section");
  if (!section) return;

  var _guardianChildId = null;

  /* --- 역할 선택 (엄마 / 보호자) --- */
  var roleMomBtn = document.getElementById("role-mom");
  var roleGuardianBtn = document.getElementById("role-guardian");

  function setupInviteCodeValidation() {
    var momCodeInput = document.getElementById("onboarding-mom-code");
    var guardianSection = document.querySelector(".form-section--guardian-only");

    if (!momCodeInput || !guardianSection) return;

    // 검증 버튼 생성 (아직 없으면)
    var existingBtn = guardianSection.querySelector(".invite-code-verify-btn");
    if (existingBtn) return;

    var verifyBtn = document.createElement("button");
    verifyBtn.type = "button";
    verifyBtn.className = "invite-code-verify-btn";
    verifyBtn.textContent = "확인";
    verifyBtn.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      padding: 8px 16px;
      background-color: var(--color-primary-magenta);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      z-index: 10;
    `;

    // input-group을 position: relative로 변경
    momCodeInput.parentElement.style.position = "relative";
    momCodeInput.style.paddingRight = "70px";
    momCodeInput.parentElement.appendChild(verifyBtn);

    // 에러 메시지 요소 생성
    var errorMsg = document.createElement("div");
    errorMsg.className = "invite-code-error";
    errorMsg.style.cssText = `
      font-size: 12px;
      color: #D94F8A;
      margin-top: 6px;
      display: none;
    `;
    momCodeInput.parentElement.parentElement.appendChild(errorMsg);

    verifyBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      var code = momCodeInput.value.trim();

      if (!code) {
        errorMsg.textContent = "초대코드를 입력해주세요.";
        errorMsg.style.display = "block";
        return;
      }

      // 검증 로직
      var childId = await validateInviteCode(code);
      if (childId) {
        _guardianChildId = childId;
        errorMsg.style.display = "none";
        verifyBtn.style.backgroundColor = "#2F4B7C";
        verifyBtn.textContent = "확인됨";
        momCodeInput.style.borderColor = "#D94F8A";
      } else {
        _guardianChildId = null;
        errorMsg.textContent = "올바르지 않은 초대코드입니다.";
        errorMsg.style.display = "block";
        verifyBtn.style.backgroundColor = "#D94F8A";
        verifyBtn.textContent = "확인";
        momCodeInput.style.borderColor = "#D94F8A";
      }
    });
  }

  function selectRole(role) {
    var isMom = role === "mom";

    section.classList.toggle("guardian-mode", !isMom);

    roleMomBtn.classList.toggle("selected", isMom);
    roleMomBtn.setAttribute("aria-pressed", String(isMom));

    roleGuardianBtn.classList.toggle("selected", !isMom);
    roleGuardianBtn.setAttribute("aria-pressed", String(!isMom));

    if (isMom) {
      // 엄마 선택 시 초대코드 상태 초기화
      _guardianChildId = null;
      var momCodeInput = document.getElementById("onboarding-mom-code");
      if (momCodeInput) {
        momCodeInput.value = "";
        var errorMsg = document.querySelector(".invite-code-error");
        if (errorMsg) errorMsg.style.display = "none";
      }
    } else {
      // 보호자 선택 시 검증 버튼 설정
      setTimeout(setupInviteCodeValidation, 0);
    }
  }

  if (roleMomBtn)
    roleMomBtn.addEventListener("click", function () {
      selectRole("mom");
    });
  if (roleGuardianBtn)
    roleGuardianBtn.addEventListener("click", function () {
      selectRole("guardian");
    });

  /* --- 현재 상태 선택 (임신 / 출산) --- */
  var statusPregnantBtn = document.getElementById("status-pregnant");
  var statusBirthBtn = document.getElementById("status-birth");
  var dueDateLabel = document.getElementById("due-date-label");
  var pregnancyFields = document.querySelectorAll(
    ".form-section--pregnancy-only",
  );
  var birthFields = document.querySelectorAll(".form-section--birth-only");

  function selectStatus(status) {
    var isPregnant = status === "pregnant";

    statusPregnantBtn.classList.toggle("selected", isPregnant);
    statusPregnantBtn.setAttribute("aria-pressed", String(isPregnant));

    statusBirthBtn.classList.toggle("selected", !isPregnant);
    statusBirthBtn.setAttribute("aria-pressed", String(!isPregnant));

    if (dueDateLabel) {
      dueDateLabel.textContent = isPregnant ? "출산 예정일" : "출산일";
    }

    pregnancyFields.forEach(function (field) {
      field.classList.toggle("hidden", !isPregnant);
    });
    birthFields.forEach(function (field) {
      field.classList.toggle("hidden", isPregnant);
    });
  }

  if (statusPregnantBtn)
    statusPregnantBtn.addEventListener("click", function () {
      selectStatus("pregnant");
    });
  if (statusBirthBtn)
    statusBirthBtn.addEventListener("click", function () {
      selectStatus("birth");
    });

  /* --- 시작하기 버튼 (Phase 10에서 Supabase 연동으로 교체) --- */
  var startBtn = document.getElementById("onboarding-start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", function () {
      showSection("home-section");
    });
  }

  // Onboarding 닫기 버튼
  var onboardingCloseBtn = document.querySelector(
    "#onboarding-overlay .modal__close-btn",
  );
  if (onboardingCloseBtn) {
    onboardingCloseBtn.addEventListener("click", function () {
      showSection("home-section");
    });
  }

  /* --- Home Screen: 상태 기반 콘텐츠 관리 --- */
  var homeSection = document.getElementById("home-section");
  if (homeSection) {
    // Birth 임시 데이터 객체 (나중에 Supabase로 교체 가능)
    var birthData = {
      childName: "",
      gender: "",
      birthDateTime: "",
      height: "",
      weight: "",
    };

    // 상태 기반 데이터 구조
    var homeScreenData = {
      pregnancy: {
        headerLabel: "아이와 함께하는 날",
        headerTitle: "건강하게 자라고 있는 다온이",
        dday: "D-120",
        characterImage: "image/preg3.png",
        stageInfoNumber: "22",
        stageInfoText: "22주차: 태동기",
        missionStatus: "진행중 1/3",
        missions: [
          {
            icon: "completed",
            text: "20분 이상 가볍게 걷기",
            status: "완료",
            time: "09:30 AM",
          },
          {
            icon: "pending",
            text: "철분이 포함된 식사 챙기기",
            status: "예정",
            time: "02:00 PM",
          },
        ],
        quickActions: [
          {
            icon: "edit",
            title: "성장 기록",
            desc: "지난 기록 12개",
          },
          {
            icon: "calendar",
            title: "정기 검진",
            desc: "D-5 남음",
          },
        ],
        recommendationTitle: "임신 중 건강한 생활",
        recommendationDesc: "임신 중 필요한 영양소와 운동 가이드",
      },
      birth: {
        headerLabel: "우리아이 생후 143일",
        headerTitle: "건강하게 자라고 있는 다온이",
        dday: "143일째",
        characterImage: "image/baby1.png",
        leftCardTitle: "몸무게",
        leftCardValue: "3.4kg",
        leftCardDesc: "",
        rightCardTitle: "수유",
        rightCardValue: "6회/일",
        rightCardDesc: "",
        stageInfoNumber: "143",
        stageInfoText: "현재 143일",
        missionStatus: "진행중 2/3",
        missions: [
          {
            icon: "completed",
            text: "신생아 배꼽 소독하기",
            status: "완료",
            time: "08:00 AM",
          },
          {
            icon: "pending",
            text: "터미타임 1분 도전",
            status: "진행중",
            time: "02:00 PM",
          },
        ],
        quickActions: [
          {
            icon: "edit",
            title: "성장 기록",
            desc: "지난 기록 5개",
          },
          {
            icon: "photo",
            title: "정기 검진",
            desc: "D-5 남음",
          },
        ],
        recommendationTitle: "엄마, 아빠도 쉼표가 필요해요",
        recommendationDesc: "산후 회복을 위한 5분 스트레칭 가이드",
      },
    };
    

    // Home 콘텐츠 업데이트 함수
    window.updateHomeContent = function(mode) {
      var data = homeScreenData[mode];

      // Header Card
      document.getElementById("header-label").textContent = data.headerLabel;
      document.getElementById("header-title").textContent = data.headerTitle;
      document.getElementById("header-dday").textContent = data.dday;

      // Character Image
      document.getElementById("character-image").src = data.characterImage;

      // Side Cards
      document.getElementById("left-card-title").textContent =
        data.leftCardTitle;
      document.getElementById("left-card-value").textContent =
        data.leftCardValue;
      document.getElementById("left-card-desc").textContent = data.leftCardDesc;

      document.getElementById("right-card-title").textContent =
        data.rightCardTitle;
      document.getElementById("right-card-value").textContent =
        data.rightCardValue;

      // Stage Info Card

      document.getElementById("stage-info-text").textContent =
        data.stageInfoText;

      // TODAK Missions
      document.getElementById("mission-status").textContent =
        data.missionStatus;
      renderMissionList("mission-list", data.missions);

      // Recommendation Card
      document.getElementById("rec-title").textContent =
        data.recommendationTitle;
      document.getElementById("rec-desc").textContent = data.recommendationDesc;

      // 출산 탭에서만 사이드 카드 표시
      var characterArea = document.getElementById("character-area");
      if (characterArea) {
        characterArea.classList.toggle("birth-mode", mode === "birth");
      }
    };

    // ===== Birth Registration Modal 로직 =====
    var birthModal = document.getElementById("birth-registration-overlay");
    var birthRegisterBtn = document.getElementById("birth-register-btn");
    var genderButtons = document.querySelectorAll(
      "#birth-registration-overlay .btn-radio",
    );

    // Gender 버튼 선택
    genderButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        genderButtons.forEach(function (b) {
          b.classList.remove("selected");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("selected");
        btn.setAttribute("aria-pressed", "true");
        birthData.gender = btn.dataset.gender;
      });
    });

    // Birth 탭 (출산 토글 버튼) 클릭 → 모달 열기
    function openBirthModal() {
      birthModal.classList.add("active");
    }

    // 모달 닫기
    function closeBirthModal() {
      birthModal.classList.remove("active");
    }

    // Birth 폼 Validation
    function validateBirthForm() {
      var childName = document.getElementById("birth-child-name").value.trim();
      var gender = birthData.gender;
      var birthDateTime = document.getElementById("birth-datetime").value;

      if (!childName) {
        showToast("아이 이름을 입력해주세요.");
        return false;
      }
      if (!gender) {
        showToast("성별을 선택해주세요.");
        return false;
      }
      if (!birthDateTime) {
        showToast("태어난 날짜 및 시간을 입력해주세요.");
        return false;
      }

      return true;
    }

    // Birth 데이터 저장 (임시)
    function saveBirthData() {
      birthData.childName = document
        .getElementById("birth-child-name")
        .value.trim();
      birthData.birthDateTime = document.getElementById("birth-datetime").value;
      birthData.height = document.getElementById("birth-height").value;
      birthData.weight = document.getElementById("birth-weight").value;
    }

    // Birth Register 버튼 클릭
    if (birthRegisterBtn) {
      birthRegisterBtn.addEventListener("click", async function () {
        if (validateBirthForm()) {
          // Validation 통과
          saveBirthData();

          try {
            if (!supabase || !supabase.auth) {
              showToast("Supabase가 초기화되지 않았습니다.");
              return;
            }

            var { data: authData, error: authErr } = await supabase.auth.getUser();
            if (authErr || !authData || !authData.user) {
              showToast("인증 정보를 조회할 수 없습니다.");
              return;
            }

            var userId = authData.user.id;
            var { data: userData, error: userErr } = await supabase
              .from("users")
              .select("child_id")
              .eq("id", userId)
              .single();

            if (userErr || !userData || !userData.child_id) {
              showToast("아이 정보를 조회할 수 없습니다.");
              return;
            }

            var childId = userData.child_id;
            var birthDate = document.getElementById("birth-datetime").value;
            var updateData = {
              baby_name: birthData.childName,
              birth_status: "birth",
              birth_date: birthDate,
              gender: birthData.gender,
              due_date: birthDate,
            };

            var { error: updateErr } = await supabase
              .from("children")
              .update(updateData)
              .eq("id", childId);

            if (updateErr) {
              throw updateErr;
            }

            _isBirthMode = true;
            _currentChild.baby_name = birthData.childName;
            _currentChild.birth_status = "birth";
            _currentChild.birth_date = birthDate;
            _currentChild.gender = birthData.gender;
            _currentChild.due_date = birthDate;

            closeBirthModal();
            updateHomeContent("birth");
            pregnancyToggles[0].classList.remove("active");
            pregnancyToggles[1].classList.add("active");
            showToast("출산 정보가 저장되었습니다.");
          } catch (err) {
            showToast(translateSupabaseError(err.message));
          }
        }
      });
    }

    // Birth Modal 닫기 버튼
    var birthCloseBtn = document.querySelector(
      "#birth-registration-overlay .modal__close-btn",
    );
    if (birthCloseBtn) {
      birthCloseBtn.addEventListener("click", closeBirthModal);
    }

    // Birth datetime 아이콘 클릭 → input 포커스
    var birthDatetimeInput = document.getElementById("birth-datetime");
    var birthDatetimeIcon = document.querySelector(
      "#birth-registration-overlay .input-wrapper__icon",
    );
    if (birthDatetimeIcon) {
      birthDatetimeIcon.addEventListener("click", function () {
        if (birthDatetimeInput) {
          birthDatetimeInput.focus();
          birthDatetimeInput.showPicker();
        }
      });
    }

    // 토글 버튼 이벤트
    var pregnancyToggles = document.querySelectorAll(
      ".pregnancy-birth-toggle .toggle-btn",
    );
    pregnancyToggles.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        // 1. 보호자는 탭 변경 불가 (읽기 전용)
        if (_currentUser && _currentUser.role === "guardian") {
          return;
        }

        // 2. 현재 active 탭을 다시 누른 경우
        if (btn.classList.contains("active")) {
          return;
        }

        var isPregnancy = index === 0;

        // 3. 출산 상태에서 임신 탭을 누른 경우
        if (isPregnancy && _isBirthMode) {
          showToast("출산 상태에서는 임신 탭으로 이동할 수 없습니다.");
          return;
        }

        // 4. 임신 상태에서 출산 탭을 누른 경우에만 모달 열기
        if (!isPregnancy && !_isBirthMode) {
          openBirthModal();
        }
      });
    });

    // 초기 로드 시 Pregnancy 콘텐츠 표시
    updateHomeContent("pregnancy");

    // ===== Growth Stage Modal 로직 =====
    var growthStageOverlay = document.getElementById("growth-stage-overlay");
    var growthStageCloseBtn = document.querySelector(
      "#growth-stage-overlay .modal__close-btn",
    );
    var characterArea = document.getElementById("character-area");
    function getCurrentGrowthStage() {
      var currentWeek = getWeekNumber();

      var currentStage = _growthStagesData[0];

      _growthStagesData.forEach(function (stage) {
        if (currentWeek >= stage.week) {
          currentStage = stage;
        }
    });
    return currentStage;
  }

    // Growth Stage Modal 열기
    function openGrowthStageModal(stageIndex) {
      var stage;
      var badgeText;

      if (_isBirthMode) {
        stage = getCurrentBirthStage();
        var daysAfterBirth = calculateDaysAfterBirth();
        badgeText = "생후 " + daysAfterBirth + "일";
      } else {
        stage = getCurrentGrowthStage();
        badgeText = getWeekNumber() + "주차";
      }

      if (!stage) return;

      // 데이터 업데이트
      document.getElementById("growth-stage-badge").textContent = badgeText;
      document.getElementById("growth-stage-stage-name").textContent = stage.stage;
      document.getElementById("growth-stage-description").textContent = stage.description;
      document.getElementById("growth-stage-baby-status").textContent = stage.babyStatus;
      document.getElementById("growth-stage-mom-status").textContent = stage.momStatus;
      document.getElementById("growth-stage-char-img").src = stage.characterImage;

      // 다음 단계 (있으면)
      if (_isBirthMode) {
        var birthStageIndex = getBirthStageIndex();
        if (birthStageIndex < birthStagesData.length - 1) {
          var nextStage = birthStagesData[birthStageIndex + 1];
          document.getElementById("growth-stage-next-stage").textContent =
            nextStage.stage + " (" + nextStage.dayRange + ")";
        } else {
          document.getElementById("growth-stage-next-stage").textContent =
            "마지막 성장 단계입니다.";
        }
      } else {
        if (stageIndex < _growthStagesData.length - 1) {
          var nextStage = _growthStagesData[stageIndex + 1];
          document.getElementById("growth-stage-next-stage").textContent =
            nextStage.stage + " (" + nextStage.weekRange + ")";
        } else {
          document.getElementById("growth-stage-next-stage").textContent =
            "마지막 성장 단계입니다.";
        }
      }

      // 모달 열기
      growthStageOverlay.classList.add("active");
    }

    // Growth Stage Modal 닫기
    function closeGrowthStageModal() {
      growthStageOverlay.classList.remove("active");
    }

    // 캐릭터 영역 클릭 → 모달 열기 (현재 주차 기반)
    if (characterArea) {
      characterArea.addEventListener("click", function () {
        var currentWeek = parseInt(getWeekNumber());
        var stageIndex = 0;

        if (currentWeek >= 12 && currentWeek < 20) {
          stageIndex = 1;
        } else if (currentWeek >= 20 && currentWeek < 28) {
          stageIndex = 2;
        } else if (currentWeek >= 28 && currentWeek < 36) {
          stageIndex = 3;
        } else if (currentWeek >= 36) {
          stageIndex = 4;
        }

        openGrowthStageModal(stageIndex);
      });
    }

    // 닫기 버튼 클릭
    if (growthStageCloseBtn) {
      growthStageCloseBtn.addEventListener("click", closeGrowthStageModal);
    }

    // 오버레이 클릭 시 닫기
    if (growthStageOverlay) {
      growthStageOverlay.addEventListener("click", function (e) {
        if (e.target === growthStageOverlay) {
          closeGrowthStageModal();
        }
      });
    }
  }

  /* 온보딩 섹션 초기화 함수 */
  window.initOnboarding = function() {
    // 초대코드 상태 초기화
    _guardianChildId = null;
    var momCodeInput = document.getElementById("onboarding-mom-code");
    if (momCodeInput) {
      momCodeInput.value = "";
      momCodeInput.style.borderColor = "";
      var errorMsg = document.querySelector(".invite-code-error");
      if (errorMsg) {
        errorMsg.style.display = "none";
        errorMsg.textContent = "";
      }
      var verifyBtn = document.querySelector(".invite-code-verify-btn");
      if (verifyBtn) {
        verifyBtn.style.backgroundColor = "#D94F8A";
        verifyBtn.textContent = "확인";
      }
    }

    // 역할 선택 초기화 (엄마로 기본 설정)
    selectRole("mom");
  };
})();

/* ------------------------------------------
   TODAK SECTION (오늘의 토닥)
   ------------------------------------------ */

(function () {
  var section = document.getElementById("todak-section");
  if (!section) return;

  var missionsData = {
    child: [],
    self: [],
    family: [],
  };

  /* Supabase에서 임신 주차에 맞는 미션 로드 */
  async function loadMissionsData() {
    if (!window.supabase || !_currentChild) return;

    try {
      var currentWeek = parseInt(getWeekNumber());

      var weekRanges = [
        { min: 1, max: 4, week: 4 },
        { min: 5, max: 8, week: 8 },
        { min: 9, max: 12, week: 12 },
        { min: 13, max: 16, week: 16 },
        { min: 17, max: 20, week: 20 },
        { min: 21, max: 24, week: 24 },
        { min: 25, max: 28, week: 28 },
        { min: 29, max: 31, week: 32 },
        { min: 32, max: 36, week: 36 },
        { min: 37, max: 40, week: 40 }
      ];

      var missionWeek = null;
      for (var i = 0; i < weekRanges.length; i++) {
        if (currentWeek >= weekRanges[i].min && currentWeek <= weekRanges[i].max) {
          missionWeek = weekRanges[i].week;
          break;
        }
      }

      if (missionWeek === null) {
        missionWeek = 40;
      }

      var { data: missions, error } = await window.supabase
        .from("todak_missions")
        .select("*")
        .eq("week", missionWeek);

      if (error) {
        console.error("[토닥 미션 로드 오류]", error);
        return;
      }

      if (!missions || missions.length === 0) {
        console.log("[토닥 미션] " + missionWeek + "주차 미션이 없습니다.");
        return;
      }

      missionsData.child = [];
      missionsData.self = [];
      missionsData.family = [];

      missions.forEach(function (mission, index) {
        var missionObj = {
          id: mission.id,
          icon: mission.icon || "•",
          title: mission.title,
          desc: mission.description || "",
          tags: [],
          completed: false,
        };

        if (mission.category === "baby") {
          missionsData.child.push(missionObj);
        } else if (mission.category === "self") {
          missionsData.self.push(missionObj);
        } else if (mission.category === "family") {
          missionsData.family.push(missionObj);
        }
      });

      renderMissions();
    } catch (err) {
      console.error("[토닥 미션 로드 예외]", err);
    }
  }

  /* 날짜 표시 설정 */
  function initDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var date = today.getDate();
    var dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][today.getDay()];

    var dateFullEl = document.getElementById("todak-date-full");
    if (dateFullEl) {
      dateFullEl.textContent =
        year + "년 " + month + "월 " + date + "일 (" + dayOfWeek + ")";
    }
  }

  /* 미션 카드 HTML 생성 */
  function createMissionCardHTML(mission) {
    var completedClass = mission.completed ? "completed" : "";
    var tagsHTML = "";

    if (mission.id === "child-1") {
      tagsHTML = mission.tags
        .map(function (tag) {
          return '<span class="mission-tag">' + tag + "</span>";
        })
        .join("");
    }

    return (
      '<div class="mission-card ' +
      completedClass +
      '" data-mission-id="' +
      mission.id +
      '">' +
      '<div class="mission-card__icon" aria-hidden="true">' +
      mission.icon +
      "</div>" +
      '<div class="mission-card__content">' +
      '<h4 class="mission-card__title">' +
      mission.title +
      "</h4>" +
      '<p class="mission-card__desc">' +
      mission.desc +
      "</p>" +
      '<div class="mission-card__tags">' +
      tagsHTML +
      "</div>" +
      "</div>" +
      '<input type="checkbox" class="mission-card__checkbox" ' +
      (mission.completed ? "checked" : "") +
      ' aria-label="' +
      mission.title +
      ' 완료"/>' +
      "</div>"
    );
  }

  /* 진행률 계산 */
  function calculateProgress() {
    var allMissions = [].concat(
      missionsData.child,
      missionsData.self,
      missionsData.family,
    );
    var completed = allMissions.filter(function (m) {
      return m.completed;
    }).length;
    var total = allMissions.length;
    return {
      completed: completed,
      total: total,
      percentage: Math.round((completed / total) * 100),
    };
  }

  /* 진행률 업데이트 */
  function updateProgress() {
    var progress = calculateProgress();
    var progressCountEl = document.getElementById("todak-progress-count");
    var progressFillEl = document.getElementById("todak-progress-fill");

    if (progressCountEl) {
      progressCountEl.textContent = progress.completed + "/" + progress.total;
    }
    if (progressFillEl) {
      progressFillEl.style.width = progress.percentage + "%";
    }
  }

  /* 카테고리 완료 뱃지 업데이트 */
  function updateCategoryBadges() {
    var childCompleted = missionsData.child.filter(function (m) {
      return m.completed;
    }).length;
    var childTotal = missionsData.child.length;
    var childBadge = document.getElementById("category-child-badge");
    if (childBadge) {
      childBadge.textContent = childCompleted + "/" + childTotal + " 완료";
    }

    var selfCompleted = missionsData.self.filter(function (m) {
      return m.completed;
    }).length;
    var selfTotal = missionsData.self.length;
    var selfBadge = document.getElementById("category-self-badge");
    if (selfBadge) {
      selfBadge.textContent = selfCompleted + "/" + selfTotal + " 완료";
    }

    var familyCompleted = missionsData.family.filter(function (m) {
      return m.completed;
    }).length;
    var familyTotal = missionsData.family.length;
    var familyBadge = document.getElementById("category-family-badge");
    if (familyBadge) {
      familyBadge.textContent = familyCompleted + "/" + familyTotal + " 완료";
    }
  }

  /* 미션 리스트 렌더링 */
  function renderMissions() {
    renderMissionList("todak-category-child", missionsData.child);
    renderMissionList("todak-category-self", missionsData.self);
    renderMissionList("todak-category-family", missionsData.family);

    updateCategoryBadges();

    /* 미션 체크박스 이벤트 */
    var checkboxes = section.querySelectorAll(".todak-mission-checkbox");
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        var missionItem = this.closest(".todak-mission-item");
        var missionId = missionItem ? missionItem.dataset.missionId : null;
        var allMissions = [].concat(
          missionsData.child,
          missionsData.self,
          missionsData.family,
        );
        var mission = allMissions.find(function (m) {
          return m.id === missionId;
        });

        if (mission) {
          mission.completed = this.checked;
          if (missionItem) missionItem.classList.toggle("completed", this.checked);
          updateProgress();
          updateCategoryBadges();
        }
      });
    });
  }

  /* 뒤로가기 버튼 */
  var backBtn = section.querySelector(".header__back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      showSection("home-section");
    });
  }

  /* 응원 카드 버튼 */
  var encouragementBtn = section.querySelector(".encouragement-btn");
  if (encouragementBtn) {
    encouragementBtn.addEventListener("click", function () {
      showToast("나의 기록 페이지로 이동합니다.");
      setTimeout(function () {
        showSection("record-section");
      }, 300);
    });
  }

  /* Growth Detail 화면 전환 */

  /* Record 화면의 날짜 클릭 시 기록 조회 및 표시 */
  var calendarDays = document.querySelectorAll(
    ".record-calendar__day:not(.record-calendar__day--empty)",
  );
  calendarDays.forEach(function (day) {
    day.addEventListener("click", async function () {
      var dayText = day.textContent.trim();
      var dayNum = parseInt(dayText);

      if (isNaN(dayNum)) {
        return;
      }

      var monthBtn = document.querySelector(".record-calendar__month-btn");
      var monthText = monthBtn?.textContent || "2026년 6월";
      var monthMatch = monthText.match(/(\d{4})년\s*(\d{1,2})월/);

      if (!monthMatch) {
        console.error("[TODAK] 월/년도 파싱 실패");
        return;
      }

      var year = parseInt(monthMatch[1]);
      var month = parseInt(monthMatch[2]);

      var selectedDate = new Date(year, month - 1, dayNum);
      console.log("[TODAK] 선택된 날짜:", selectedDate);

      // 날짜 기록 조회
      var records = await fetchGrowthRecordsByDate(selectedDate);
      console.log("[TODAK] 조회된 기록:", records);

      // record-date-section 업데이트
      var dateTitle = document.querySelector(".record-date-title");
      if (dateTitle) {
        var monthStr = ("0" + month).slice(-2);
        var dayStr = ("0" + dayNum).slice(-2);
        dateTitle.textContent =
          year +
          "년 " +
          month +
          "월 " +
          dayNum +
          "일의 기록";
      }

      // 기록 항목 영역 업데이트
      var recordItems = document.querySelector(".record-items");
      if (recordItems) {
        if (records.length === 0) {
          recordItems.innerHTML =
            '<div style="padding: 20px; text-align: center; color: #999;">아직 기록이 없습니다.</div>';
        } else {
          var itemsHTML = "";
          records.forEach(function (record) {
            var createdDate = new Date(record.record_date);
            var timeStr = createdDate.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            var content = "";
            if (record.height || record.weight) {
              content +=
                '<p class="record-item__desc">';
              if (record.height) content += "키: " + record.height + "cm " + "<br>";
              if (record.weight) content += "몸무게: " + record.weight + "kg";
              content += "</p>";
            }

            if (record.memo) {
              content += '<p class="record-item__desc">' + record.memo + "</p>";
            }

            if (record.photo_url) {
              content +=
                '<div class="record-item__images"><img src="' +
                record.photo_url +
                '" alt="기록 사진" class="record-item__image"></div>';
            }

            itemsHTML +=
              '<div class="record-item">' +
              '<div class="record-item__header">' +
              '<span class="record-item__time">' +
              timeStr +
              '</span>' +
              '<div class="record-item__dot"></div>' +
              "</div>" +
              '<div class="record-item__content">' +
              '<h4 class="record-item__title">성장 기록</h4>' +
              content +
              "</div>" +
              "</div>";
          });
          recordItems.innerHTML = itemsHTML;
        }
      }

      // 캘린더의 active 상태 업데이트
      calendarDays.forEach(function (d) {
        d.classList.remove("record-calendar__day--active");
      });
      day.classList.add("record-calendar__day--active");

      window.scrollTo(0, 300);
    });
  });

  /* Growth Detail의 뒤로 가기 버튼 */
  var growthBackBtn = document.querySelector(".growth-detail-back");
  if (growthBackBtn) {
    growthBackBtn.addEventListener("click", function () {
      showSection("record-section");
      window.scrollTo(0, 0);
    });
  }

  /* Record Creation Modal */

  /* FAB 클릭 시 모달 열기 - 모든 FAB 버튼 지원 */
  var recordCreateOverlay = document.getElementById("record-create-overlay");
  var allFabs = document.querySelectorAll(".fab");
  allFabs.forEach(function (fab) {
    fab.addEventListener("click", async function () {
      if (recordCreateOverlay) {
        recordCreateOverlay.classList.add("active");

        var today = new Date();
        var todayStr = today.getFullYear() + "-" +
                       String(today.getMonth() + 1).padStart(2, "0") + "-" +
                       String(today.getDate()).padStart(2, "0");

        var dateInput = document.getElementById("record-date-hidden");
        if (!dateInput) {
          dateInput = document.createElement("input");
          dateInput.type = "hidden";
          dateInput.id = "record-date-hidden";
          dateInput.value = todayStr;
          recordCreateOverlay.appendChild(dateInput);
        } else {
          dateInput.value = todayStr;
        }

        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var day = today.getDate();
        var dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][today.getDay()];

        var createDateText = document.querySelector(".record-create-date-text");
        if (createDateText) {
          createDateText.textContent = year + "년 " + month + "월 " + day + "일 " + dayOfWeek + "요일";
        }

        var lastRecord = await loadLastGrowthRecord();
        var heightInput = document.getElementById("record-height");
        var weightInput = document.getElementById("record-weight");

        if (heightInput && lastRecord?.height) {
          heightInput.value = lastRecord.height;
        } else if (heightInput) {
          heightInput.value = "";
        }

        if (weightInput && lastRecord?.weight) {
          weightInput.value = lastRecord.weight;
        } else if (weightInput) {
          weightInput.value = "";
        }

        var growthInputsContainer = document.querySelector(".record-create-growth-inputs");
        var feedingContainer = document.querySelector(".record-create-feeding-options");
        if (growthInputsContainer && feedingContainer) {
          if (_isBirthMode) {
            growthInputsContainer.style.display = "block";
            feedingContainer.parentElement.style.display = "block";
          } else {
            growthInputsContainer.style.display = "none";
            feedingContainer.parentElement.style.display = "none";
          }
        }

        console.log("[TODAK] 마지막 기록 로드 완료, 기본 날짜 설정:", todayStr);
      }
    });
  });

  /* 모달 X 버튼 클릭 시 닫기 */
  var recordCreateCloseBtn = document.querySelector(
    "#record-create-overlay .modal__close-btn",
  );
  if (recordCreateCloseBtn && recordCreateOverlay) {
    recordCreateCloseBtn.addEventListener("click", function () {
      recordCreateOverlay.classList.remove("active");
    });
  }

  /* 오버레이 클릭 시 닫기 */
  if (recordCreateOverlay) {
    recordCreateOverlay.addEventListener("click", function (e) {
      if (e.target === recordCreateOverlay) {
        recordCreateOverlay.classList.remove("active");
      }
    });
  }

  /* 수유 기록 옵션 선택 */
  var feedingBtns = document.querySelectorAll(".record-create-feeding-btn");
  feedingBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      feedingBtns.forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");
    });
  });

  /* 이유식 종류 선택 */
  var babyFoodTags = document.querySelectorAll(".record-create-baby-food-tag");
  babyFoodTags.forEach(function (tag) {
    tag.addEventListener("click", function () {
      tag.classList.toggle("selected");
    });
  });

  /* 이유식 추가 버튼 */
  var babyFoodAddBtn = document.querySelector(".record-create-baby-food-add");
  if (babyFoodAddBtn) {
    babyFoodAddBtn.addEventListener("click", function () {
      var newFood = prompt("새로운 이유식 종류를 입력해주세요:");
      if (newFood && newFood.trim()) {
        var tagsContainer = document.querySelector(
          ".record-create-baby-food-tags",
        );
        var newTag = document.createElement("button");
        newTag.type = "button";
        newTag.className = "record-create-baby-food-tag selected";
        newTag.textContent = newFood.trim();
        tagsContainer.insertBefore(newTag, babyFoodAddBtn);

        newTag.addEventListener("click", function () {
          newTag.classList.toggle("selected");
        });
      }
    });
  }

  /* 메모 글자 수 카운트 */
  var memoTextarea = document.getElementById("record-memo");
  var memoCount = document.querySelector(".record-create-memo-count");
  if (memoTextarea && memoCount) {
    memoTextarea.addEventListener("input", function () {
      var length = memoTextarea.value.length;
      memoCount.textContent = length + " / 200";
    });
  }

  /* 저장 버튼 클릭 */
  var saveBtn = document.querySelector(".record-create-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async function () {
      var heightInput = document.getElementById("record-height");
      var weightInput = document.getElementById("record-weight");
      var memoInput = document.getElementById("record-memo");
      var photoInput = document.getElementById("record-photo-input");
      var dateInput = document.getElementById("record-date-hidden");

      var height = heightInput?.value ? parseFloat(heightInput.value) : null;
      var weight = weightInput?.value ? parseFloat(weightInput.value) : null;
      var memo = memoInput?.value || "";
      var photoFile = photoInput?.files?.[0] || null;
      var recordDate = dateInput?.value || new Date().toISOString().split("T")[0];

      console.log("[TODAK] 저장 데이터:", {
        height,
        weight,
        memo,
        photoFile,
        recordDate,
      });

      if (!height && !weight) {
        showToast("키 또는 몸무게를 입력해주세요.");
        return;
      }

      saveBtn.disabled = true;
      console.log("[TODAK] 성장 기록 저장 시작");

      try {
        var photoUrl = null;
        if (photoFile) {
          console.log("[TODAK] 사진 업로드 중...");
          photoUrl = await uploadGrowthPhoto(photoFile);
          if (!photoUrl) {
            console.warn("[TODAK] 사진 업로드 실패, 계속 진행");
          }
        }

        var growthRecord = await saveGrowthRecord({
          record_date: recordDate,
          height,
          weight,
          photo_url: photoUrl,
          memo,
        });

        if (!growthRecord) {
          showToast("기록 저장 실패. 다시 시도해주세요.");
          saveBtn.disabled = false;
          return;
        }

        console.log("[TODAK] growth_records 저장 완료:", growthRecord.id);

        showToast("성장 기록이 저장되었습니다.");

        if (recordCreateOverlay) {
          recordCreateOverlay.classList.remove("active");
        }

        if (heightInput) heightInput.value = "";
        if (weightInput) weightInput.value = "";
        if (memoInput) memoInput.value = "";
        if (photoInput) photoInput.value = "";
        var memoCount = document.querySelector(".record-create-memo-count");
        if (memoCount) memoCount.textContent = "0 / 200";

        var photoArea = document.querySelector(".record-create-photo-area");
        if (photoArea) {
          var preview = photoArea.querySelector("img");
          if (preview) preview.remove();
          var photoIcon = photoArea.querySelector("svg");
          var photoText = photoArea.querySelector(".record-create-photo-text");
          if (photoIcon) photoIcon.style.display = "block";
          if (photoText) photoText.style.display = "block";
        }

        console.log("[TODAK] UI 갱신 시작");
        await initRecordSection();
        await updateHomeGrowthInfo();

        console.log("[TODAK] 모든 저장 및 갱신 완료");
      } catch (err) {
        console.error("[TODAK] 저장 중 에러:", err.message);
        showToast("저장 중 오류가 발생했습니다.");
      } finally {
        saveBtn.disabled = false;
      }
    });
  }

  /* 사진 업로드 버튼 */
  var photoUploadBtn = document.getElementById("record-photo-upload");
  var photoInput = document.getElementById("record-photo-input");
  if (photoUploadBtn && photoInput) {
    photoUploadBtn.addEventListener("click", function () {
      photoInput.click();
    });

    photoInput.addEventListener("change", function () {
      if (photoInput.files && photoInput.files.length > 0) {
        var fileName = photoInput.files[0].name;
        var file = photoInput.files[0];
        console.log("[TODAK] 사진 선택됨:", fileName);

        var reader = new FileReader();
        reader.onload = function (e) {
          var imgSrc = e.target.result;

          var existingImg = photoUploadBtn.querySelector("img");
          if (existingImg) {
            existingImg.remove();
          }

          var svg = photoUploadBtn.querySelector("svg");
          var photoText = photoUploadBtn.querySelector(".record-create-photo-text");
          if (svg) svg.style.display = "none";
          if (photoText) photoText.style.display = "none";

          var img = document.createElement("img");
          img.src = imgSrc;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "cover";
          img.style.borderRadius = "8px";
          img.alt = "선택한 사진";
          photoUploadBtn.appendChild(img);

          console.log("[TODAK] 사진 미리보기 표시됨");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* 초기화 */
  initDate();

  /* 외부에서 접근 가능하도록 함수 노출 */
  window.loadTodakMissions = loadMissionsData;
})();

/* ==========================================================================
   Supabase Auth & Data
   ========================================================================== */

var _todakRole = "mom";
var _pendingName = "";
var _isBirthMode = false;
var _currentUser = null;
var _currentChild = null;
var _todakMissions = [];
var _missionCompletions = [];
var _growthStagesData = [
  {
    stage: "초기 적응기",
    weekRange: "1~11주",
    week: 4,
    characterImage: "image/preg1.png",
    description:
      "호르몬 변화로 피로감과 메스꺼움이 생기는 시기입니다. 아이의 모습을 초음파로 처음 확인할 수 있어요.",
    babyStatus:
      "태아의 크기가 쌀알 정도에서 완두콩 크기로 자랍니다. 심장, 뇌, 척추 등 기본 구조가 형성돼요.",
    momStatus:
      "호르몬 변화로 감정 변화가 크고 피로감이 느껴집니다. 충분한 수면과 휴식이 중요해요.",
  },
  {
    stage: "안정기",
    weekRange: "12~19주",
    week: 11,
    characterImage: "image/preg2.png",
    description:
      "아침 병증이 완화되고 아이의 움직임이 미세하게 느껴지는 시기입니다. 안정적인 성장 단계예요.",
    babyStatus:
      "얼굴의 윤곽이 뚜렷해지고 손가락 발가락이 나타납니다. 피부가 형성되기 시작해요.",
    momStatus:
      "에너지가 돌아오고 아이에 대한 실감이 생기기 시작합니다. 적절한 운동과 영양 섭취가 좋아요.",
  },
  {
    stage: "태동기",
    weekRange: "20~27주",
    week: 20,
    characterImage: "image/preg3.png",
    description:
      "아이의 움직임이 왕발하게 되고 엄마와의 교감이 가장 깊어지는 소중한 시기입니다.",
    babyStatus:
      "눈을 뜨고 감을 수 있으며, 소리에 반응하여 태동을 보냅니다. 피부의 지방층이 생성되기 시작해요.",
    momStatus:
      "배가 눈에 띄게 불러오며 허리 통증이 생길 수 있습니다. 가벼운 스트레칭과 명상이 도움이 돼요.",
  },
  {
    stage: "성장기",
    weekRange: "28~35주",
    week: 28,
    characterImage: "image/preg4.png",
    description:
      "아이가 급속도로 성장하고 엄마의 몸이 출산 준비를 시작하는 시기입니다.",
    babyStatus:
      "폐가 성숙해지고 뇌 발달이 활발해집니다. 아이의 움직임이 더욱 분명하고 규칙적이 돼요.",
    momStatus:
      "피로감이 증가하고 자주 피곤해집니다. 충분한 휴식과 가벼운 운동이 도움이 돼요.",
  },
  {
    stage: "출산 준비기",
    weekRange: "36주~출산",
    week: 36,
    characterImage: "image/preg5.png",
    description:
      "출산이 임박한 시기입니다. 아이가 골반 쪽으로 내려오면서 호흡이 편해져요.",
    babyStatus:
      "면역 체계가 완성되고 장기 기능이 완전히 발달합니다. 출산 준비를 하고 있어요.",
    momStatus:
      "소화 불편함이 완화되고 출산에 대한 불안감이 커질 수 있습니다. 이는 매우 정상이에요.",
  },
];

// 출산 후 성장 단계 더미 데이터
var birthStagesData = [
  {
    dayRange: "0~100일",
    minDay: 0,
    maxDay: 100,
    stage: "신생아 적응기",
    characterImage: "image/baby1.png",
    description: "세상에 적응하며 수면, 수유, 울음 패턴이 만들어지는 시기입니다.",
    babyStatus: "시각과 청각이 조금씩 발달하고, 엄마 아빠의 목소리에 반응하기 시작해요.",
    momStatus: "수면 부족과 회복이 함께 오는 시기입니다. 짧게라도 자주 쉬는 것이 중요해요."
  },
  {
    dayRange: "101일~1년",
    minDay: 101,
    maxDay: 365,
    stage: "감각 발달기",
    characterImage: "image/baby2.png",
    description: "뒤집기, 앉기, 기기처럼 움직임이 많아지고 감정 표현이 풍부해지는 시기입니다.",
    babyStatus: "손으로 물건을 잡고, 낯가림이나 애착 표현이 나타날 수 있어요.",
    momStatus: "아이의 활동량이 늘어나며 돌봄 강도가 커질 수 있습니다. 주변 도움을 함께 받아보세요."
  },
  {
    dayRange: "1년~2년",
    minDay: 366,
    maxDay: 730,
    stage: "자립 시작기",
    characterImage: "image/baby3.png",
    description: "걷기와 말하기가 시작되며 스스로 해보려는 욕구가 커지는 시기입니다.",
    babyStatus: "간단한 말을 이해하고 따라 하며, 걷기와 탐색 활동이 활발해져요.",
    momStatus: "아이의 자율성이 커지며 훈육과 기다림이 필요한 시기입니다. 안전한 환경을 만들어주세요."
  }
];
var _weeklyGuides = [];
var _guideContents = [];
var _growthRecords = [];

function generateInviteCode() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var code = "TODAK-";
  var length = Math.floor(Math.random() * 2) + 6;
  for (var i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function validateInviteCode(inviteCode) {
  try {
    if (!supabase) {
      return null;
    }

    var { data, error } = await supabase
      .from("children")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.id;
  } catch (err) {
    return null;
  }
}

function translateSupabaseError(message) {
  if (!message) return "오류가 발생했습니다.";

  var errorMap = {
    "Invalid login credentials": "이메일 또는 비밀번호가 일치하지 않습니다.",
    "Email not confirmed": "이메일 인증이 필요합니다.",
    "User already registered": "이미 가입된 이메일입니다.",
    "Weak password": "비밀번호가 너무 약합니다. 8자 이상으로 입력해주세요.",
    "Invalid email": "유효하지 않은 이메일 형식입니다.",
    "email rate limit exceeded":
      "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.",
    "User not found": "가입되지 않은 사용자입니다.",
    "Invalid password": "비밀번호가 일치하지 않습니다.",
  };

  for (var key in errorMap) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return errorMap[key];
    }
  }

  return message;
}

/* ---------- "토닥 시작하기" → role-selection-section 진입 ---------- */
document.addEventListener(
  "click",
  function (e) {
    var btn = e.target.closest(".btn-todak-start");
    if (!btn) return;
    e.stopImmediatePropagation();
    showSection("role-selection-section");
  },
  true,
);

/* ---------- signup-back → role-selection-section ---------- */
(function () {
  var backBtn = document.getElementById("signup-back");
  if (!backBtn) return;
  var newBack = backBtn.cloneNode(true);
  backBtn.parentNode.replaceChild(newBack, backBtn);
  newBack.addEventListener("click", function () {
    showSection("role-selection-section");
  });
})();

/* ---------- 회원가입 폼 ---------- */
(function () {
  var form = document.getElementById("signup-form");
  if (!form) return;

  var newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  var pwToggle = document.getElementById("signup-pw-toggle");
  var pwInput = document.getElementById("signup-password");
  if (pwToggle && pwInput) {
    pwToggle.addEventListener("click", function () {
      var isHidden = pwInput.type === "password";
      pwInput.type = isHidden ? "text" : "password";
      pwToggle.classList.toggle("is-visible", isHidden);
    });
  }

  var _signupInviteVerified = false;
  var _signupVerifiedChildId = null;
  var signupVerifyBtn = document.getElementById("signup-invite-verify-btn");
  var signupInviteInput = document.getElementById("signup-invite-code");
  var signupInviteResult = document.getElementById("signup-invite-result");

  if (signupVerifyBtn) {
    signupVerifyBtn.addEventListener("click", async function () {
      var code = signupInviteInput ? signupInviteInput.value.trim() : "";
      if (!code) {
        if (signupInviteResult) {
          signupInviteResult.textContent = "초대코드를 입력해주세요.";
          signupInviteResult.style.color = "#D94F8A";
          signupInviteResult.style.display = "block";
        }
        return;
      }
      var childId = await validateInviteCode(code);
      if (childId) {
        _signupInviteVerified = true;
        _signupVerifiedChildId = childId;
        if (signupInviteResult) {
          signupInviteResult.textContent = "일치합니다.";
          signupInviteResult.style.color = "#2F4B7C";
          signupInviteResult.style.display = "block";
        }
      } else {
        _signupInviteVerified = false;
        _signupVerifiedChildId = null;
        if (signupInviteResult) {
          signupInviteResult.textContent = "일치하지 않습니다.";
          signupInviteResult.style.color = "#D94F8A";
          signupInviteResult.style.display = "block";
        }
      }
    });
  }

  if (signupInviteInput) {
    signupInviteInput.addEventListener("input", function () {
      _signupInviteVerified = false;
      _signupVerifiedChildId = null;
      if (signupInviteResult) {
        signupInviteResult.style.display = "none";
        signupInviteResult.textContent = "";
      }
    });
  }

  newForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    var name = document.getElementById("signup-name").value.trim();
    var email = document.getElementById("signup-email").value.trim();
    var password = document.getElementById("signup-password").value;
    var confirm = document.getElementById("signup-password-confirm").value;
    var agreed = document.getElementById("signup-agree").checked;
    var inviteCode = _todakRole === "guardian"
      ? document.getElementById("signup-invite-code").value.trim()
      : null;

    if (!name) {
      showToast("이름을 입력해주세요.");
      return;
    }
    if (!email) {
      showToast("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      showToast("비밀번호를 입력해주세요.");
      return;
    }
    if (password !== confirm) {
      showToast("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreed) {
      showToast("이용약관에 동의해주세요.");
      return;
    }
    if (_todakRole === "guardian") {
      if (!inviteCode) {
        showToast("초대코드를 입력해주세요.");
        return;
      }
      if (!_signupVerifiedChildId) {
        showToast("초대코드를 먼저 확인해주세요.");
        return;
      }
    }

    try {
      var childId = null;

      if (supabase && supabase.auth) {
        var authResult;
        try {
          authResult = await Promise.race([
            supabase.auth.signUp({ email: email, password: password }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("signUp timeout")), 5000),
            ),
          ]);
          if (authResult.error) {
            throw authResult.error;
          }
        } catch (signUpErr) {
          throw signUpErr;
        }

        if (authResult.data && authResult.data.user) {
          var userId = authResult.data.user.id;

          if (_todakRole === "guardian") {
            // 확인 버튼에서 이미 검증된 child_id 사용 (signUp 이후 재검증 없음)
            childId = _signupVerifiedChildId;
          }

          try {
            var userData = {
              id: userId,
              name: name,
              email: email,
              role: _todakRole || "mom",
              created_at: new Date().toISOString(),
            };

            if (_todakRole === "guardian") {
              userData.child_id = childId;
            }

            var { error: userInsertErr } = await supabase
              .from("users")
              .insert([userData]);

            if (userInsertErr) {
              throw userInsertErr;
            }
          } catch (insertErr) {
            console.error("[회원가입] users 테이블 저장 오류:", insertErr.message);
          }
        }
      }

      _pendingName = name;
      newForm.reset();

      if (_todakRole === "guardian") {
        showToast("회원가입이 완료되었습니다.");
        await loadHomeData();
        setupTabsAfterLogin();
        showSection("home-section");
      } else {
        showToast("회원가입이 완료되었습니다. 로그인해주세요.");
        showSection("login-section");
      }
    } catch (err) {
      console.error("[회원가입] 오류 발생:", err.message);
      showToast(translateSupabaseError(err.message));
    }
  });
})();

/* ---------- 역할 선택 → 회원가입 ---------- */
(function () {
  var section = document.getElementById("role-selection-section");
  if (!section) return;

  var nextBtn = document.getElementById("role-sel-next");
  if (!nextBtn) return;

  var newBtn = nextBtn.cloneNode(true);
  nextBtn.parentNode.replaceChild(newBtn, nextBtn);

  newBtn.addEventListener("click", function () {
    var selected = section.querySelector(".role-card--selected");
    _todakRole = selected ? selected.dataset.role : "mom";

    var signupRoleHidden = document.getElementById("signup-role-value");
    if (signupRoleHidden) signupRoleHidden.value = _todakRole;

    var guardianOnlyField = document.querySelector(".form-section--guardian-only");
    if (guardianOnlyField) {
      guardianOnlyField.style.display = _todakRole === "guardian" ? "block" : "none";
    }

    showSection("signup-section");
  });
})();

/* ---------- 온보딩 저장 (엄마만) ---------- */
(function () {
  var startBtn = document.getElementById("onboarding-start-btn");
  if (!startBtn) return;

  var newBtn = startBtn.cloneNode(true);
  startBtn.parentNode.replaceChild(newBtn, startBtn);

  newBtn.addEventListener("click", async function () {
    try {
      if (_todakRole !== "mom") {
        showToast("온보딩은 엄마만 진행 가능합니다.");
        return;
      }

      var babyName = document
        .getElementById("onboarding-taemyeong")
        .value.trim();
      if (!babyName) {
        showToast("태명을 입력해주세요.");
        return;
      }

      var pregnantBtn = document.getElementById("status-pregnant");
      var birthStatus =
        pregnantBtn && pregnantBtn.classList.contains("selected")
          ? "pregnant"
          : "birth";

      if (birthStatus === "pregnant") {
        var dueDate = document.getElementById("onboarding-due-date").value;
        if (!dueDate) {
          showToast("출산 예정일을 입력해주세요.");
          return;
        }
      } else {
        var birthDate = document.getElementById(
          "onboarding-birth-date",
        ).value;
        if (!birthDate) {
          showToast("출산일을 입력해주세요.");
          return;
        }
      }

      if (!supabase || !supabase.auth) {
        showToast("Supabase가 초기화되지 않았습니다.");
        return;
      }

      var { data: authData, error: authErr } = await supabase.auth.getUser();

      if (authErr || !authData || !authData.user) {
        showToast("로그인이 필요합니다.");
        showSection("login-section");
        return;
      }

      var userId = authData.user.id;
      var userEmail = authData.user.email;

      var childData = {
        owner_id: userId,
        baby_name: babyName,
        birth_status: birthStatus,
        invite_code: generateInviteCode(),
      };

      if (birthStatus === "pregnant") {
        childData.due_date = document.getElementById(
          "onboarding-due-date",
        ).value || null;
      } else {
        childData.birth_date = document.getElementById(
          "onboarding-birth-date",
        ).value || null;
        var heightInput = document.getElementById("onboarding-height");
        var weightInput = document.getElementById("onboarding-weight");
        childData.height = heightInput && heightInput.value
          ? parseFloat(heightInput.value)
          : null;
        childData.weight = weightInput && weightInput.value
          ? parseFloat(weightInput.value)
          : null;
      }

      var { data: insertedChild, error: childInsertErr } = await supabase
        .from("children")
        .insert([childData])
        .select();

      if (childInsertErr) {
        throw childInsertErr;
      }

      if (!insertedChild || insertedChild.length === 0) {
        throw new Error("아이 정보 저장에 실패했습니다.");
      }

      var childId = insertedChild[0].id;

      var userData = {
        id: userId,
        name: _pendingName || userEmail,
        email: userEmail,
        role: _todakRole,
        child_id: childId,
      };

      var { error: userErr } = await supabase
        .from("users")
        .upsert([userData]);
      if (userErr) {
        throw userErr;
      }

      _isBirthMode = birthStatus === "birth";
      await loadHomeData();
      setupTabsAfterLogin();
      showSection("home-section");
    } catch (err) {
      showToast(translateSupabaseError(err.message));
    }
  });
})();

/* ---------- 홈 데이터 로드 ---------- */
async function loadHomeData() {
  try {
    if (!supabase || !supabase.auth) {
      console.error("[홈] Supabase가 초기화되지 않았습니다");
      return;
    }

    var { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData || !authData.user) {
      console.error("[홈] 인증 정보 조회 실패");
      return;
    }

    var userId = authData.user.id;

    var { data: userData, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userErr || !userData) {
      console.error("[홈] 사용자 정보 조회 실패");
      return;
    }

    _currentUser = userData;

    var { data: childData, error: childErr } = await supabase
      .from("children")
      .select("*")
      .eq("id", userData.child_id)
      .single();

    if (childErr) {
      console.error("[홈] 아이 정보 조회 실패");
      return;
    }

    _currentChild = childData;
    _isBirthMode = childData.birth_status === "birth";

    var { data: missions, error: missionsErr } = await supabase
      .from("todak_missions")
      .select("*");

    if (!missionsErr && missions) {
      _todakMissions = missions;
    }

    var { data: guides, error: guidesErr } = await supabase
      .from("weekly_guides")
      .select("*");

    if (!guidesErr && guides) {
      _weeklyGuides = guides;
    }

    var { data: records, error: recordsErr } = await supabase
      .from("growth_records")
      .select("*")
      .eq("child_id", userData.child_id)
      .order("record_date", { ascending: false });

    if (!recordsErr && records) {
      _growthRecords = records;
    }

    var today = new Date().toISOString().split("T")[0];
    var { data: todayCompletions, error: completionsErr } = await supabase
      .from("mission_completions")
      .select("*")
      .eq("child_id", userData.child_id)
      .eq("completed_date", today);

    if (!completionsErr && todayCompletions) {
      _missionCompletions = todayCompletions;
    }

    console.log("[홈] 모든 데이터 로드 완료");
  } catch (err) {
    console.error("[홈 데이터 로드 오류]", err);
  }
}

/* ---------- 로그인 후 탭 설정 ---------- */
function setupTabsAfterLogin() {
  if (!_currentChild || !_currentUser) return;

  var pregnancyToggles = document.querySelectorAll(
    ".pregnancy-birth-toggle .toggle-btn",
  );

  var isBirthStatus = _currentChild.birth_status === "birth";
  _isBirthMode = isBirthStatus;

  if (_currentUser.role === "guardian") {
    pregnancyToggles.forEach(function (btn) {
      btn.style.pointerEvents = "none";
      btn.style.cursor = "not-allowed";
    });

    if (isBirthStatus) {
      if (pregnancyToggles[1]) {
        pregnancyToggles[1].classList.add("active");
      }
      if (pregnancyToggles[0]) {
        pregnancyToggles[0].classList.remove("active");
      }
      updateHomeContent("birth");
    } else {
      if (pregnancyToggles[0]) {
        pregnancyToggles[0].classList.add("active");
      }
      if (pregnancyToggles[1]) {
        pregnancyToggles[1].classList.remove("active");
      }
      updateHomeContent("pregnancy");
    }
  } else if (isBirthStatus) {
    var pregnancyBtn = pregnancyToggles[0];
    if (pregnancyBtn) {
      pregnancyBtn.style.pointerEvents = "none";
      pregnancyBtn.style.opacity = "0.6";
      pregnancyBtn.style.cursor = "not-allowed";
    }

    if (pregnancyToggles[1]) {
      pregnancyToggles[1].classList.add("active");
    }
    if (pregnancyToggles[0]) {
      pregnancyToggles[0].classList.remove("active");
    }

    updateHomeContent("birth");
  } else {
    if (pregnancyToggles[0]) {
      pregnancyToggles[0].classList.add("active");
    }
    if (pregnancyToggles[1]) {
      pregnancyToggles[1].classList.remove("active");
    }

    var birthBtn = pregnancyToggles[1];
    if (birthBtn) {
      birthBtn.style.pointerEvents = "auto";
      birthBtn.style.opacity = "1";
      birthBtn.style.cursor = "pointer";
    }

    updateHomeContent("pregnancy");
  }
}

/* ---------- 홈 화면 업데이트 ---------- */
function updateHomeDisplay() {
  if (!_currentChild) return;

  // 보호자 모드 토글 잠금
  var toggleContainer = document.querySelector(".pregnancy-birth-toggle");
  if (toggleContainer) {
    var isGuardian = _currentUser && _currentUser.role === "guardian";
    toggleContainer.classList.toggle("guardian-mode", isGuardian);
  }

  var headerLabel = document.getElementById("header-label");
  var headerTitle = document.getElementById("header-title");
  var headerDday = document.getElementById("header-dday");
  var leftCardValue = document.getElementById("left-card-value");
  var rightCardValue = document.getElementById("right-card-value");
  var stageInfoText = document.getElementById("stage-info-text");

  if (_isBirthMode) {
    if (headerLabel) headerLabel.textContent = "아이의 나이";
    if (rightCardValue) rightCardValue.textContent = _currentChild.baby_name;
  } else {
    if (headerLabel) headerLabel.textContent = "아이와 함께하는 날";
    if (rightCardValue) rightCardValue.textContent = _currentChild.baby_name;
  }

  if (headerTitle) {
    headerTitle.textContent = "건강하게 자라고 있는 " + _currentChild.baby_name;
  }

  var dday = calculateDday();
  if (headerDday) headerDday.textContent = dday;
  if (leftCardValue) leftCardValue.textContent = getWeekNumber();
  if (stageInfoText) {
    if (_isBirthMode) {
      var daysAfterBirth = calculateDaysAfterBirth();
      var stage = getCurrentBirthStage();
      stageInfoText.textContent = "생후 " + daysAfterBirth + "일: " + stage.stage;
    } else {
      stageInfoText.textContent = getWeekNumber() + "주차: " + getStageInfo();
    }
  }

  if (!_isBirthMode) {
    var currentWeek = parseInt(getWeekNumber());
    var stageIndex = 0;

    if (currentWeek >= 12 && currentWeek < 20) {
      stageIndex = 1;
    } else if (currentWeek >= 20 && currentWeek < 28) {
      stageIndex = 2;
    } else if (currentWeek >= 28 && currentWeek < 36) {
      stageIndex = 3;
    } else if (currentWeek >= 36) {
      stageIndex = 4;
    }

    var stage = _growthStagesData[stageIndex];
    var characterImage = document.getElementById("character-image");
    if (characterImage && stage) {
      characterImage.src = stage.characterImage;
    }
  }
}

function calculateDaysAfterBirth() {
  if (!_currentChild || !_isBirthMode) return 0;

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var birthDate = new Date(_currentChild.birth_date);
  birthDate.setHours(0, 0, 0, 0);
  var diff = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function calculateDday() {
  if (!_currentChild) return "D-0";

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  if (_isBirthMode) {
    var birthDate = new Date(_currentChild.birth_date);
    birthDate.setHours(0, 0, 0, 0);
    var diff = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
    return "D+" + Math.max(0, diff);
  } else {
    var dueDate = new Date(_currentChild.due_date);
    dueDate.setHours(0, 0, 0, 0);
    var daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
    return "D-" + Math.max(0, daysDiff);
  }
}

function getCurrentBirthStage() {
  if (!_isBirthMode) return birthStagesData[0];

  var days = calculateDaysAfterBirth();
  var currentStage = birthStagesData[0];

  birthStagesData.forEach(function (stage) {
    if (days >= stage.minDay && days <= stage.maxDay) {
      currentStage = stage;
    }
  });

  return currentStage;
}

function getBirthStageIndex() {
  if (!_isBirthMode) return 0;

  var days = calculateDaysAfterBirth();

  for (var i = 0; i < birthStagesData.length; i++) {
    if (days >= birthStagesData[i].minDay && days <= birthStagesData[i].maxDay) {
      return i;
    }
  }

  return 0;
}

function getWeekNumber() {
  if (!_currentChild) return "0";

  if (_isBirthMode) {
    var birthDate = new Date(_currentChild.birth_date);
    var today = new Date();
    var weeks = Math.floor((today - birthDate) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, weeks).toString();
  } else {
    var dueDate = new Date(_currentChild.due_date);
    var today = new Date();
    var weeks = Math.floor((dueDate - today) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, 40 - weeks).toString();
  }
}

function mapPregnancyWeekToMissionWeek(pregnancyWeek) {
  var weekRanges = [
    { min: 1, max: 4, week: 4 },
    { min: 5, max: 8, week: 8 },
    { min: 9, max: 12, week: 12 },
    { min: 13, max: 16, week: 16 },
    { min: 17, max: 20, week: 20 },
    { min: 21, max: 24, week: 24 },
    { min: 25, max: 28, week: 28 },
    { min: 29, max: 31, week: 32 },
    { min: 32, max: 36, week: 36 },
    { min: 37, max: 40, week: 40 }
  ];

  for (var i = 0; i < weekRanges.length; i++) {
    if (pregnancyWeek >= weekRanges[i].min && pregnancyWeek <= weekRanges[i].max) {
      return weekRanges[i].week;
    }
  }

  return 40;
}

function mapBirthDaysToMissionWeek(daysAfterBirth) {
  if (daysAfterBirth >= 0 && daysAfterBirth <= 100) {
    return 100;
  } else if (daysAfterBirth >= 101 && daysAfterBirth <= 365) {
    return 365;
  } else if (daysAfterBirth >= 366 && daysAfterBirth <= 730) {
    return 730;
  }
  return null;
}

function getMissionWeek() {
  if (_isBirthMode) {
    var daysAfterBirth = calculateDaysAfterBirth();
    return mapBirthDaysToMissionWeek(daysAfterBirth);
  } else {
    var currentWeek = parseInt(getWeekNumber());
    return mapPregnancyWeekToMissionWeek(currentWeek);
  }
}

function getStageInfo() {
  var week = parseInt(getWeekNumber());

  if (_isBirthMode) {
    if (week <= 6) return "신생아기";
    if (week <= 9) return "4~6개월";
    return "7~9개월";
  } else {
    if (week <= 11) return "초기 적응기";
    if (week <= 19) return "안정기";
    if (week <= 27) return "태동기";
    if (week <= 35) return "성장기";
    return "출산 준비기";
  }
}

/* ---------- 공통 미션 리스트 렌더링 ---------- */
function renderMissionList(containerId, missions) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var items = container.querySelectorAll(".todak-mission-item");

  items.forEach(function (item, i) {
    if (i >= missions.length) {
      item.style.display = "none";
      return;
    }
    item.style.display = "";

    var mission = missions[i];
    var isCompleted = mission.completed || mission.icon === "completed" || false;

    var titleEl = item.querySelector(".todak-mission-item-text");
    var descEl = item.querySelector(".todak-mission-item-desc");
    var tagsEl = item.querySelector(".todak-mission-item-tags");
    var checkbox = item.querySelector(".todak-mission-checkbox");
    var statusEl = item.querySelector(".todak-mission-item-status");
    var timeEl = item.querySelector(".todak-mission-item-time");

    if (titleEl) titleEl.textContent = mission.title || mission.text || "";
    if (descEl) descEl.textContent = mission.desc || mission.description || "";
    if (tagsEl) {
      tagsEl.innerHTML = (mission.tags || [])
        .map(function (tag) {
          return '<span class="mission-tag">' + tag + "</span>";
        })
        .join("");
    }
    if (checkbox) {
      checkbox.checked = isCompleted;
      if (mission.id) checkbox.dataset.missionId = mission.id;
    }
    if (statusEl) statusEl.textContent = mission.status || (isCompleted ? "완료" : "예정");
    if (timeEl) timeEl.textContent = mission.time || "";

    item.classList.toggle("completed", isCompleted);
    if (mission.id) item.dataset.missionId = mission.id;
  });
}

/* ---------- 토닥 섹션 초기화 ---------- */
function initTodakSection() {
  if (!_todakMissions || _todakMissions.length === 0) return;

  var section = document.getElementById("todak-section");
  if (section && !section.classList.contains("hidden")) {
    renderTodakMissions();
  }

  var homeSection = document.getElementById("home-section");
  if (homeSection && !homeSection.classList.contains("hidden")) {
    renderHomeMissions();
  }
}

function getFilteredMissions() {
  var missionWeek = getMissionWeek();
  if (missionWeek === null) {
    return [];
  }

  return _todakMissions.filter(function (m) {
    return m.week === missionWeek;
  });
}

function renderTodakMissions() {
  var todayCompletionMap = {};
  _missionCompletions.forEach(function (c) {
    todayCompletionMap[c.mission_id] = c.id;
  });

  var categoryChild = document.getElementById("todak-category-child");
  var categorySelf = document.getElementById("todak-category-self");
  var categoryFamily = document.getElementById("todak-category-family");

  if (!categoryChild || !categorySelf || !categoryFamily) return;

  var filteredMissions = getFilteredMissions();

  var babyMissions = filteredMissions.filter(function (m) {
    return m.category === "baby";
  });
  var selfMissions = filteredMissions.filter(function (m) {
    return m.category === "self";
  });
  var familyMissions = filteredMissions.filter(function (m) {
    return m.category === "family";
  });

  populateMissionItems(categoryChild, babyMissions, todayCompletionMap);
  populateMissionItems(categorySelf, selfMissions, todayCompletionMap);
  populateMissionItems(categoryFamily, familyMissions, todayCompletionMap);

  attachMissionCheckboxEvents();
  updateMissionProgress();
}

function populateMissionItems(container, missions, todayCompletionMap) {
  var items = container.querySelectorAll(".todak-mission-item");

  items.forEach(function (item, index) {
    if (index >= missions.length) return;

    var mission = missions[index];
    var isCompleted = todayCompletionMap[mission.id] !== undefined;

    var titleEl = item.querySelector(".todak-mission-item-text");
    var descEl = item.querySelector(".todak-mission-item-desc");
    var tagsEl = item.querySelector(".todak-mission-item-tags");
    var checkbox = item.querySelector(".todak-mission-checkbox");

    if (titleEl) titleEl.textContent = mission.title || "";
    if (descEl) descEl.textContent = mission.description || "";

    if (tagsEl) {
      tagsEl.innerHTML = (mission.tags || []).map(function (tag) {
        return '<span class="mission-tag">' + tag + '</span>';
      }).join("");
    }

    if (checkbox) {
      checkbox.checked = isCompleted;
      checkbox.dataset.missionId = mission.id;
    }

    item.dataset.missionId = mission.id;
    item.classList.toggle("completed", isCompleted);
  });
}

function attachMissionCheckboxEvents() {
  var checkboxes = document.querySelectorAll("#todak-section .todak-mission-checkbox");

  checkboxes.forEach(function (checkbox) {
    checkbox.removeEventListener("change", checkbox._changeHandler);

    checkbox._changeHandler = async function () {
      var item = checkbox.closest(".todak-mission-item");
      var missionId = checkbox.dataset.missionId;
      var today = new Date().toISOString().split("T")[0];

      if (!item || !missionId) return;

      if (checkbox.checked) {
        item.classList.add("completed");

        if (supabase && _currentChild) {
          var { error } = await supabase
            .from("mission_completions")
            .insert([{
              child_id: _currentChild.id,
              mission_id: missionId,
              completed_date: today
            }]);

          if (error) {
            checkbox.checked = false;
            item.classList.remove("completed");
            console.error("[미션 완료 저장 오류]", error);
          }
        }
      } else {
        item.classList.remove("completed");

        if (supabase) {
          var completion = _missionCompletions.find(function (c) {
            return c.mission_id === missionId;
          });

          if (completion) {
            var { error: deleteError } = await supabase
              .from("mission_completions")
              .delete()
              .eq("id", completion.id);

            if (deleteError) {
              console.error("[미션 완료 삭제 오류]", deleteError);
            }
          }
        }
      }

      updateMissionProgress();
    };

    checkbox.addEventListener("change", checkbox._changeHandler);
  });
}

function renderHomeMissions() {
  var todayCompletionMap = {};
  _missionCompletions.forEach(function (c) {
    todayCompletionMap[c.mission_id] = c.id;
  });

  var filteredMissions = getFilteredMissions();
  var missionsToDisplay = filteredMissions.slice(0, 2).map(function (mission) {
    var isCompleted = todayCompletionMap[mission.id] !== undefined;
    return {
      id: mission.id,
      text: mission.title,
      status: isCompleted ? "완료" : "예정",
      time: "",
      completed: isCompleted,
    };
  });

  renderMissionList("mission-list", missionsToDisplay);

  var completedCount = missionsToDisplay.filter(function (m) { return m.completed; }).length;
  var missionStatus = document.getElementById("mission-status");
  if (missionStatus) {
    missionStatus.textContent = "진행중 " + completedCount + "/" + missionsToDisplay.length;
  }
}

function createMissionItemForTodak(mission, isCompleted) {
  var li = document.createElement("li");
  li.className = "todak-mission-item" + (isCompleted ? " completed" : "");

  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todak-mission-checkbox";
  checkbox.checked = isCompleted;
  checkbox.dataset.missionId = mission.id;
  checkbox.style.display = "none";

  var label = document.createElement("label");
  label.className = "todak-mission-label";
  label.innerHTML = '<span class="mission-title">' + mission.title + '</span>' +
    '<span class="mission-desc">' + (mission.description || "") + '</span>';

  li.appendChild(checkbox);
  li.appendChild(icon);
  li.appendChild(label);

  checkbox.addEventListener("change", async function () {
    var today = new Date().toISOString().split("T")[0];

    if (checkbox.checked) {
      icon.classList.add("completed");
      li.classList.add("completed");

      if (supabase && _currentChild) {
        var { error } = await supabase
          .from("mission_completions")
          .insert([{
            child_id: _currentChild.id,
            mission_id: mission.id,
            completed_date: today
          }]);

        if (error) {
          checkbox.checked = false;
          icon.classList.remove("completed");
          li.classList.remove("completed");
        }
      }
    } else {
      icon.classList.remove("completed");
      li.classList.remove("completed");

      if (supabase) {
        var completion = _missionCompletions.find(function (c) {
          return c.mission_id === mission.id;
        });

        if (completion) {
          await supabase
            .from("mission_completions")
            .delete()
            .eq("id", completion.id);
        }
      }
    }

    updateMissionProgress();
  });

  return li;
}

function updateMissionProgress() {
  var completed = document.querySelectorAll(".todak-mission-checkbox:checked").length;
  var total = document.querySelectorAll(".todak-mission-checkbox").length;

  var progressCount = document.getElementById("todak-progress-count");
  if (progressCount) {
    progressCount.textContent = completed + "/" + total;
  }

  var progressFill = document.getElementById("todak-progress-fill");
  if (progressFill) {
    var percentage = total > 0 ? (completed / total) * 100 : 0;
    progressFill.style.width = percentage + "%";
  }

  var filteredMissions = getFilteredMissions();

  var categoryBadges = {
    baby: document.getElementById("category-child-badge"),
    self: document.getElementById("category-self-badge"),
    family: document.getElementById("category-family-badge")
  };

  Object.keys(categoryBadges).forEach(function (category) {
    var badge = categoryBadges[category];
    if (!badge) return;

    var categoryMissions = filteredMissions.filter(function (m) {
      return m.category === category;
    });
    var completedCount = _missionCompletions.filter(function (c) {
      return categoryMissions.some(function (m) {
        return m.id === c.mission_id;
      });
    }).length;

    badge.textContent = completedCount + "/" + categoryMissions.length + " 완료";
  });
}

/* ---------- 가이드 섹션 초기화 ---------- */
function initGuideSection() {
  if (_isBirthMode) {
    initGuideSection_Birth();
  } else {
    initGuideSection_Pregnancy();
  }

  setupGuideDetailModal();
}

function initGuideSection_Pregnancy() {
  if (!_weeklyGuides || _weeklyGuides.length === 0) return;

  var currentWeek = parseInt(getWeekNumber());
  var stepCards = document.querySelectorAll(".guide-step-card");

  // loadMissionsData()와 동일한 주차 범위 로직 재사용
  var weekRanges = [
    { min: 1, max: 4, week: 4 },
    { min: 5, max: 8, week: 8 },
    { min: 9, max: 12, week: 12 },
    { min: 13, max: 16, week: 16 },
    { min: 17, max: 20, week: 20 },
    { min: 21, max: 24, week: 24 },
    { min: 25, max: 28, week: 28 },
    { min: 29, max: 31, week: 32 },
    { min: 32, max: 36, week: 36 },
    { min: 37, max: 40, week: 40 }
  ];

  // 현재 임신 주차의 범위 인덱스 찾기
  var currentRangeIndex = -1;
  for (var i = 0; i < weekRanges.length; i++) {
    if (currentWeek >= weekRanges[i].min && currentWeek <= weekRanges[i].max) {
      currentRangeIndex = i;
      break;
    }
  }

  // 범위를 찾을 수 없으면 마지막 범위 사용
  if (currentRangeIndex === -1) {
    currentRangeIndex = weekRanges.length - 1;
  }

  // 현재, 다음, 다다음 범위의 주차 계산
  var guideWeeks = [];
  for (var j = 0; j < 3; j++) {
    if (currentRangeIndex + j < weekRanges.length) {
      guideWeeks.push(weekRanges[currentRangeIndex + j].week);
    }
  }

  // .guide-week-card__number 업데이트 (현재 실제 임신 주차)
  var weekCardNumber = document.querySelector(".guide-week-card__number");
  if (weekCardNumber) {
    weekCardNumber.textContent = currentWeek;
  }

  // .guide-week-card__unit 업데이트
  var weekCardUnit = document.querySelector(".guide-week-card__unit");
  if (weekCardUnit) {
    weekCardUnit.textContent = "주차";
  }

  // .guide-period-link 업데이트 (${currentWeek}주차 맞춤 가이드)
  var guidePeriodLink = document.querySelector(".guide-period-link");
  if (guidePeriodLink) {
    guidePeriodLink.textContent = currentWeek + "주차 맞춤 가이드";
  }

  // 가이드 카드 업데이트
  stepCards.forEach(function (card, index) {
    if (index >= guideWeeks.length) return;

    var week = guideWeeks[index];
    var guide = _weeklyGuides.find(function (g) {
      return g.week === week;
    });

    if (guide) {
      card.querySelector(".guide-step-number").textContent = week + "주차";
      card.dataset.guideId = guide.id;

      card.addEventListener("click", function () {
        showGuideModal(guide.id);
      });
    }
  });
}

function initGuideSection_Birth() {
  var daysAfterBirth = calculateDaysAfterBirth();
  var stepCards = document.querySelectorAll(".guide-step-card");

  // .guide-week-card__number 업데이트 (생후 일수)
  var weekCardNumber = document.querySelector(".guide-week-card__number");
  if (weekCardNumber) {
    weekCardNumber.textContent = "D+" + daysAfterBirth;
  }

  // .guide-week-card__unit 업데이트
  var weekCardUnit = document.querySelector(".guide-week-card__unit");
  if (weekCardUnit) {
    weekCardUnit.textContent = "";
  }

  // .guide-period-link 업데이트
  var guidePeriodLink = document.querySelector(".guide-period-link");
  if (guidePeriodLink) {
    guidePeriodLink.textContent = "생후 " + daysAfterBirth + "일 맞춤 가이드";
  }

  // 가이드 카드 업데이트 (출산 후 단계별)
  var stageLabels = ["~100일", "~첫돌", "~2살"];
  stepCards.forEach(function (card, index) {
    if (index >= stageLabels.length) return;

    var label = stageLabels[index];
    var stepNumber = card.querySelector(".guide-step-number");
    if (stepNumber) {
      stepNumber.textContent = label;
    }

    // 간단한 설명 표시
    var stageInfo = birthStagesData[index];
    if (stageInfo) {
      card.addEventListener("click", function () {
        showGuideDetail(
          "birth-stage-" + index,
          stageInfo.stage,
          stageInfo.description
        );
      });
    }
  });
}

function showGuideDetail(guideId, stageName, description) {
  var modal = document.querySelector(".modal-overlay");
  if (!modal) return;

  var title = modal.querySelector(".modal__title");
  var content = modal.querySelector(".modal__body");

  if (title) title.textContent = stageName;
  if (content) content.innerHTML = "<p>" + description + "</p>";

  modal.classList.add("active");
}

/* ---------- 가이드 모달 함수 ---------- */
function showGuideModal(guideId) {
  var modalOverlay = document.getElementById("guide-modal-overlay");
  if (!modalOverlay) return;

  // _weeklyGuides에서 가이드 찾기
  var guide = _weeklyGuides.find(function (g) {
    return g.id === guideId;
  });

  if (!guide) {
    console.error("[가이드] 가이드를 찾을 수 없습니다:", guideId);
    return;
  }

  // 모달 헤더 제목 설정
  var modalTitle = document.getElementById("guide-modal-title");
  if (modalTitle && guide.stage_name) {
    modalTitle.textContent = guide.stage_name;
  }

  // guide_contents 조회 (Supabase에서 guide_id로 조회, display_order 기준 정렬)
  if (window.supabase) {
    window.supabase
      .from("guide_contents")
      .select("*")
      .eq("guide_id", guideId)
      .order("display_order", { ascending: true })
      .then(function (response) {
        if (response.error) {
          console.error("[가이드] guide_contents 조회 오류:", response.error);
          displayGuideModalError();
          return;
        }

        var contents = response.data || [];

        if (contents.length === 0) {
          // 데이터가 없는 경우
          displayGuideModalEmpty();
        } else {
          // 데이터가 있는 경우: section들에 매핑
          displayGuideModalContents(contents);
        }

        // 모달 열기 (body 스크롤 제한)
        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";

        // 모달 닫기 기능 설정
        setupGuideModalClose();
        setupGuideDetailModal();
      })
      .catch(function (error) {
        console.error("[가이드] guide_contents 조회 예외:", error);
        displayGuideModalError();

        // 모달 열기 (body 스크롤 제한)
        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";

        // 모달 닫기 기능 설정
        setupGuideModalClose();
        setupGuideDetailModal();
      });
  } else {
    console.error("[가이드] Supabase 클라이언트가 초기화되지 않았습니다.");
    displayGuideModalError();

    // 모달 열기 (body 스크롤 제한)
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // 모달 닫기 기능 설정
    setupGuideModalClose();
  }
}

/* 가이드 모달 콘텐츠 표시 */
function displayGuideModalContents(contents) {
  var modalBody = document.querySelector(".modal__body--guide");
  if (!modalBody) return;

  var sections = modalBody.querySelectorAll(".guide-modal__section");
  var emptyMessage = modalBody.querySelector(".guide-modal__empty-message");

  // 초기 상태: 모든 section 숨김, 빈 메시지도 숨김
  sections.forEach(function (section) {
    section.style.display = "none";
  });
  if (emptyMessage) {
    emptyMessage.style.display = "none";
  }

  // display_order 1, 2, 3에 해당하는 contents를 찾아서 section에 매핑
  contents.forEach(function (content) {
    var orderIndex = content.display_order - 1; // display_order 1 → index 0, 2 → 1, 3 → 2

    if (orderIndex >= 0 && orderIndex < sections.length) {
      var section = sections[orderIndex];
      var titleElement = section.querySelector(".guide-modal__guide-title");
      var descriptionElement = section.querySelector(".guide-modal__description");

      if (titleElement) {
        titleElement.textContent = content.section_title || "";
      }
      if (descriptionElement) {
        descriptionElement.textContent = content.section_content || "";
      }

      section.style.display = "flex";
    }
  });
}

/* 가이드 모달 빈 상태 표시 */
function displayGuideModalEmpty() {
  var modalBody = document.querySelector(".modal__body--guide");
  if (!modalBody) return;

  var sections = modalBody.querySelectorAll(".guide-modal__section");
  var emptyMessage = modalBody.querySelector(".guide-modal__empty-message");

  // 모든 section 숨김
  sections.forEach(function (section) {
    section.style.display = "none";
  });

  // 빈 메시지 표시
  if (emptyMessage) {
    emptyMessage.style.display = "block";
  }
}

/* 가이드 모달 오류 상태 표시 */
function displayGuideModalError() {
  var modalBody = document.querySelector(".modal__body--guide");
  if (!modalBody) return;

  var sections = modalBody.querySelectorAll(".guide-detail-section");
  var emptyMessage = modalBody.querySelector(".guide-modal__empty-message");

  // 모든 section 숨김
  sections.forEach(function (section) {
    section.style.display = "none";
  });

  // 빈 메시지 표시
  if (emptyMessage) {
    emptyMessage.style.display = "block";
  }
}

/* 가이드 모달 닫기 기능 설정 */
function setupGuideModalClose() {
  var modalOverlay = document.getElementById("guide-modal-overlay");
  if (!modalOverlay) return;

  var closeBtn = modalOverlay.querySelector(".modal__close-btn");
  var modal = modalOverlay.querySelector(".modal--guide");

  // X 버튼 클릭
  if (closeBtn && !closeBtn.hasAttribute("data-guide-listener-attached")) {
    closeBtn.setAttribute("data-guide-listener-attached", "true");
    closeBtn.addEventListener("click", function () {
      closeGuideModal();
    });
  }

  // 배경 클릭
  if (modalOverlay && !modalOverlay.hasAttribute("data-guide-bg-listener-attached")) {
    modalOverlay.setAttribute("data-guide-bg-listener-attached", "true");
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        closeGuideModal();
      }
    });
  }

  // ESC 키
  if (!window._guideModalEscListener) {
    window._guideModalEscListener = true;
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var overlay = document.getElementById("guide-modal-overlay");
        if (overlay && overlay.classList.contains("active")) {
          closeGuideModal();
        }
      }
    });
  }
}

/* 가이드 모달 닫기 */
function closeGuideModal() {
  var modalOverlay = document.getElementById("guide-modal-overlay");
  if (!modalOverlay) return;

  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

/* ---------- 가이드 상세 모달 함수 ---------- */
var guideDetailData = {
  birthReady: {
    title: "출산 준비",
    sections: [
      {
        title: "병원 가방 리스트",
        content: "출산 예정일이 가까워지면 산모수첩, 신분증, 세면도구, 여벌 속옷, 수유 브라 등을 미리 준비해주세요."
      },
      {
        title: "출산 전 확인할 것",
        content: "진통이 시작되었을 때 연락할 병원, 보호자 연락처, 이동 방법 등을 미리 확인해두세요."
      },
      {
        title: "마음가짐",
        content: "출산은 엄마와 아기가 함께 시작하는 새로운 여정입니다. 불안한 마음이 드는 것은 자연스러운 일이니 스스로를 믿고 차분하게 준비해보세요."
      }
    ]
  },
  parenting: {
    title: "육아 가이드",
    sections: [
      {
        title: "신생아 기본 케어",
        content: "신생아의 피부는 매우 예민하므로 부드러운 제품을 사용하세요. 목욕 후에는 보습제를 발라 피부가 건조해지지 않도록 관리해주세요. 목욕은 짧게, 따뜻한 물로 하는 것이 좋습니다."
      },
      {
        title: "수유 및 이유식",
        content: "시간보다 아이의 배고픔 신호를 먼저 살피고, 수유 후에는 트림을 충분히 시켜주세요. 생후 6개월까지는 모유나 분유만 먹이고, 6개월 이후부터 이유식을 시작하세요. 아기의 반응을 관찰하면서 천천히 진행합니다."
      },
      {
        title: "아기 수면 습관",
        content: "일정한 수면 시간을 정해두고 루틴을 만드는 것이 중요합니다. 낮에는 밝게, 밤에는 어둡게 유지해 아이가 천천히 낮과 밤을 구분할 수 있도록 도와주세요."
      },
      {
        title: "예방 접종 일정",
        content: "정기적인 예방 접종은 아기의 건강을 지키는 가장 좋은 방법입니다. 병원에서 권장하는 일정을 따르세요."
      }
    ]
  },
  vaccination: {
    title: "예방접종",
    sections: [
      {
        title: "신생아 기본 접종",
        content: "생후 24시간 내: B형 간염 1차, BCG. 생후 1-2주: B형 간염 2차"
      },
      {
        title: "2-6개월 접종",
        content: "생후 2개월: 다다백신(DTP), 소아마비, 로타바이러스. 생후 4개월: 다다백신 2차, 소아마비 2차. 생후 6개월: 다다백신 3차"
      },
      {
        title: "12-15개월 접종",
        content: "생후 12개월: 홍역, 볼거리, 풍진(MMR). 생후 15개월: 다다백신 추가"
      },
      {
        title: "접종 후 주의사항",
        content: "접종 후 발열, 부종, 발진 등이 있을 수 있습니다. 대부분 일시적이나 계속되면 병원에 가세요."
      }
    ]
  },
  support: {
    title: "정부 지원금",
    sections: [
      {
        title: "부모급여",
        content: "2026년에도 영아기 가정의 양육 부담을 줄이기 위해 부모급여가 지원됩니다. 아이의 월령에 따라 지급 금액이 달라질 수 있으니, 복지로 또는 주민센터에서 현재 기준을 확인해보세요."
      },
      {
        title: "아동수당",
        content: "아동수당은 아이의 건강한 성장과 양육비 부담 완화를 위해 매월 지급되는 지원금입니다. 출생신고 후 신청할 수 있으며, 지급 대상과 기간은 정부 정책에 따라 달라질 수 있습니다."
      },
      {
        title: "신청 방법",
        content: "정부 지원금은 복지로 온라인 신청 또는 거주지 주민센터 방문을 통해 신청할 수 있습니다. 출생신고 후 가능한 빨리 신청하면 지급 누락을 줄일 수 있어요."
      },
      {
        title: "확인할 것",
        content: "지원금은 아이의 나이, 출생일, 가구 상황, 정책 변경에 따라 달라질 수 있습니다. 신청 전 최신 기준과 지급일, 중복 지원 가능 여부를 꼭 확인해주세요."
      }
    ]
  },
  sleep: {
    title: "밤에 잠들지 않는 아이 달래기",
    sections: [
        {
            title: "잠들기 전 루틴 만들기",
            content:
                "매일 같은 시간에 목욕, 책 읽기, 자장가처럼 일정한 순서를 반복하면 아이가 자연스럽게 잠잘 시간임을 인식하게 됩니다."
        },
        {
            title: "수면 환경 조성",
            content:
                "방은 어둡고 조용하게 유지하고, 실내 온도는 20~22℃ 정도가 적당합니다. 너무 밝은 조명이나 TV 소리는 숙면을 방해할 수 있어요."
        },
        {
            title: "바로 안아주기보다 기다리기",
            content:
                "잠시 뒤척이는 것은 자연스러운 과정입니다. 바로 안아주기보다 1~2분 정도 지켜본 후 달래주면 스스로 잠드는 습관을 기르는 데 도움이 됩니다."
        },
        {
            title: "엄마도 충분한 휴식",
            content:
                "아이가 잠든 시간에는 엄마도 함께 쉬어야 합니다. 충분한 휴식은 육아 스트레스를 줄이고 아이를 더 안정적으로 돌볼 수 있게 도와줍니다."
        }
    ]
  },
  babyfood: {
    title: "초기 이유식 시작 가이드라인",
    sections: [
        {
            title: "언제 시작할까요?",
            content:
                "생후 약 6개월 전후, 목을 잘 가누고 음식에 관심을 보이기 시작하면 이유식을 시작할 수 있습니다."
        },
        {
            title: "처음에는 한 가지 식재료",
            content:
                "쌀미음처럼 소화가 쉬운 음식부터 시작하고 새로운 식재료는 2~3일 간격으로 하나씩 추가하여 알레르기 반응을 확인하세요."
        },
        {
            title: "양보다 경험이 중요",
            content:
                "초기 이유식은 많이 먹이는 것이 목적이 아니라 음식의 맛과 질감을 경험하는 시기입니다. 아이가 거부해도 천천히 적응할 시간을 주세요."
        },
        {
            title: "주의사항",
            content:
                "꿀, 생우유, 견과류 등은 시기에 따라 제한이 필요합니다. 월령에 맞는 식단을 참고하고 이상 증상이 있으면 전문가와 상담하세요."
        }
    ]
  }
};

function setupGuideDetailModal() {
  var detailModalOverlay = document.getElementById("guide-detail-modal-overlay");
  if (!detailModalOverlay) return;

  setupGuideMainDetailSectionModal();
  setupGuideCardDetailModal();
  setupGuidePopularCardModal();
  setupGuideDetailModalClose();
}

function setupGuideMainDetailSectionModal() {
  var guideDetailSection = document.querySelector(
    "#guide-section > .guide-content .guide-detail-section"
  );

  if (!guideDetailSection) return;

  if (!guideDetailSection.hasAttribute("data-main-detail-listener-attached")) {
    guideDetailSection.setAttribute("data-main-detail-listener-attached", "true");

    guideDetailSection.addEventListener("click", function () {
      renderGuideDetailModal("birthReady");
      showGuideDetailModal();
    });

    guideDetailSection.style.cursor = "pointer";
  }
}

function setupGuideCardDetailModal() {
  var guideDetailCards = document.querySelectorAll(
    "#guide-section .guide-cards-grid .guide-detail-card[data-guide-type]"
  );

  guideDetailCards.forEach(function (card) {
    if (!card.hasAttribute("data-card-detail-listener-attached")) {
      card.setAttribute("data-card-detail-listener-attached", "true");

      card.addEventListener("click", function () {
        var guideType = card.getAttribute("data-guide-type");
        renderGuideDetailModal(guideType);
        showGuideDetailModal();
      });

      card.style.cursor = "pointer";
    }
  });
}



function renderGuideDetailModal(guideType) {
  var data = guideDetailData[guideType];
  if (!data) return;

  var modalTitle = document.getElementById("guide-detail-modal-title");
  var modalBody = document.getElementById("guide-detail-modal-body");

  if (modalTitle) {
    modalTitle.textContent = data.title;
  }

  if (modalBody) {
    modalBody.innerHTML = "";

    data.sections.forEach(function (section, index) {
      var sectionDiv = document.createElement("div");
      var bgClass = index % 2 === 0 ? "guide-detail-section--purple" : "guide-detail-section--pink";
      sectionDiv.className = "guide-detail-section " + bgClass;

      var titleDiv = document.createElement("h4");
      titleDiv.className = "guide-detail-title";
      titleDiv.textContent = section.title;

      var contentDiv = document.createElement("div");
      contentDiv.className = "guide-detail-content";
      contentDiv.textContent = section.content;

      sectionDiv.appendChild(titleDiv);
      sectionDiv.appendChild(contentDiv);
      modalBody.appendChild(sectionDiv);
    });
  }
}

function showGuideDetailModal() {
  var detailModalOverlay = document.getElementById("guide-detail-modal-overlay");
  if (!detailModalOverlay) {
    console.log("상세 모달 없음");
    return;
  }

  console.log("상세 모달 열림");
  detailModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeGuideDetailModal() {
  var detailModalOverlay = document.getElementById("guide-detail-modal-overlay");
  if (!detailModalOverlay) return;

  detailModalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

function setupGuideDetailModalClose() {
  var detailModalOverlay = document.getElementById("guide-detail-modal-overlay");
  if (!detailModalOverlay) return;

  var closeBtn = detailModalOverlay.querySelector(".modal__close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      closeGuideDetailModal();
    });
  }

  detailModalOverlay.addEventListener("click", function (e) {
    if (e.target === detailModalOverlay) {
      closeGuideDetailModal();
    }
  });

  if (!window._guideDetailModalEscListener) {
    window._guideDetailModalEscListener = true;
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var overlay = document.getElementById("guide-detail-modal-overlay");
        if (overlay && overlay.classList.contains("active")) {
          closeGuideDetailModal();
        }
      }
    });
  }
}

function setupGuidePopularCardModal() {

    var cards = document.querySelectorAll(
        ".guide-popular-card[data-guide-type]"
    );

    cards.forEach(function(card){

        if(!card.hasAttribute("data-popular-listener")){

            card.setAttribute("data-popular-listener","true");

            card.addEventListener("click",function(){

                renderGuideDetailModal(
                    card.dataset.guideType
                );

                showGuideDetailModal();

            });

            card.style.cursor="pointer";

        }

    });

}

/* ---------- 로그인 폼 ---------- */
(function () {
  var form = document.getElementById("login-form");
  if (!form) return;

  var newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  var toggleBtn = document.getElementById("pw-toggle");
  var pwInput = document.getElementById("login-password");
  if (toggleBtn && pwInput) {
    toggleBtn.addEventListener("click", function () {
      var isHidden = pwInput.type === "password";
      pwInput.type = isHidden ? "text" : "password";
      toggleBtn.classList.toggle("is-visible", isHidden);
    });
  }

  newForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    var email = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;

    if (!email) {
      showToast("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      showToast("비밀번호를 입력해주세요.");
      return;
    }

    try {
      if (supabase && supabase.auth) {
        var { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        if (error) throw error;

        var hasChildInfo = await checkChildInfo();

        if (!hasChildInfo) {
          newForm.reset();
          showSection("onboarding-section");
          return;
        }

        await loadHomeData();
        setupTabsAfterLogin();
      }

      newForm.reset();
      showSection("home-section");
    } catch (err) {
      showToast(translateSupabaseError(err.message));
    }
  });
})();

/* ---------- 세션 유지 ---------- */
(async function () {
  try {
    if (!supabase || !supabase.auth) {
      showSection("login-section");
      return;
    }
    var {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      /* 아이 정보 확인 */
      var hasChildInfo = await checkChildInfo();

      if (!hasChildInfo) {
        showSection("onboarding-section");
        return;
      }

      await loadHomeData();
      setupTabsAfterLogin();
      showSection("home-section");
    } else {
      showSection("login-section");
    }
  } catch (_) {
    showSection("login-section");
  }
})();

/* ---------- 로그아웃 ---------- */
(function () {
  var logoutBtn = document.querySelector(".mypage-logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async function () {
    try {
      if (supabase && supabase.auth) {
        var { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      showSection("login-section");
    } catch (err) {
      showToast(translateSupabaseError(err.message));
    }
  });
})();

/* ---------- 공동 양육자 초대 코드 모달 ---------- */
(function () {
  var inviteCodeBtn = document.getElementById("invite-code-btn");
  var inviteCodeModalOverlay = document.getElementById(
    "invite-code-modal-overlay",
  );
  var inviteCodeCloseBtn = document.querySelector(
    "#invite-code-modal-overlay .modal__close-btn",
  );
  var inviteCodeCloseBtnAlt = document.getElementById("invite-code-close-btn");
  var inviteCodeCopyBtn = document.getElementById("invite-code-copy-btn");
  var inviteCodeValue = document.getElementById("invite-code-value");
  var inviteCodeMessage = document.getElementById("invite-code-message");
  var inviteCodeBox = document.getElementById("invite-code-box");

  if (!inviteCodeBtn) return;

  inviteCodeBtn.addEventListener("click", async function () {
    try {
      if (!supabase || !supabase.auth) {
        showToast("Supabase가 초기화되지 않았습니다.");
        return;
      }

      var { data: authData, error: authErr } = await supabase.auth.getUser();

      if (authErr || !authData || !authData.user) {
        showInviteCodeError("로그인이 필요합니다.");
        showInviteCodeModal();
        return;
      }

      var userId = authData.user.id;

      var { data: userData, error: userErr } = await supabase
        .from("users")
        .select("child_id")
        .eq("id", userId)
        .single();

      if (userErr || !userData || !userData.child_id) {
        showInviteCodeError("아직 아이 정보가 등록되지 않았습니다.");
        showInviteCodeModal();
        return;
      }

      var childId = userData.child_id;

      var { data: childData, error: childErr } = await supabase
        .from("children")
        .select("id, invite_code")
        .eq("id", childId)
        .single();

      if (childErr || !childData) {
        showInviteCodeError("아이 정보를 찾을 수 없습니다.");
        showInviteCodeModal();
        return;
      }

      var code = childData.invite_code;

      if (!code) {
        showInviteCodeError("초대코드를 찾을 수 없습니다.");
        showInviteCodeModal();
        return;
      }

      clearInviteCodeMessage();
      inviteCodeValue.textContent = code;
      showInviteCodeModal();
    } catch (err) {
      showToast(translateSupabaseError(err.message));
    }
  });

  /* 모달 열기 함수 */
  function showInviteCodeModal() {
    if (inviteCodeModalOverlay) {
      inviteCodeModalOverlay.classList.add("active");
    }
  }

  /* 모달 닫기 함수 */
  function closeInviteCodeModal() {
    if (inviteCodeModalOverlay) {
      inviteCodeModalOverlay.classList.remove("active");
    }
  }

  /* 에러 메시지 표시 */
  function showInviteCodeError(message) {
    inviteCodeMessage.textContent = message;
    inviteCodeMessage.className = "invite-code-message error";
    inviteCodeMessage.style.display = "block";
    if (inviteCodeBox) {
      inviteCodeBox.style.display = "none";
    }
    if (inviteCodeCopyBtn) {
      inviteCodeCopyBtn.style.display = "none";
    }
  }

  /* 메시지 초기화 */
  function clearInviteCodeMessage() {
    inviteCodeMessage.style.display = "none";
    inviteCodeMessage.textContent = "";
    inviteCodeMessage.className = "invite-code-message";
    if (inviteCodeBox) {
      inviteCodeBox.style.display = "flex";
    }
    if (inviteCodeCopyBtn) {
      inviteCodeCopyBtn.style.display = "flex";
    }
  }

  /* 복사 버튼 클릭 */
  if (inviteCodeCopyBtn) {
    inviteCodeCopyBtn.addEventListener("click", async function () {
      var code = inviteCodeValue.textContent;
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code);
        showToast("초대코드가 복사되었습니다.");
      } catch (err) {
        showToast("코드 복사에 실패했습니다.");
      }
    });
  }

  /* 모달 닫기 버튼 */
  if (inviteCodeCloseBtn) {
    inviteCodeCloseBtn.addEventListener("click", closeInviteCodeModal);
  }
  if (inviteCodeCloseBtnAlt) {
    inviteCodeCloseBtnAlt.addEventListener("click", closeInviteCodeModal);
  }

  /* 오버레이 클릭 시 닫기 */
  if (inviteCodeModalOverlay) {
    inviteCodeModalOverlay.addEventListener("click", function (e) {
      if (e.target === inviteCodeModalOverlay) {
        closeInviteCodeModal();
      }
    });
  }
})();

/* ------------------------------------------
   온보딩 초기화 (사용자 역할 확인)
   ------------------------------------------ */

async function initOnboarding() {
  try {
    if (!supabase || !supabase.auth) {
      return;
    }

    var { data: authData, error: authErr } = await supabase.auth.getUser();

    if (authErr || !authData || !authData.user) {
      return;
    }

    var userId = authData.user.id;

    var { data: userData, error: userErr } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userErr) {
      return;
    }

    var userRole = userData?.role || "mom";
    _todakRole = userRole;

    var momOnlySections = document.querySelectorAll(".form-section--mom-only");
    var guardianOnlySections = document.querySelectorAll(
      ".form-section--guardian-only",
    );

    momOnlySections.forEach(function (el) {
      el.classList.toggle("hidden", userRole !== "mom");
    });

    guardianOnlySections.forEach(function (el) {
      el.classList.toggle("hidden", userRole !== "guardian");
    });
  } catch (err) {
  }
}

/* ------------------------------------------
   사용자 아이 정보 확인
   ------------------------------------------ */

async function checkChildInfo() {
  try {
    if (!supabase || !supabase.auth) {
      return false;
    }

    var { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData || !authData.user) {
      return false;
    }

    var userId = authData.user.id;

    var { data: userData, error: userErr } = await supabase
      .from("users")
      .select("child_id")
      .eq("id", userId)
      .single();

    if (userErr) {
      return false;
    }

    if (userData && userData.child_id) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

/* ------------------------------------------
   마이페이지 사용자 정보 로드
   ------------------------------------------ */

async function loadMypageUserInfo() {
  try {
    if (!supabase || !supabase.auth) {
      return;
    }

    var { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData || !authData.user) {
      return;
    }

    var user = authData.user;
    var userEmail = user.email || "";

    var { data: userData, error: userErr } = await supabase
      .from("users")
      .select("id, name, role, child_id, profile_image")
      .eq("id", user.id)
      .single();

    var userName = userData?.name || "사용자";
    var defaultAvatar = userData?.role === "guardian" ? "image/man.png" : "image/woman.png";
    var avatarUrl = getProfileImageUrl(userData?.profile_image, defaultAvatar);

    var profileNameEl = document.querySelector(".mypage-profile-name");
    var profileEmailEl = document.querySelector(".mypage-profile-email");
    var profileAvatarEl = document.querySelector(".mypage-profile-avatar img");

    if (profileNameEl) {
      profileNameEl.textContent = userName + " 님";
    }
    if (profileEmailEl) {
      profileEmailEl.textContent = userEmail;
    }
    if (profileAvatarEl) {
      profileAvatarEl.src = avatarUrl;
    }

    // 프로필 수정 버튼 클릭 이벤트
    var profileEditBtn = Array.from(document.querySelectorAll(".btn.btn--sm.btn--secondary")).find(function(btn) {
      return btn.textContent.includes("프로필 수정");
    });
    if (profileEditBtn) {
      profileEditBtn.onclick = function() {
        showProfileImageModal(user.id);
      };
    }

    // 자녀 정보 로드 및 업데이트
    if (_currentChild) {
      updateMypageChildInfo();
    }

    // 가족 목록 로드
    await loadMypageFamilyInfo(user.id, userData?.child_id, userData?.role);
  } catch (err) {
  }
}

/* ------------------------------------------
   마이페이지 가족 목록 로드
   ------------------------------------------ */

async function loadMypageFamilyInfo(currentUserId, childId, currentUserRole) {
  var familyCard = document.querySelector(".mypage-family-card");
  if (!familyCard) return;

  if (!supabase || !childId) {
    familyCard.innerHTML =
      '<p class="mypage-family-empty">연결된 가족이 없습니다.</p>';
    return;
  }

  try {
    var query = supabase
      .from("users")
      .select("id, name, role")
      .eq("child_id", childId)
      .neq("id", currentUserId);

    // 엄마는 보호자만 표시
    if (currentUserRole === "mom") {
      query = query.eq("role", "guardian");
    }

    var { data: familyList, error } = await query;

    if (error || !familyList || familyList.length === 0) {
      familyCard.innerHTML =
        '<p class="mypage-family-empty">연결된 가족이 없습니다.</p>';
      return;
    }

    // 보호자 로그인 시 엄마를 가장 위로
    familyList.sort(function (a, b) {
      if (a.role === "mom" && b.role !== "mom") return -1;
      if (a.role !== "mom" && b.role === "mom") return 1;
      return 0;
    });

    var html = "";

    familyList.forEach(function (member, index) {
      var roleLabel = member.role === "mom" ? "엄마" : "보호자";
      var memberName = member.name || "이름 없음";

      if (index > 0) {
        html += '<div class="mypage-family-divider"></div>';
      }

      html +=
        '<div class="mypage-family-item">' +
          '<div class="mypage-family-info">' +
            '<div class="mypage-family-name-row">' +
              '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' + 
                  '<rect width="40" height="40" rx="20" fill="#F4F0FD"/>' + 
                  '<path d="M20 20C18.9 20 17.9583 19.6083 17.175 18.825C16.3917 18.0417 16 17.1 16 16C16 14.9 16.3917 13.9583 17.175 13.175C17.9583 12.3917 18.9 12 20 12C21.1 12 22.0417 12.3917 22.825 13.175C23.6083 13.9583 24 14.9 24 16C24 17.1 23.6083 18.0417 22.825 18.825C22.0417 19.6083 21.1 20 20 20ZM12 28V25.2C12 24.6333 12.1458 24.1125 12.4375 23.6375C12.7292 23.1625 13.1167 22.8 13.6 22.55C14.6333 22.0333 15.6833 21.6458 16.75 21.3875C17.8167 21.1292 18.9 21 20 21C21.1 21 22.1833 21.1292 23.25 21.3875C24.3167 21.6458 25.3667 22.0333 26.4 22.55C26.8833 22.8 27.2708 23.1625 27.5625 23.6375C27.8542 24.1125 28 24.6333 28 25.2V28H12ZM14 26H26V25.2C26 25.0167 25.9542 24.85 25.8625 24.7C25.7708 24.55 25.65 24.4333 25.5 24.35C24.6 23.9 23.6917 23.5625 22.775 23.3375C21.8583 23.1125 20.9333 23 20 23C19.0667 23 18.1417 23.1125 17.225 23.3375C16.3083 23.5625 15.4 23.9 14.5 24.35C14.35 24.4333 14.2292 24.55 14.1375 24.7C14.0458 24.85 14 25.0167 14 25.2V26ZM20 18C20.55 18 21.0208 17.8042 21.4125 17.4125C21.8042 17.0208 22 16.55 22 16C22 15.45 21.8042 14.9792 21.4125 14.5875C21.0208 14.1958 20.55 14 20 14C19.45 14 18.9792 14.1958 18.5875 14.5875C18.1958 14.9792 18 15.45 18 16C18 16.55 18.1958 17.0208 18.5875 17.4125C18.9792 17.8042 19.45 18 20 18Z" fill="#674E99"/>' + 
                '</svg>' +

              '<h4 class="mypage-family-name">' +
                memberName +
              '</h4>' +

              '<span class="mypage-family-role">' +
                roleLabel +
              '</span>' +

            '</div>' +

            '<p class="mypage-family-access"></p>' +

          '</div>' +

          '<button class="mypage-family-menu" aria-label="설정">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
              '<circle cx="12" cy="12" r="2" fill="currentColor"/>' +
              '<circle cx="19" cy="12" r="2" fill="currentColor"/>' +
              '<circle cx="5" cy="12" r="2" fill="currentColor"/>' +
            '</svg>' +
          '</button>' +

        '</div>';
    });

    familyCard.innerHTML = html;

  } catch (err) {
    familyCard.innerHTML =
      '<p class="mypage-family-empty">연결된 가족이 없습니다.</p>';
  }
}

function updateMypageChildInfo() {
  if (!_currentChild) return;

  var childNameEl = document.querySelector(".mypage-child-name");
  if (childNameEl) {
    childNameEl.textContent = _currentChild.baby_name || "토닥이";
  }

  var ddayEl = document.querySelector(".mypage-child-dday");
  var metaValueEls = document.querySelectorAll(".mypage-child-meta-value");

  if (ddayEl) {
    ddayEl.textContent = calculateDday();
  }

  if (metaValueEls.length >= 2) {
    var dateStr = "";
    if (_isBirthMode) {
      var birthDate = new Date(_currentChild.birth_date);
      dateStr = formatDateDisplay(birthDate);
    } else {
      var dueDate = new Date(_currentChild.due_date);
      dateStr = formatDateDisplay(dueDate);
    }
    metaValueEls[0].textContent = dateStr;

    var genderStr = _isBirthMode ? _currentChild.gender : "미정";
    metaValueEls[1].textContent = genderStr;
  }
}

function formatDateDisplay(date) {
  if (!date) return "";
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  return year + "." + month + "." + day;
}

/* ------------------------------------------
   성장 기록 Supabase 연동
   ------------------------------------------ */

async function loadLastGrowthRecord() {
  try {
    if (!supabase) {
      console.log("[TODAK] Supabase 미초기화");
      return null;
    }

    if (!_currentChild) {
      console.log("[TODAK] 아이 정보 없음");
      return null;
    }

    console.log("[TODAK] 마지막 성장 기록 조회 시작 - 아이:", _currentChild.id);

    var { data, error } = await supabase
      .from("growth_records")
      .select("*")
      .eq("child_id", _currentChild.id)
      .order("record_date", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[TODAK] 마지막 기록 조회 실패:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      console.log("[TODAK] 마지막 기록 조회 성공:", data[0]);
      return data[0];
    }

    console.log("[TODAK] 기존 기록 없음");
    return null;
  } catch (err) {
    console.error("[TODAK] 마지막 기록 조회 중 에러:", err.message);
    return null;
  }
}

async function saveGrowthRecord(recordData) {
  try {
    if (!supabase || !supabase.auth) {
      console.log("[TODAK] Supabase 미초기화");
      return null;
    }

    if (!_currentChild) {
      console.log("[TODAK] 아이 정보 없음");
      return null;
    }

    var { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      console.log("[TODAK] 로그인 필요");
      return null;
    }

    var today = new Date();
    var recordDate = recordData.record_date || today.toISOString().split("T")[0];

    console.log("[TODAK] 성장 기록 저장 시작 - 아이:", _currentChild.id, "날짜:", recordDate);

    var insertData = {
      child_id: _currentChild.id,
      record_date: recordDate,
      height: recordData.height || null,
      weight: recordData.weight || null,
      photo_url: recordData.photo_url || null,
      memo: recordData.memo || null,
      created_by: authData.user.id,
    };

    console.log("[TODAK] 저장 데이터:", insertData);

    var { data, error } = await supabase
      .from("growth_records")
      .insert([insertData])
      .select();

    if (error) {
      console.error("[TODAK] 성장 기록 저장 실패:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      console.log("[TODAK] 성장 기록 저장 성공:", data[0]);
      _growthRecords.unshift(data[0]);
      return data[0];
    }

    return null;
  } catch (err) {
    console.error("[TODAK] 성장 기록 저장 중 에러:", err.message);
    return null;
  }
}

async function saveFeedingRecord(growthRecordId, feedingType, amountMl) {
  try {
    if (!supabase || !supabase.auth) {
      console.log("[TODAK] Supabase 미초기화");
      return false;
    }

    var { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      console.log("[TODAK] 로그인 필요");
      return false;
    }

    var userId = authData.user.id;

    console.log(
      "[TODAK] 수유 기록 저장 시작 - 기록ID:",
      growthRecordId,
      "수유종류:",
      feedingType,
    );

    var insertData = {
      user_id: userId,
      growth_record_id: growthRecordId,
      feeding_type: feedingType,
      amount_ml: amountMl || null,
    };

    console.log("[TODAK] 수유 기록 저장 데이터:", insertData);

    var { error } = await supabase
      .from("feeding_records")
      .insert([insertData]);

    if (error) {
      console.error("[TODAK] 수유 기록 저장 실패:", error.message);
      return false;
    }

    console.log("[TODAK] 수유 기록 저장 성공");
    return true;
  } catch (err) {
    console.error("[TODAK] 수유 기록 저장 중 에러:", err.message);
    return false;
  }
}

async function uploadGrowthPhoto(file) {
  try {
    if (!supabase) {
      console.log("[TODAK] Supabase 미초기화");
      return null;
    }

    if (!file) {
      console.log("[TODAK] 파일 없음");
      return null;
    }

    if (!_currentChild) {
      console.log("[TODAK] 아이 정보 없음");
      return null;
    }

    var childId = _currentChild.id;
    var timestamp = Date.now();
    var fileName = childId + "_" + timestamp + "_" + file.name;

    console.log("[TODAK] 사진 업로드 시작 - 파일명:", fileName);

    var { data, error } = await supabase.storage
      .from("growth-records")
      .upload(fileName, file);

    if (error) {
      console.error("[TODAK] 사진 업로드 실패:", error.message);
      return null;
    }

    console.log("[TODAK] 사진 업로드 성공:", data);

    var { data: publicUrlData } = supabase.storage
      .from("growth-records")
      .getPublicUrl(fileName);

    var photoUrl = publicUrlData?.publicUrl || null;
    console.log("[TODAK] 사진 공개 URL:", photoUrl);

    return photoUrl;
  } catch (err) {
    console.error("[TODAK] 사진 업로드 중 에러:", err.message);
    return null;
  }
}

function getLocalDateString(date) {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

async function fetchGrowthRecordsByDate(date) {
  try {
    if (!supabase) {
      console.log("[TODAK] Supabase 미초기화");
      return [];
    }

    if (!_currentChild) {
      console.log("[TODAK] 아이 정보 없음");
      return [];
    }

    var dateStr = getLocalDateString(date);

    console.log("[TODAK] 날짜별 기록 조회:", dateStr);

    var { data, error } = await supabase
      .from("growth_records")
      .select("*")
      .eq("child_id", _currentChild.id)
      .eq("record_date", dateStr)
      .order("record_date", { ascending: false });

    if (error) {
      console.error("[TODAK] 날짜별 기록 조회 실패:", error.message);
      return [];
    }

    console.log("[TODAK] 날짜별 기록 조회 성공:", data);
    return data || [];
  } catch (err) {
    console.error("[TODAK] 날짜별 기록 조회 중 에러:", err.message);
    return [];
  }
}

async function updateHomeGrowthInfo() {
  try {
    if (!supabase) return;

    if (!_currentChild) return;

    console.log("[TODAK] Home 화면 성장 정보 갱신 시작");

    var { data, error } = await supabase
      .from("growth_records")
      .select("height, weight, record_date")
      .eq("child_id", _currentChild.id)
      .order("record_date", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      console.log("[TODAK] 최근 기록 없음");
      return;
    }

    var lastRecord = data[0];
    console.log("[TODAK] 최근 기록:", lastRecord);

    var leftCard = document.getElementById("left-card-value");
    var rightCard = document.getElementById("right-card-value");

    if (leftCard && lastRecord.height) {
      leftCard.textContent = lastRecord.height + "cm";
    }
    if (rightCard && lastRecord.weight) {
      rightCard.textContent = lastRecord.weight + "kg";
    }
  } catch (err) {
    console.error("[TODAK] Home 화면 갱신 중 에러:", err.message);
  }
}

async function initRecordSection() {
  try {
    console.log("[TODAK] Record 섹션 초기화");

    var today = new Date();
    var records = await fetchGrowthRecordsByDate(today);

    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][today.getDay()];

    var monthBtn = document.querySelector(".record-calendar__month-btn");
    if (monthBtn) {
      monthBtn.textContent = year + "년 " + month + "월 ";
      var svg = monthBtn.querySelector("svg");
      if (svg) {
        monthBtn.appendChild(svg);
      }
    }

    var createDateText = document.querySelector(".record-create-date-text");
    if (createDateText) {
      createDateText.textContent = year + "년 " + month + "월 " + day + "일 " + dayOfWeek + "요일";
    }

    var dateTitle = document.querySelector(".record-date-title");

    if (dateTitle) {
      dateTitle.textContent = year + "년 " + month + "월 " + day + "일의 기록";
    }

    var recordItems = document.querySelector(".record-items");
    if (recordItems) {
      if (records.length === 0) {
        recordItems.innerHTML =
          '<div style="padding: 20px; text-align: center; color: #999;">아직 기록이 없습니다.</div>';
      } else {
        var itemsHTML = "";

        records.forEach(function (record) {
          var createdDate = new Date(record.record_date);
          var timeStr = createdDate.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          var content = "";

          if (record.height || record.weight) {
            content += '<p class="record-item__desc">';
            if (record.height) content += "키: " + record.height + "cm " + "<br>";
            if (record.weight) content += "몸무게: " + record.weight + "kg";
            content += "</p>";
          }

          if (record.memo) {
            content +=
              '<p class="record-item__desc">' +
              record.memo +
              "</p>";
          }

          // 이미지가 있는 경우 record-item 바깥에 생성
          if (record.photo_url) {
            itemsHTML +=
              '<div class="record-item__images">' +
                '<img src="' +
                record.photo_url +
                '" alt="기록 사진" class="record-item__image">' +
              '</div>';
          }

          itemsHTML +=
            '<div class="record-item">' +

              '<div class="record-item__header">' +
                '<span class="record-item__time">' +
                  timeStr +
                '</span>' +
                '<div class="record-item__dot"></div>' +
              '</div>' +

              '<div class="record-item__content">' +
                '<h4 class="record-item__title">성장 기록</h4>' +
                content +
              '</div>' +

            '</div>';
        });

        recordItems.innerHTML = itemsHTML;
      }
    }

    var activeDays = document.querySelectorAll(".record-calendar__day--active");
    activeDays.forEach(function (d) {
      d.classList.remove("record-calendar__day--active");
    });
    var todayDayElement = Array.from(
      document.querySelectorAll(".record-calendar__day:not(.record-calendar__day--empty)")
    ).find(function (el) {
      return el.textContent.trim() === String(day);
    });
    if (todayDayElement) {
      todayDayElement.classList.add("record-calendar__day--active");
    }
  } catch (err) {
    console.error("[TODAK] Record 섹션 초기화 중 에러:", err.message);
  }
}

/* 성장기록상세 섹션 초기화 - 최신 2개 기록 표시 */
async function initGrowthDetailSection() {
  try {
    console.log("[TODAK] Growth Detail 섹션 초기화");

    if (!supabase || !_currentChild) {
      console.log("[TODAK] Supabase 또는 아이 정보 없음");
      return;
    }

    var { data, error } = await supabase
      .from("growth_records")
      .select("*")
      .eq("child_id", _currentChild.id)
      .order("record_date", { ascending: false })
      .limit(2);

    if (error) {
      console.error("[TODAK] 기록 조회 실패:", error.message);
      return;
    }

    var records = data || [];
    console.log("[TODAK] 조회된 최신 기록:", records);

    var scrollContainer = document.querySelector(".growth-records-scroll");
    if (!scrollContainer) {
      console.log("[TODAK] growth-records-scroll 요소 없음");
      return;
    }

    if (records.length === 0) {
      scrollContainer.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #999;">아직 기록이 없습니다.</div>';
      return;
    }

    var cardsHTML = "";
    records.forEach(function (record) {
      var dateStr;
      if (record.record_date) {
        var dateParts = record.record_date.split('T')[0].split('-');
        if (dateParts.length === 3) {
          dateStr = dateParts[0] + '.' + dateParts[1] + '.' + dateParts[2];
        } else {
          dateStr = record.record_date;
        }
      } else {
        dateStr = '-';
      }

      var timeStr = '';
      if (record.record_date) {
        var recordDate = new Date(record.record_date);
        timeStr = recordDate.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      var metricsHTML = "";
      if (record.height || record.weight) {
        metricsHTML = '<div class="growth-record-metrics">';
        if (record.height) metricsHTML += '<span class="growth-metric">' + record.height + 'cm</span>';
        if (record.weight) metricsHTML += '<span class="growth-metric">' + record.weight + 'kg</span>';
        metricsHTML += "</div>";
      }

      cardsHTML +=
        '<div class="card growth-record-card">' +
        '<div class="growth-record-date">' + dateStr + '</div>';

      if (record.photo_url) {
        cardsHTML +=
          '<div class="growth-record-image">' +
          '<img src="' + record.photo_url + '" alt="성장 기록 사진">' +
          '</div>';
      }

      cardsHTML +=
        '<p class="growth-record-time">' + timeStr + '</p>' +'<div class="growth-record-info">' +
        metricsHTML +
        '</div>';

      if (record.memo) {
        cardsHTML +=
          '<p class="growth-record-text">"' + record.memo + '"</p>';
      }

      cardsHTML += '</div>';
    });

    scrollContainer.innerHTML = cardsHTML;
  } catch (err) {
    console.error("[TODAK] Growth Detail 섹션 초기화 중 에러:", err.message);
  }
}

/* Record 캘린더 아이콘 버튼 - Growth Detail 섹션으로 이동 */
document.addEventListener("click", function (e) {
  var calendarBtn = e.target.closest(".record-calendar-btn");
  if (calendarBtn) {
    showSection("growth-detail-section");
  }
});

/* ------------------------------------------
   마이페이지 프로필 이미지 변경
   ------------------------------------------ */

function getProfileImageUrl(profileImagePath, defaultPath) {
  if (!profileImagePath) {
    return defaultPath;
  }
  if (profileImagePath.startsWith("image/")) {
    return profileImagePath;
  }
  if (!supabase) {
    return defaultPath;
  }
  var { data: { publicUrl } } = supabase.storage.from("profiles").getPublicUrl(profileImagePath);
  return publicUrl || defaultPath;
}

function showProfileImageModal(userId) {
  var existingOverlay = document.getElementById("profile-image-modal-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  var overlay = document.createElement("div");
  overlay.id = "profile-image-modal-overlay";
  overlay.className = "modal-overlay modal-overlay--center active";

  var modal = document.createElement("div");
  modal.className = "modal modal--dialog";

  var currentImageSrc = document.querySelector(".mypage-profile-avatar img")?.src || "image/woman.png";

  var html = '<div class="modal__dialog-header">' +
    '<h2 class="modal__dialog-title">프로필 이미지 변경</h2>' +
    '<button class="modal__close-btn" aria-label="닫기">' +
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>' +
    '</button>' +
  '</div>';

  var body = document.createElement("div");
  body.className = "modal__body";
  body.innerHTML = '<div class="profile-image-preview-container">' +
    '<img id="profile-image-preview" src="' + currentImageSrc + '" alt="프로필 미리보기" class="profile-image-preview">' +
  '</div>' +
  '<input type="file" id="profile-image-input" accept=".jpg,.jpeg,.png,.webp" class="profile-image-input" style="display:none;">' +
  '<button type="button" class="btn btn--primary btn--block" id="profile-image-select-btn">이미지 선택</button>';

  var footer = document.createElement("div");
  footer.className = "modal__footer";
  footer.innerHTML = '<button type="button" class="btn btn--white btn--block" id="profile-image-cancel-btn">취소</button>' +
    '<button type="button" class="btn btn--primary btn--block" id="profile-image-save-btn">저장</button>';

  modal.innerHTML = html;
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  var fileInput = document.getElementById("profile-image-input");
  var selectBtn = document.getElementById("profile-image-select-btn");
  var previewImg = document.getElementById("profile-image-preview");
  var saveBtn = document.getElementById("profile-image-save-btn");
  var cancelBtn = document.getElementById("profile-image-cancel-btn");
  var closeBtn = overlay.querySelector(".modal__close-btn");

  selectBtn.onclick = function() {
    fileInput.click();
  };

  fileInput.onchange = function(e) {
    handleProfileImageSelect(e, previewImg);
  };

  saveBtn.onclick = function() {
    if (!fileInput.files || fileInput.files.length === 0) {
      alert("이미지를 선택해주세요.");
      return;
    }
    uploadProfileImage(userId, fileInput.files[0], overlay);
  };

  cancelBtn.onclick = function() {
    closeProfileImageModal(overlay);
  };

  closeBtn.onclick = function() {
    closeProfileImageModal(overlay);
  };

  overlay.onclick = function(e) {
    if (e.target === overlay) {
      closeProfileImageModal(overlay);
    }
  };

  document.addEventListener("keydown", function handleEsc(e) {
    if (e.key === "Escape") {
      closeProfileImageModal(overlay);
      document.removeEventListener("keydown", handleEsc);
    }
  });
}

function handleProfileImageSelect(event, previewImg) {
  var file = event.target.files[0];
  if (!file) return;

  var allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    alert("jpg, jpeg, png, webp 형식만 지원합니다.");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("파일 크기는 5MB 이하여야 합니다.");
    event.target.value = "";
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    previewImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function uploadProfileImage(userId, file, overlay) {
  try {
    if (!supabase || !supabase.auth) {
      console.error("프로필 이미지 변경: Supabase 미초기화");
      alert("시스템 오류가 발생했습니다.");
      return;
    }

    var fileExt = file.name.split(".").pop().toLowerCase();
    var fileName = "avatar." + fileExt;
    var filePath = userId + "/" + fileName;

    var { data: uploadData, error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("프로필 이미지 업로드 오류:", uploadError.message);
      alert("이미지 업로드에 실패했습니다: " + uploadError.message);
      return;
    }

    var { data: userData, error: userError } = await supabase
      .from("users")
      .update({ profile_image: filePath })
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("프로필 이미지 저장 오류:", userError.message);
      alert("이미지 저장에 실패했습니다: " + userError.message);
      return;
    }

    var { data: { publicUrl } } = supabase.storage.from("profiles").getPublicUrl(filePath);
    var profileAvatarImg = document.querySelector(".mypage-profile-avatar img");
    if (profileAvatarImg) {
      profileAvatarImg.src = publicUrl;
    }

    closeProfileImageModal(overlay);
    showToast("프로필 이미지가 변경되었습니다.");
  } catch (err) {
    console.error("프로필 이미지 변경 중 오류:", err.message);
    alert("프로필 이미지 변경 중 오류가 발생했습니다.");
  }
}

function closeProfileImageModal(overlay) {
  if (overlay) {
    overlay.classList.remove("active");
    setTimeout(function() {
      overlay.remove();
    }, 300);
  }
}
