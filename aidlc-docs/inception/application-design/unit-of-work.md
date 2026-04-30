# 테이블오더 서비스 - Unit of Work 정의

## 분해 전략
- **팀 구성**: Backend 2명, Frontend 2명
- **개발 방식**: 도메인별 수직 슬라이스 (BE+FE 동시 진행)
- **유닛 수**: 4개

---

## Unit 1: Backend-Core (BE 개발자 1)

### 정의
인증/인가, 매장, 직원 관리 등 시스템의 기반 기능을 담당하는 백엔드 유닛

### 포함 모듈
- **common**: 공통 예외, DTO, 유틸리티, 설정
- **auth**: JWT 인증/인가, 로그인, 역할 기반 접근 제어
- **store**: 매장 정보, 직원 계정 관리

### 책임
- 프로젝트 초기 설정 (Spring Boot, Gradle Multi-Module, PostgreSQL 연동)
- 공통 모듈 구축 (예외 처리, 응답 DTO, CORS, Security 설정)
- JWT 토큰 기반 인증/인가 구현
- 관리자 로그인 (매장 식별자 + 사용자명 + 비밀번호)
- 태블릿 로그인 (매장 식별자 + 테이블 번호 + 비밀번호)
- 역할 기반 접근 제어 (MANAGER, STAFF, TABLE)
- 로그인 시도 제한 (brute-force 방지)
- 직원 계정 CRUD
- 매장 정보 조회

### API 엔드포인트
- POST /api/auth/admin/login
- POST /api/auth/table/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/stores/{storeId}
- GET /api/stores/{storeId}/staff
- POST /api/stores/{storeId}/staff
- PUT /api/stores/{storeId}/staff/{staffId}
- DELETE /api/stores/{storeId}/staff/{staffId}

### 선행 조건
- 없음 (첫 번째로 시작 가능)

### 산출물
- Spring Boot Multi-Module 프로젝트 구조
- common 모듈 (공통 코드)
- auth 모듈 (인증/인가)
- store 모듈 (매장/직원)
- DB 스키마 (Store, Staff, LoginAttempt 테이블)
- 단위 테스트

---

## Unit 2: Backend-Domain (BE 개발자 2)

### 정의
테이블, 메뉴, 주문 등 핵심 비즈니스 도메인을 담당하는 백엔드 유닛

### 포함 모듈
- **table**: 테이블 관리, 세션 라이프사이클
- **menu**: 카테고리/메뉴 CRUD, S3 이미지 업로드
- **order**: 주문 처리, SSE 실시간 알림

### 책임
- 테이블 CRUD 및 초기 설정
- 테이블 세션 라이프사이클 (시작/종료/이력 이동)
- 카테고리 CRUD (대분류/소분류)
- 메뉴 아이템 CRUD
- 메뉴 이미지 S3 업로드
- 메뉴 노출 순서 관리
- 주문 생성/조회/상태 변경/삭제
- SSE 기반 실시간 주문 알림
- 과거 주문 내역 관리

### API 엔드포인트
- GET/POST /api/stores/{storeId}/tables
- POST /api/stores/{storeId}/tables/{tableId}/complete
- GET /api/stores/{storeId}/tables/{tableId}/history
- GET/POST /api/stores/{storeId}/categories
- GET/POST/PUT/DELETE /api/stores/{storeId}/menus
- PUT /api/stores/{storeId}/menus/order
- POST /api/stores/{storeId}/menus/{menuId}/image
- GET/POST /api/stores/{storeId}/orders
- PUT /api/stores/{storeId}/orders/{orderId}/status
- DELETE /api/stores/{storeId}/orders/{orderId}
- GET /api/stores/{storeId}/orders/subscribe (SSE)

### 선행 조건
- Unit 1의 common 모듈 완성 (공통 예외, DTO, Security 설정)
- Unit 1의 auth 모듈 완성 (인증 필터, 역할 기반 접근 제어)

### 산출물
- table 모듈 (테이블/세션)
- menu 모듈 (카테고리/메뉴/이미지)
- order 모듈 (주문/SSE)
- DB 스키마 (Table, TableSession, Category, SubCategory, MenuItem, Order, OrderItem, OrderHistory 테이블)
- 단위 테스트

---

## Unit 3: Frontend-Customer (FE 개발자 1)

### 정의
고객용 태블릿 주문 인터페이스를 담당하는 프론트엔드 유닛

### 프로젝트
- **customer-web** (React + TypeScript)

### 책임
- 태블릿 초기 설정 화면 (LoginPage)
- 자동 로그인 및 세션 관리
- 메뉴 조회/탐색 (2단계 카테고리, 카드 레이아웃)
- 장바구니 관리 (로컬 스토리지, 수량 조절, 총액 계산)
- 주문 생성 (확인 → 확정 → 성공 5초 표시 → 리다이렉트)
- 주문 내역 조회 (현재 세션, 상태 표시)
- 터치 친화적 UI (44x44px 최소 터치 타겟)

### Pages
- LoginPage, MenuPage, CartPage, OrderConfirmPage, OrderSuccessPage, OrderHistoryPage

### 선행 조건
- API 설계서 기반으로 동시 개발 가능 (Mock API 활용)
- Unit 1 auth API 완성 시 실제 연동

### 산출물
- customer-web React 프로젝트
- 6개 페이지 컴포넌트
- 재사용 UI 컴포넌트
- 커스텀 훅 (useAuth, useCart, useMenu, useOrders)
- API 서비스 레이어
- 단위 테스트

---

## Unit 4: Frontend-Admin (FE 개발자 2)

### 정의
관리자용 대시보드 및 관리 인터페이스를 담당하는 프론트엔드 유닛

### 프로젝트
- **admin-web** (React + TypeScript)

### 책임
- 관리자 로그인 (매장 식별자 + 사용자명 + 비밀번호)
- 실시간 주문 대시보드 (SSE, 그리드 레이아웃, 테이블별 카드)
- 주문 상세 보기 및 상태 변경
- 주문 삭제
- 테이블 관리 (초기 설정, 이용 완료, 과거 내역)
- 메뉴 관리 (CRUD, 이미지 업로드, 순서 조정)
- 직원 관리 (매니저 전용)
- 역할 기반 메뉴 표시 (MANAGER vs STAFF)

### Pages
- LoginPage, DashboardPage, OrderDetailPage, TableManagementPage, MenuManagementPage, StaffManagementPage

### 선행 조건
- API 설계서 기반으로 동시 개발 가능 (Mock API 활용)
- Unit 1 auth API 완성 시 실제 연동
- Unit 2 SSE API 완성 시 실시간 연동

### 산출물
- admin-web React 프로젝트
- 6개 페이지 컴포넌트
- 재사용 UI 컴포넌트
- 커스텀 훅 (useAuth, useSSE, useDashboard, useTableManagement, useMenuManagement, useOrderManagement)
- API 서비스 레이어
- 단위 테스트

---

## 개발 타임라인 (수직 슬라이스)

```
Week 1-2: 기반 구축 (동시 진행)
  BE1: Unit 1 (common + auth + store)
  BE2: Unit 2 시작 (table + menu 스키마/기본 CRUD)
  FE1: Unit 3 시작 (프로젝트 설정 + LoginPage + MenuPage - Mock API)
  FE2: Unit 4 시작 (프로젝트 설정 + LoginPage + DashboardPage 레이아웃 - Mock API)

Week 3-4: 핵심 기능 (동시 진행)
  BE1: Unit 1 완성 + Unit 2 지원
  BE2: Unit 2 (order + SSE)
  FE1: Unit 3 (CartPage + OrderConfirmPage + OrderSuccessPage - API 연동 시작)
  FE2: Unit 4 (OrderDetailPage + 상태 변경 + SSE 연동 시작)

Week 5-6: 통합 및 완성
  BE1+BE2: 통합 테스트 + 버그 수정
  FE1: Unit 3 (OrderHistoryPage + 전체 API 연동 + 테스트)
  FE2: Unit 4 (TableManagement + MenuManagement + StaffManagement + 테스트)
```

---

## 코드 조직 구조 (Greenfield)

```
table-order/
+-- table-order-backend/          # Backend (Gradle Multi-Module)
|   +-- common/
|   +-- auth/
|   +-- store/
|   +-- table/
|   +-- menu/
|   +-- order/
|   +-- app/
|   +-- build.gradle
|   +-- settings.gradle
+-- customer-web/                 # Frontend - 고객용
|   +-- src/
|   +-- package.json
+-- admin-web/                    # Frontend - 관리자용
|   +-- src/
|   +-- package.json
+-- aidlc-docs/                   # 문서
+-- requirements/                 # 요구사항
```

---
