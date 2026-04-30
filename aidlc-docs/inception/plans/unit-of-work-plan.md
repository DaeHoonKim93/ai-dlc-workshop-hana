# Unit of Work Plan - 테이블오더 서비스

## 개요
Application Design에서 정의된 컴포넌트(Backend 7개 모듈, Frontend 2개 프로젝트)를 개발 가능한 유닛으로 분해합니다.

---

## Part 1: 질문

### Question 1
개발 유닛을 어떻게 분해하시겠습니까?

A) 대규모 유닛 (3개) — Backend 전체 / customer-web / admin-web
B) 중규모 유닛 (5개) — Backend-Core(auth+store+common) / Backend-Domain(table+menu+order) / Backend-App / customer-web / admin-web
C) 소규모 유닛 (도메인별) — auth / store / table / menu / order / customer-web / admin-web 각각 별도
D) Other (please describe after [Answer]: tag below)

[Answer]: D - 백엔드 2명, 프론테엔드 2명

---

### Question 2
유닛 간 개발 순서는 어떻게 하시겠습니까?

A) Backend 먼저 완성 → Frontend 순차 개발
B) 도메인별 수직 슬라이스 (예: 메뉴 도메인 Backend+Frontend 함께 → 주문 도메인 Backend+Frontend 함께)
C) Other (please describe after [Answer]: tag below)

[Answer]: B (설계서를 기반으로 동시에 진행할 수 있도록 해줘)

---

## Part 2: 유닛 생성 실행 계획

- [x] Step 1: 유닛 정의 및 책임 할당
- [x] Step 2: 유닛 간 의존성 매트릭스 생성
- [x] Step 3: 사용자 스토리-유닛 매핑
- [x] Step 4: unit-of-work.md 생성
- [x] Step 5: unit-of-work-dependency.md 생성
- [x] Step 6: unit-of-work-story-map.md 생성

---
