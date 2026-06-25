# TODAK Supabase 연동 완료 보고서

## ✅ 완료된 작업

### 1. 더미 로그인/회원가입 삭제
- script.js의 89-131줄 더미 로그인 함수 삭제
- script.js의 185-216줄 더미 회원가입 함수 삭제

### 2. Supabase 로그인 구현
- supabase.auth.signInWithPassword() 연동
- 로그인 성공 시 홈 페이지로 자동 이동
- 세션 유지 로직 추가

### 3. Supabase 회원가입 구현
- supabase.auth.signUp() 연동
- 회원가입 후 온보딩 섹션으로 자동 진행
- 입력값 검증 로직 완성

### 4. mom_code 자동 생성
- generateMomCode() 함수로 TDK-XXXXXX 형식 자동 생성
- 엄마 가입 시 mom_code를 users 테이블에 저장

### 5. 온보딩 저장 로직 개선
- users 테이블에 name, email, role, mom_code 저장
- children 테이블에 user_id, baby_name, birth_status, due_date 저장
- 보호자 가입 시 입력받은 mom_code를 children.mom_code에 저장

### 6. Birth 모드 데이터 저장
- 출산 상태 선택 시 birth_date, height, weight 필드 입력
- HTML에 onboarding-birth-date, onboarding-height, onboarding-weight 필드 추가
- script.js에서 임신/출산 필드 조건부 표시 로직 구현

### 7. Birth 모드 제약 추가
- 출산 상태면 임신 탭으로 이동 불가
- _isBirthMode 플래그로 토글 버튼 제약
- loadHomeData() 함수에서 birth_status 조회 후 _isBirthMode 설정

### 8. Supabase 초기화 개선
- supabase.js를 IIFE로 감싸서 변수 중복 선언 문제 해결
- SDK 로드 대기 로직 추가
- 초기화 성공/실패 console.log 추가

## 📝 테스트 결과

회원가입 플로우:
1. ✅ 로그인 페이지 → 토닥 시작하기
2. ✅ 역할 선택 (엄마/보호자)
3. ✅ 회원가입 폼 입력 및 검증
4. ✅ Supabase signUp 호출
5. ✅ 온보딩 섹션 표시
6. ⚠️ rate limit 오류 (테스트 중복 시도로 인한 일시적 문제)

## 📊 변경 파일

1. /js/script.js
   - 더미 로그인/회원가입 제거
   - mom_code 생성 함수 추가
   - 온보딩 저장 로직 완전 재작성
   - birth 모드 필드 조건부 표시
   - 상세 console.log 추가

2. /supabase/supabase.js
   - Supabase SDK 초기화 방식 개선
   - IIFE로 감싸기
   - 변수 중복 선언 문제 해결

3. /index.html
   - onboarding-birth-date 필드 추가
   - onboarding-height 필드 추가
   - onboarding-weight 필드 추가
   - 임신/출산 필드 조건부 표시 클래스 추가

## 🚀 다음 단계

1. Rate limit 해제 후 실제 회원가입 테스트
2. 온보딩 완료 후 홈 페이지 데이터 확인
3. Supabase 데이터베이스에 실제 저장 확인
4. 로그아웃 후 다시 로그인하여 세션 유지 확인
5. 보호자 회원가입 및 엄마 코드 입력 테스트

## 📌 주의사항

- Supabase URL과 Key는 공개되지 않도록 주의
- Rate limiting 때문에 테스트는 다른 이메일로 진행
- birth 모드 전환 후 임신 탭 접근 시 토스트 메시지로 안내됨
