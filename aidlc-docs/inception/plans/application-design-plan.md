# Application Design Plan - 테이블오더 서비스

## 개요
요구사항(FR-01~FR-09)과 사용자 스토리(US-01~US-26)를 기반으로 애플리케이션의 컴포넌트, 서비스 레이어, 의존성을 설계합니다.

---

## Part 1: 설계 결정 질문

### Question 1
Backend API 구조를 어떻게 구성하시겠습니까?

A) 단일 모듈 (Monolithic) — 하나의 Spring Boot 프로젝트에 모든 기능 포함
B) 멀티 모듈 (Multi-Module) — 도메인별로 모듈 분리 (order, menu, auth, table 등)
C) Other (please describe after [Answer]: tag below)

[Answer]: B 

---

### Question 2
Frontend 프로젝트 구조를 어떻게 구성하시겠습니까?

A) 단일 React 프로젝트 — 고객용/관리자용을 하나의 프로젝트에서 라우팅으로 분리
B) 별도 React 프로젝트 2개 — 고객용(customer-web)과 관리자용(admin-web) 분리
C) Monorepo — 하나의 저장소에서 고객용/관리자용을 별도 패키지로 관리
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3
API 설계 스타일은 어떻게 하시겠습니까?

A) RESTful API (리소스 기반 URL, HTTP 메서드 활용)
B) GraphQL
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: 설계 실행 계획

### Phase A: 컴포넌트 식별
- [x] Step 1: Backend 컴포넌트 식별 (Controller, Service, Repository 계층)
- [x] Step 2: Frontend 컴포넌트 식별 (Pages, Components, Hooks, Services)
- [x] Step 3: 공통/인프라 컴포넌트 식별 (Auth, Config, Exception Handling)
- [x] Step 4: components.md 생성

### Phase B: 컴포넌트 메서드 정의
- [x] Step 5: Controller 메서드 시그니처 정의 (API 엔드포인트)
- [x] Step 6: Service 메서드 시그니처 정의
- [x] Step 7: Repository 메서드 시그니처 정의
- [x] Step 8: component-methods.md 생성

### Phase C: 서비스 레이어 설계
- [x] Step 9: 서비스 정의 및 책임 할당
- [x] Step 10: 서비스 간 상호작용 패턴 정의
- [x] Step 11: services.md 생성

### Phase D: 의존성 및 통합
- [x] Step 12: 컴포넌트 간 의존성 매핑
- [x] Step 13: 데이터 흐름 정의
- [x] Step 14: component-dependency.md 생성
- [x] Step 15: application-design.md 통합 문서 생성

---
