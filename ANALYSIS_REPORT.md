# TODAK 프로젝트 분석 보고서

**분석 일시**: 2026-06-25  
**분석자**: Claude Code  
**프로젝트**: TODAK (토닥) - 모바일 웹 앱  

---

## 1. 현재 프로젝트 폴더 구조

```
2-TODAK/
├── index.html                          (2162줄)
├── package.json                        (의존성 관리)
├── CLAUDE.md                           (프로젝트 가이드)
├── IMPLEMENTATION_PLAN.md              (구현 계획)
├── .vscode/settings.json               (VS Code 설정)
├── .git/                               (git 저장소)
│
├── css/
│   ├── reset.css                       (2117줄) - 재설정 스타일
│   ├── color.css                       (3411줄) - 디자인 시스템 색상
│   ├── common.css                      (85821바이트, 3932줄) - 공통 컴포넌트
│   └── style.css                       (945줄) - 페이지별 스타일
│
├── js/
│   ├── script.js                       (2482줄) - 메인 SPA 로직
│   └── utils.js                        (235줄) - 공통 유틸리티 함수
│
├── supabase/
│   └── supabase.js                     (1418바이트) - Supabase 클라이언트 초기화
│
├── image/
│   ├── logo.png                        (사용 중)
│   ├── preg1.png                       (사용 중)
│   ├── preg3.png                       (사용 중)
│   ├── baby1.png                       (사용 중)
│   └── profile.png                     (사용 중)
│
└── node_modules/                       (playwright 의존성)
```

---

## 2. 실제 사용 중인 파일과 사용되지 않는 파일

### ✅ 사용 중인 파일

| 파일 | 상태 | 용도 |
|------|------|------|
| index.html | 활성 | SPA 메인 파일 (모든 섹션 포함) |
| js/script.js | 활성 | 모든 로직 (Auth, Home, Record, Guide, Todak, Onboarding) |
| js/utils.js | 활성 | 공통 함수 (날짜, 모달, 로컬스토리지) |
| supabase/supabase.js | 활성 | Supabase 클라이언트 초기화 |
| css/reset.css | 활성 | 브라우저 기본 스타일 제거 |
| css/color.css | 활성 | 색상 시스템 정의 |
| css/common.css | 활성 | 모든 컴포넌트 스타일 |
| css/style.css | 활성 | 페이지별 커스텀 스타일 |
| image/*.png | 활성 | 캐릭터 이미지 |
| CLAUDE.md | 활성 | 프로젝트 규칙서 |

### ⚠️ 의존하지만 외부 리소스

| 리소스 | 현상태 | 문제점 |
|--------|--------|--------|
| @supabase/supabase-js CDN | 로드 중 | Supabase SDK 필수 |
| Google Fonts (NanumSquare) | 로드 중 | 폰트 필수 |
| Figma API (이미지) | 임시 사용 | 7일 후 만료 - TODO 처리 필요 |

---

## 3. 삭제 가능한 파일 목록

### 🗑️ 즉시 삭제 가능

#### (1) 불필요한 설정 파일
| 파일 | 이유 |
|------|------|
| package.json (현재) | playwright만 있음, 필요 없음 |
| package-lock.json | node_modules 불필요 |
| node_modules/ | 프로젝트에 사용 안 함 |

#### (2) Figma URL (index.html 내)

현재 index.html에 Figma CDN URL이 많이 포함되어 있음:

```html
<!-- 로그인 로고 -->
<img src="https://www.figma.com/api/mcp/asset/b476fd15-4309-48eb-b66e-5be41749f434" ...>

<!-- 온보딩 캐릭터 -->
<img src="https://www.figma.com/api/mcp/asset/ee3df320-1f5a-4d10-8aaf-4f7e68680d0e" ...>

<!-- 회원가입 캐릭터 -->
<img src="https://www.figma.com/api/mcp/asset/3099a4dc-f8f7-4554-8d9f-dd5cd18c9059" ...>

<!-- 소셜 로그인 아이콘 -->
<img src="https://www.figma.com/api/mcp/asset/30fdb5e2-3d11-4740-abbc-91b9aa656ba2" ...>  (Google)
<img src="https://www.figma.com/api/mcp/asset/85e6c648-499b-4646-9a40-65a7948a33f8" ...>  (Kakao)

<!-- 기타 아이콘 -->
<img src="https://www.figma.com/api/mcp/asset/33f206b4-3fbe-42f0-b4c6-dee5e958c603" ...>  (이메일)
<img src="https://www.figma.com/api/mcp/asset/27a78769-9da3-4dfd-8bdb-10e6654042ac" ...>  (비밀번호)
<img src="https://www.figma.com/api/mcp/asset/5e850afe-fd6a-4374-91a8-c68c5d957628" ...>  (눈 아이콘)
```

**권장사항**: 이 Figma URL들을 `/image` 폴더의 실제 파일로 대체해야 함

---

## 4. 중복 함수 및 중복 이벤트 목록

### 🔴 **중복 함수 (통합 필요)**

| 함수명 | 위치1 | 위치2 | 상태 |
|--------|-------|-------|------|
| `showToast()` | script.js:14 | utils.js:131 | **중복** ❌ |

**상세 분석:**

```javascript
// script.js:14 (구식)
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

// utils.js:131 (개선됨)
function showToast(message, duration = 2000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  });
}
```

**해결책**: utils.js의 `showToast()`를 유지하고, script.js의 중복 정의 제거

### ⚠️ **비슷한 기능 (리팩토링 대상)**

| 기능 | script.js | 중복 범위 |
|------|-----------|---------|
| 모달 열기/닫기 | 여러 곳에서 인라인 처리 | 10+ 곳 |
| 섹션 숨기기/보이기 | `showSection()` 사용 | 자동화됨 |
| 로컬스토리지 접근 | 직접 접근 | 여러 곳 |

---

## 5. 사용되지 않는 CSS, 이미지, SVG

### CSS 분석

**현재 상황:**
- CSS 총 4개 파일
- 대부분 사용 중인 398개 고유 클래스

**잠재적 미사용 CSS:**
- common.css (85KB)는 매우 크지만, 정확한 미사용 여부를 판단하려면 모든 HTML과 JS의 동적 클래스명 추가를 추적해야 함
- style.css에서 기본 스타일이 많음

**권장사항**: PurgeCSS나 수동 감사 필요

### 이미지 분석

**사용 중인 이미지:**
```
✅ image/logo.png          - 모든 헤더에서 사용
✅ image/preg1.png         - 임신 4~11주 (성장기 정보 모달)
✅ image/preg3.png         - 임신 20~38주 (주로 사용)
✅ image/baby1.png         - 출산 후 캐릭터
✅ image/profile.png       - 마이페이지 프로필
```

**사용되지 않는 이미지:**
```
⚠️ image/preg2.png         - 임신 12~19주 안정기 (growthStagesData에서만 참조)
                            - 실제로 표시되지 않음 (고정으로 index 2만 호출)
```

### SVG 분석

모든 SVG는 인라인으로 HTML 또는 JS에 포함되어 있으며, 따로 파일로 존재하지 않음.

---

## 6. 더미 데이터가 남아있는 위치

### 🔴 **더미 데이터 정의**

| 변수명 | 위치 | 라인 | 포함 내용 | 상태 |
|--------|------|------|---------|------|
| `birthData` | script.js | 240 | 출산 정보 (하드코딩) | ❌ 삭제 필요 |
| `homeScreenData` | script.js | 249 | 임신/출산 홈 화면 데이터 | ❌ 삭제 필요 |
| `growthStagesData` | script.js | 598 | 임신 5단계 정보 | ❌ 삭제 필요 |
| `missionsData` | script.js | 735 | 오늘의 토닥 미션 | ❌ 삭제 필요 |
| `errorMap` | script.js | 1402 | 에러 메시지 (실제 사용됨) | ✅ 유지 |

### 상세 더미 데이터

```javascript
// 1. birthData (출산 정보 - 하드코딩)
var birthData = {
  childName: "",
  gender: "",
  birthDateTime: "",
  height: "",
  weight: "",
};

// 2. homeScreenData (임신/출산 전환 시 UI 업데이트용)
// 임신 모드: 주차, D-Day, 미션 등
// 출산 모드: 아이 나이, 몸무게, 수유 등
var homeScreenData = {
  pregnancy: { ... },
  birth: { ... }
};

// 3. growthStagesData (임신 5단계 정보 - DB 필요)
var growthStagesData = [
  {
    stage: "초기 적응기",
    weekRange: "4~11주",
    week: 4,
    dday: "D-170",
    characterImage: "image/preg1.png",
    description: "...",
    babyStatus: "...",
    momStatus: "..."
  },
  // ... 4개 더
];

// 4. missionsData (오늘의 토닥 - DB 필요)
var missionsData = {
  child: [
    {
      id: "child-1",
      icon: "🎵",
      title: "태교 음악 감상하기",
      desc: "...",
      tags: ["태교"],
      completed: false
    },
    // ... 더
  ],
  self: [ ... ],
  family: [ ... ]
};
```

### 더미 데이터 사용 현황

| 함수 | 사용 중인 더미 데이터 |
|------|--------|
| `updateHomeContent()` | homeScreenData |
| `openGrowthStageModal()` | growthStagesData |
| `renderMissions()` | missionsData |
| `initRecordSection()` | 날짜별 레코드 (부분적으로 DB) |
| `saveBirthData()` | birthData (현재 콘솔만) |

---

## 7. Supabase 연동 구조 분석

### 현재 Supabase 설정

**파일**: `supabase/supabase.js`

```javascript
var SUPABASE_URL = "https://oxipeecgaumpgvqonwvz.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_ltVHAXlestz-sIuBqWBtyg_6QK5czuy";
```

**상태**: ✅ 설정 완료, SDK 로드 대기 패턴 구현

### 현재 Supabase 쿼리 분석

**구현된 기능:**

```
✅ Auth 시스템
  - signUp() - 회원가입
  - signIn() - 로그인
  - signOut() - 로그아웃
  - getUser() - 현재 사용자 조회
  - getSession() - 세션 확인

✅ 테이블 접근
  - supabase.from("users").insert() - 사용자 저장
  - supabase.from("children").insert() - 자녀 저장
  - supabase.from("children").select() - 자녀 조회
  - supabase.from("growth_records").insert() - 성장 기록 저장
  - supabase.from("growth_records").select() - 성장 기록 조회

❌ 미구현
  - todak_missions 테이블
  - mission_completions 테이블
  - weekly_guides 테이블
  - guide_contents 테이블
```

### DB 테이블 설계 vs 실제 구현

**필수 테이블:**

| 테이블 | 실제 구현 | 상태 |
|--------|---------|------|
| users | ✅ 부분 | id, name, email, role만 저장 |
| children | ✅ 부분 | 기본 필드만 저장 |
| growth_records | ✅ 부분 | 이미지 업로드 기능 있음 |
| todak_missions | ❌ 없음 | 더미 데이터만 사용 |
| mission_completions | ❌ 없음 | 미구현 |
| weekly_guides | ❌ 없음 | 미구현 |
| guide_contents | ❌ 없음 | 미구현 |

---

## 8. DB와 맞지 않는 코드 위치

### 🔴 **주요 불일치**

| 항목 | 현재 코드 | 문제점 |
|------|---------|--------|
| 홈 화면 데이터 | 하드코딩된 homeScreenData 사용 | children, growth_records에서 조회 필요 |
| 성장 단계 정보 | 하드코딩된 growthStagesData 사용 | weekly_guides 테이블 필요 |
| 오늘의 토닥 | 하드코딩된 missionsData 사용 | todak_missions 테이블 필요 |
| 미션 완료 기록 | 체크박스 변경만 UI 반영 | mission_completions에 저장 필요 |
| 오늘 날짜 기록 | DB 조회 시도 있음 | 부분적으로만 구현됨 |
| 마이페이지 정보 | users 테이블 조회 | 실제로 UI 업데이트 미흡 |

### 코드 위치 상세

#### (1) 홈 화면 - `script.js:1715`

```javascript
async function loadHomeData() {
  console.log("[홈] DB 데이터 로드 (Supabase 재설정 필요)");
  // 실제로는 구현되지 않음
  // DB에서 조회하는 대신 homeScreenData 사용
  updateHomeContent(mode); // mode는 임신/출산 토글
}
```

**필요한 작업:**
- DB에서 child_id로 현재 자녀 조회
- birth_status 확인
- birth_date 또는 due_date 계산
- 최근 growth_records 5개 조회

#### (2) 오늘의 토닥 - `script.js:735`

```javascript
var missionsData = {
  child: [ { /* 하드코딩 */ } ],
  self: [ { /* 하드코딩 */ } ],
  family: [ { /* 하드코딩 */ } ]
};
```

**필요한 작업:**
- todak_missions 테이블에서 조회
- 현재 주차(week)별 필터링
- category별 분류
- display_order 정렬

#### (3) 가이드 화면 - `script.js:598`

```javascript
var growthStagesData = [
  { stage: "초기 적응기", weekRange: "4~11주", ... },
  // ... 하드코딩된 5단계
];
```

**필요한 작업:**
- weekly_guides 테이블 조회
- guide_contents 테이블 조회
- 현재 주차에 해당하는 가이드만 표시

---

## 9. 개선 우선순위

### Priority 1️⃣: 중대한 구조 문제 (즉시 해결)

| # | 항목 | 영향도 | 난이도 | 예상 시간 |
|---|------|--------|--------|---------|
| 1 | script.js 파일 분리 (2482줄 → 8개 파일) | 🔴 높음 | 🟡 중간 | 2-3시간 |
| 2 | 중복 함수 제거 (showToast) | 🟡 중간 | 🟢 낮음 | 30분 |
| 3 | 모달 유틸 함수 통합 | 🟡 중간 | 🟡 중간 | 1시간 |
| 4 | 더미 데이터 제거 (4개 변수) | 🔴 높음 | 🔴 높음 | 3-4시간 |

### Priority 2️⃣: DB 연동 (기능적 완성)

| # | 항목 | 의존 테이블 | 예상 시간 |
|---|------|----------|---------|
| 1 | 홈 화면 DB 연동 | users, children, growth_records | 2시간 |
| 2 | 오늘의 토닥 DB 연동 | todak_missions, mission_completions | 2시간 |
| 3 | 가이드 화면 DB 연동 | weekly_guides, guide_contents | 1.5시간 |
| 4 | 마이페이지 DB 동기화 | users, children | 1시간 |

### Priority 3️⃣: 코드 품질 (최적화)

| # | 항목 | 예상 시간 |
|---|------|---------|
| 1 | async/await 통일 | 1시간 |
| 2 | 에러 처리 통일 | 1시간 |
| 3 | CSS 미사용 제거 | 30분 |
| 4 | 주석 정리 | 30분 |

---

## 10. 리팩토링 계획

### Phase 1: 구조 개선 (파일 분리)

```
js/
├── script.js (→ 삭제/축소)
├── utils.js (→ 유지 + 추가)
├── auth.js (회원가입, 로그인, 로그아웃)
├── home.js (홈 화면 로직)
├── record.js (성장 기록 CRUD)
├── guide.js (가이드 로직)
├── todak.js (오늘의 토닥)
├── onboarding.js (온보딩 로직)
├── modal.js (모달 관리)
├── navigation.js (SPA 네비게이션)
└── supabase-wrapper.js (DB 쿼리 래퍼)
```

### Phase 2: 데이터 정규화

```
현재 상태:
script.js 내 하드코딩
  ↓↓↓
Supabase DB에서 동적 로드
  ↓
필요 테이블:
  - weekly_guides (임신 주차별 가이드)
  - guide_contents (가이드 상세 내용)
  - todak_missions (오늘의 토닥 미션)
```

### Phase 3: 공통 함수 통합

```
유지할 함수 (utils.js):
- showToast()          ← script.js의 중복 제거
- openModal()
- closeModal()
- showSection()        ← script.js에서 이동
- formatDate()
- calcDDay()
- calcBabyAge()
- getPregnancyStage()
- etc.
```

### Phase 4: 코드 스타일 통일

```
적용할 규칙:
- const/let만 사용 (var 제거)
- async/await 사용 (Promise.then 제거)
- try/catch 통일
- camelCase 함수명
- JSDoc 주석
```

---

## 11. 예상 리팩토링 일정

| Phase | 작업 | 예상 시간 | 상태 |
|-------|------|---------|------|
| 1 | 프로젝트 분석 (현재) | ✅ 완료 | - |
| 2 | script.js 파일 분리 | 3시간 | ⏳ 대기 |
| 3 | 더미 데이터 제거 | 4시간 | ⏳ 대기 |
| 4 | DB 테이블 설계 & 쿼리 작성 | 3시간 | ⏳ 대기 |
| 5 | 공통 함수 통합 | 2시간 | ⏳ 대기 |
| 6 | 코드 스타일 통일 | 2시간 | ⏳ 대기 |
| 7 | 통합 테스트 | 2시간 | ⏳ 대기 |
| **총** | | **약 16시간** | |

---

## 12. 주의사항

### 🔴 **필수 확인 사항**

1. **Figma URL 교체** (7일 만료)
   - 로고, 마스코트, 소셜 아이콘 (총 8개)
   - 현재 위치: index.html 여러 곳

2. **DB 테이블 생성**
   - weekly_guides (임신 주차별 가이드)
   - guide_contents (가이드 상세)
   - todak_missions (미션)
   - mission_completions (완료 기록)

3. **테스트 필수**
   - 회원가입 → 온보딩 → 홈 → 오늘의 토닥 → 성장 기록

### ⚠️ **보존해야 할 것**

```
✅ HTML 구조 (섹션, 클래스명)
✅ CSS 클래스 (약 398개)
✅ UI/UX (디자인)
✅ 애니메이션
✅ 반응형 레이아웃 (390~430px)
```

### ❌ **제거 대상**

```
❌ 더미 데이터 (4개 변수)
❌ 사용되지 않는 CSS (선별적)
❌ 중복 함수 (showToast)
❌ var 선언 (const/let로 변경)
❌ 콘솔 로그 (디버그성 아닌 것)
```

---

## 13. 다음 단계

1. **승인 대기** - 본 분석 결과 검토 요청
2. **단계별 리팩토링** - 사용자 승인 후 Phase별 진행
3. **검증** - 각 단계 완료 후 테스트

---

**분석 완료**  
**작성 일시**: 2026-06-25  
**상태**: ⏳ 사용자 승인 대기
