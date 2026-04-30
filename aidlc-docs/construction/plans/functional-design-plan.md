# Functional Design Plan - 전체 유닛

## 개요
4개 유닛 모두의 Functional Design을 수행합니다. 요구사항, 사용자 스토리, Application Design이 이미 상세하게 정의되어 있으므로 추가 질문 없이 설계를 진행합니다.

---

## 실행 계획

### Unit 1: Backend-Core
- [x] Step 1: 도메인 엔티티 정의 (Store, Staff, LoginAttempt)
- [x] Step 2: 비즈니스 로직 모델 (인증 플로우, 역할 관리)
- [x] Step 3: 비즈니스 규칙 (비밀번호 정책, 로그인 제한, JWT 정책)

### Unit 2: Backend-Domain
- [x] Step 4: 도메인 엔티티 정의 (Table, TableSession, Category, SubCategory, MenuItem, Order, OrderItem, OrderHistory)
- [x] Step 5: 비즈니스 로직 모델 (주문 플로우, 세션 라이프사이클, SSE)
- [x] Step 6: 비즈니스 규칙 (주문 상태 전이, 메뉴 검증, 세션 규칙)

### Unit 3: Frontend-Customer
- [x] Step 7: 프론트엔드 컴포넌트 설계 (Pages, Components, Hooks)
- [x] Step 8: 상태 관리 및 데이터 흐름

### Unit 4: Frontend-Admin
- [x] Step 9: 프론트엔드 컴포넌트 설계 (Pages, Components, Hooks)
- [x] Step 10: 상태 관리 및 데이터 흐름 (SSE 포함)

---
