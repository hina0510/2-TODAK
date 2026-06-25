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

  /* 마이페이지 섹션이 표시될 때 사용자 정보 로드 */
  if (sectionId === "mypage-section") {
    loadMypageUserInfo();
  }

  /* 온보딩 섹션이 표시될 때 사용자 역할 확인 */
  if (sectionId === "onboarding-section") {
    initOnboarding();
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

  /* --- 역할 선택 (엄마 / 보호자) --- */
  var roleMomBtn = document.getElementById("role-mom");
  var roleGuardianBtn = document.getElementById("role-guardian");

  function selectRole(role) {
    var isMom = role === "mom";

    section.classList.toggle("guardian-mode", !isMom);

    roleMomBtn.classList.toggle("selected", isMom);
    roleMomBtn.setAttribute("aria-pressed", String(isMom));

    roleGuardianBtn.classList.toggle("selected", !isMom);
    roleGuardianBtn.setAttribute("aria-pressed", String(!isMom));
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

    // 미션 아이템 HTML 생성
    function createMissionItemHTML(mission) {
      var iconClass = mission.icon === "completed" ? "completed" : "pending";
      var svgContent =
        mission.icon === "completed"
          ? '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>'
          : '<circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/>';

      return (
        '<div class="todak-mission-item">' +
        '<div class="todak-mission-icon ' +
        iconClass +
        '">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        svgContent +
        "</svg>" +
        "</div>" +
        '<div class="todak-mission-content">' +
        '<p class="todak-mission-item-text">' +
        mission.text +
        "</p>" +
        '<p class="todak-mission-item-status">' +
        mission.status +
        "</p>" +
        "</div>" +
        '<p class="todak-mission-item-time">' +
        mission.time +
        "</p>" +
        "</div>"
      );
    }

    // Quick Action Card HTML 생성
    function createQuickActionHTML(action) {
      var iconSVG = "";
      if (action.icon === "edit") {
        iconSVG =
          '<svg class="quick-action-icon" width="32" height="32" viewBox="0 0 24 24" fill="#6B5B95" aria-hidden="true">' +
          '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>' +
          '<path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>' +
          "</svg>";
      } else if (action.icon === "calendar") {
        iconSVG =
          '<svg class="quick-action-icon" width="32" height="32" viewBox="0 0 24 24" fill="#D94F8A" aria-hidden="true">' +
          '<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>' +
          '<line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>' +
          '<line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>' +
          '<line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>' +
          "</svg>";
      } else if (action.icon === "photo") {
        iconSVG =
          '<svg class="quick-action-icon" width="32" height="32" viewBox="0 0 24 24" fill="#D94F8A" aria-hidden="true">' +
          '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.04-2.71L6.5 17h11l-3.54-4.71z"/>' +
          "</svg>";
      }

      return (
        '<button type="button" class="quick-action-card">' +
        iconSVG +
        '<h4 class="quick-action-title">' +
        action.title +
        "</h4>" +
        '<p class="quick-action-desc">' +
        action.desc +
        "</p>" +
        "</button>"
      );
    }

    // Home 콘텐츠 업데이트 함수
    function updateHomeContent(mode) {
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
      document.getElementById("stage-info-number").textContent =
        data.stageInfoNumber;
      document.getElementById("stage-info-text").textContent =
        data.stageInfoText;

      // TODAK Missions
      document.getElementById("mission-status").textContent =
        data.missionStatus;
      var missionListHTML = data.missions.map(createMissionItemHTML).join("");
      document.getElementById("mission-list").innerHTML = missionListHTML;

      // Quick Action Cards
      var quickActionHTML = data.quickActions
        .map(createQuickActionHTML)
        .join("");
      document.getElementById("quick-action-cards").innerHTML = quickActionHTML;

      // Recommendation Card
      document.getElementById("rec-title").textContent =
        data.recommendationTitle;
      document.getElementById("rec-desc").textContent = data.recommendationDesc;

      // 출산 탭에서만 사이드 카드 표시
      var characterArea = document.getElementById("character-area");
      if (characterArea) {
        characterArea.classList.toggle("birth-mode", mode === "birth");
      }
    }

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
      birthRegisterBtn.addEventListener("click", function () {
        if (validateBirthForm()) {
          // Validation 통과
          saveBirthData();
          closeBirthModal();

          // Home 화면을 Birth 모드로 전환
          updateHomeContent("birth");

          // 토글 버튼 상태 업데이트
          pregnancyToggles[0].classList.remove("active");
          pregnancyToggles[1].classList.add("active");
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
        var isPregnancy = index === 0;

        if (isPregnancy && _isBirthMode) {
          showToast("출산 상태에서는 임신 탭으로 이동할 수 없습니다.");
          return;
        }

        if (!isPregnancy && !birthData.childName) {
          // 출산 모드로 전환할 때, Birth 데이터가 없으면 모달 열기
          openBirthModal();
        } else {
          // 기존 로직 (이미 등록된 경우)
          var mode = isPregnancy ? "pregnancy" : "birth";

          // 버튼 상태 업데이트
          pregnancyToggles[0].classList.toggle("active", isPregnancy);
          pregnancyToggles[1].classList.toggle("active", !isPregnancy);

          // 콘텐츠 업데이트
          updateHomeContent(mode);
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

    // 성장 단계 더미 데이터
    var growthStagesData = [
      {
        stage: "초기 적응기",
        weekRange: "4~11주",
        week: 4,
        dday: "D-170",
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
        week: 15,
        dday: "D-135",
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
        week: 22,
        dday: "D-105",
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
        week: 30,
        dday: "D-70",
        characterImage: "image/preg3.png",
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
        week: 38,
        dday: "D-14",
        characterImage: "image/preg3.png",
        description:
          "출산이 임박한 시기입니다. 아이가 골반 쪽으로 내려오면서 호흡이 편해져요.",
        babyStatus:
          "면역 체계가 완성되고 장기 기능이 완전히 발달합니다. 출산 준비를 하고 있어요.",
        momStatus:
          "소화 불편함이 완화되고 출산에 대한 불안감이 커질 수 있습니다. 이는 매우 정상이에요.",
      },
    ];

    // Growth Stage Modal 열기
    function openGrowthStageModal(stageIndex) {
      var stage = growthStagesData[stageIndex];
      if (!stage) return;

      // 데이터 업데이트
      document.getElementById("growth-stage-badge").textContent =
        stage.week + "주차";
      document.getElementById("growth-stage-stage-name").textContent =
        stage.stage;
      document.getElementById("growth-stage-description").textContent =
        stage.description;
      document.getElementById("growth-stage-baby-status").textContent =
        stage.babyStatus;
      document.getElementById("growth-stage-mom-status").textContent =
        stage.momStatus;
      document.getElementById("growth-stage-char-img").src =
        stage.characterImage;
      document.getElementById("growth-stage-dday-badge").textContent =
        stage.dday;

      // 다음 단계 (있으면)
      if (stageIndex < growthStagesData.length - 1) {
        var nextStage = growthStagesData[stageIndex + 1];
        document.getElementById("growth-stage-next-stage").textContent =
          nextStage.stage + " (" + nextStage.weekRange + ")";
      }

      // 모달 열기
      growthStageOverlay.classList.add("active");
    }

    // Growth Stage Modal 닫기
    function closeGrowthStageModal() {
      growthStageOverlay.classList.remove("active");
    }

    // 캐릭터 영역 클릭 → 모달 열기 (현재 22주차 = index 2)
    if (characterArea) {
      characterArea.addEventListener("click", function () {
        openGrowthStageModal(2);
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
})();

/* ------------------------------------------
   TODAK SECTION (오늘의 토닥)
   ------------------------------------------ */

(function () {
  var section = document.getElementById("todak-section");
  if (!section) return;

  /* 더미 미션 데이터 */
  var missionsData = {
    child: [
      {
        id: "child-1",
        icon: "🎵",
        title: "태교 음악 감상하기",
        desc: "엄마의 심정과의 활을 듣게 하세요",
        tags: ["태교"],
        completed: false,
      },
      {
        id: "child-2",
        icon: "🫶",
        title: "태담 나누기",
        desc: '"오늘 날씨가 참 좋아"라고 베 속 아이에게 말을 걸어세요.',
        tags: ["태담", "소통"],
        completed: false,
      },
    ],
    self: [
      {
        id: "self-1",
        icon: "🌿",
        title: "가벼운 스트레칭",
        desc: "부은 다리의 혈리를 위해 5분간 고양이 자세를 해보세요.",
        tags: ["스트레칭", "휴식"],
        completed: true,
      },
      {
        id: "self-2",
        icon: "❤️",
        title: "나에게 칭찬 해나디",
        desc: '"오늘도 수고 많았어" 거울 속 나에게 말을 걸어세요.',
        tags: ["자기관리", "명상"],
        completed: false,
      },
    ],
    family: [
      {
        id: "family-1",
        icon: "👥",
        title: "고마음 표현하기",
        desc: "함께 교생하는 파트너에게 작은 응원의 메시지를 보내세요.",
        tags: ["감사", "소통"],
        completed: false,
      },
      {
        id: "family-2",
        icon: "🦅",
        title: "밤 마사지 해주기",
        desc: "자녀 시간, 붕기를 가라앉히는 더 톡인 전달을 해보세요.",
        tags: ["태교", "함께"],
        completed: false,
      },
    ],
  };

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
    var childContainer = document.getElementById("todak-category-child");
    var selfContainer = document.getElementById("todak-category-self");
    var familyContainer = document.getElementById("todak-category-family");

    if (childContainer) {
      childContainer.innerHTML = missionsData.child
        .map(createMissionCardHTML)
        .join("");
    }
    if (selfContainer) {
      selfContainer.innerHTML = missionsData.self
        .map(createMissionCardHTML)
        .join("");
    }
    if (familyContainer) {
      familyContainer.innerHTML = missionsData.family
        .map(createMissionCardHTML)
        .join("");
    }

    updateCategoryBadges();

    /* 미션 체크박스 이벤트 */
    var checkboxes = section.querySelectorAll(".mission-card__checkbox");
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        var missionCard = this.closest(".mission-card");
        var missionId = missionCard.dataset.missionId;
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
          missionCard.classList.toggle("completed", this.checked);
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

  /* Record 화면의 날짜 클릭 시 Growth Detail로 전환 */
  var calendarDays = document.querySelectorAll(
    ".record-calendar__day:not(.record-calendar__day--empty)",
  );
  calendarDays.forEach(function (day) {
    day.addEventListener("click", function () {
      showSection("growth-detail-section");
      window.scrollTo(0, 0);
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
    fab.addEventListener("click", function () {
      if (recordCreateOverlay) {
        recordCreateOverlay.classList.add("active");
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

  /* 저장 버튼 클릭 (더미) */
  var saveBtn = document.querySelector(".record-create-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      showToast("기록이 저장되었습니다.");
      if (recordCreateOverlay) {
        recordCreateOverlay.classList.remove("active");
      }
    });
  }

  /* 초기화 */
  initDate();
  renderMissions();
  updateProgress();
})();

/* ==========================================================================
   Supabase Auth & Data
   ========================================================================== */

var _todakRole = "mom";
var _pendingName = "";
var _isBirthMode = false;

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
      .limit(1)
      .single();

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

  newForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    var name = document.getElementById("signup-name").value.trim();
    var email = document.getElementById("signup-email").value.trim();
    var password = document.getElementById("signup-password").value;
    var confirm = document.getElementById("signup-password-confirm").value;
    var agreed = document.getElementById("signup-agree").checked;

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

    try {
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

          try {
            var userData = {
              id: userId,
              name: name,
              email: email,
              role: _todakRole || "mom",
              created_at: new Date().toISOString(),
            };

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
      showToast("회원가입이 완료되었습니다. 로그인해주세요.");
      showSection("login-section");
    } catch (err) {
      console.error("[회원가입] 오류 발생:", err.message);
      showToast(translateSupabaseError(err.message));
    }
  });
})();

/* ---------- 역할 선택 → 온보딩 ---------- */
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

    showSection("signup-section");
  });
})();

/* ---------- 온보딩 저장 ---------- */
(function () {
  var startBtn = document.getElementById("onboarding-start-btn");
  if (!startBtn) return;

  var newBtn = startBtn.cloneNode(true);
  startBtn.parentNode.replaceChild(newBtn, startBtn);

  newBtn.addEventListener("click", async function () {
    try {
      var birthStatus = "pregnant";
      var childId = null;

      if (_todakRole === "guardian") {
        var momCode = document
          .getElementById("onboarding-mom-code")
          .value.trim();
        if (!momCode) {
          showToast("엄마 코드를 입력해주세요.");
          return;
        }

        childId = await validateInviteCode(momCode);
        if (!childId) {
          showToast("유효하지 않은 초대코드입니다.");
          return;
        }
      } else {
        var babyName = document
          .getElementById("onboarding-taemyeong")
          .value.trim();
        if (!babyName) {
          showToast("태명을 입력해주세요.");
          return;
        }

        var pregnantBtn = document.getElementById("status-pregnant");
        birthStatus =
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

      var userData = {
        id: userId,
        name: _pendingName || userEmail,
        email: userEmail,
        role: _todakRole,
      };

      if (_todakRole === "mom") {
        var childData = {
          owner_id: userId,
          baby_name: document
            .getElementById("onboarding-taemyeong")
            .value.trim(),
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

        childId = insertedChild[0].id;
        userData.child_id = childId;
      } else {
        userData.child_id = childId;
      }

      var { error: userErr } = await supabase
        .from("users")
        .upsert([userData]);
      if (userErr) {
        throw userErr;
      }

      _isBirthMode = birthStatus === "birth";
      await loadHomeData();
      showSection("home-section");
    } catch (err) {
      showToast(translateSupabaseError(err.message));
    }
  });
})();

/* ---------- 홈 데이터 로드 ---------- */
async function loadHomeData() {
  try {
    // DB 로드 기능 (Supabase 재설정 후 활성화)
    console.log("[홈] DB 데이터 로드 (Supabase 재설정 필요)");
  } catch (err) {
    console.error("[홈 데이터 로드 오류]", err);
  }
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
      .select("name")
      .eq("id", user.id)
      .single();

    var userName = userData?.name || "사용자";
    var avatarUrl = "image/profile.png";

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
  } catch (err) {
  }
}
