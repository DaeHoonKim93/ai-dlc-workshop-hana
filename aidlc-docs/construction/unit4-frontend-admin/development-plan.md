# Unit 4: Frontend-Admin 개발 계획서

> **프로젝트**: 테이블오더 서비스 - 관리자 웹 (admin-web)
> **기술 스택**: React + TypeScript
> **백엔드 참조**: Unit1 (Backend-Core), Unit2 (Backend-Domain)
> **Base URL**: `/api`

---

## 전체 Phase 구성

| Phase | 이름 | 설명 | 의존성 |
|:-----:|------|------|--------|
| 1 | 프로젝트 초기 설정 | React 프로젝트 생성, 공통 설정, 디렉토리 구조 | 없음 |
| 2 | 공통 모듈 | API 클라이언트, 타입 정의, 공통 컴포넌트 | Phase 1 |
| 3 | 인증 (Auth) | 로그인, 토큰 관리, 라우트 가드 | Phase 2 |
| 4 | 대시보드 (Dashboard) | 실시간 주문 대시보드 + SSE | Phase 3 |
| 5 | 주문 관리 (Order) | 주문 상세, 상태 변경, 삭제 | Phase 4 |
| 6 | 테이블 관리 (Table) | 테이블 CRUD, 이용 완료, 과거 내역 | Phase 3 |
| 7 | 메뉴 관리 (Menu) | 카테고리/메뉴 CRUD, 이미지 업로드, 순서 변경 | Phase 3 |
| 8 | 직원 관리 (Staff) | 직원 CRUD | Phase 3 |
| 9 | 통합 및 마무리 | 역할 기반 UI 제어, 에러 처리, 반응형 | Phase 4~8 |

---

## Phase 1: 프로젝트 초기 설정

### 목표
React + TypeScript 프로젝트 생성 및 기본 개발 환경 구성

### 작업 항목
- [x] Vite + React + TypeScript 프로젝트 생성
- [x] 디렉토리 구조 설정
  ```
  admin-web/
  ├── src/
  │   ├── api/          # API 클라이언트, 엔드포인트별 서비스
  │   ├── components/   # 공통 UI 컴포넌트
  │   ├── hooks/        # Custom Hooks
  │   ├── pages/        # 페이지 컴포넌트
  │   ├── types/        # TypeScript 타입 정의
  │   ├── utils/        # 유틸리티 함수
  │   ├── routes/       # 라우팅 설정
  │   ├── styles/       # 글로벌 스타일
  │   ├── App.tsx
  │   └── main.tsx
  ├── public/
  ├── package.json
  ├── tsconfig.json
  └── vite.config.ts
  ```
- [x] 핵심 라이브러리 설치
  - `react-router-dom` (라우팅)
  - `axios` (HTTP 클라이언트)
  - CSS Modules (별도 프레임워크 없이 순수 CSS)
- [x] ESLint + Prettier 설정
- [x] 환경변수 설정 (`.env` - API Base URL)
- [x] Proxy 설정 (개발 시 CORS 우회)

### 산출물
- 실행 가능한 빈 React 프로젝트
- 디렉토리 구조 완성

---

## Phase 2: 공통 모듈

### 목표
모든 페이지에서 재사용할 API 클라이언트, 타입 정의, 공통 컴포넌트 구현

### 작업 항목

#### 2-1. TypeScript 타입 정의 (`src/types/`)
- [ ] `api.ts` - 공통 API Response 래퍼 타입
  ```typescript
  ApiResponse<T>, ApiError, PaginatedResponse<T>
  ```
- [ ] `auth.ts` - 인증 관련 타입
  ```typescript
  LoginRequest, LoginResponse, Role ('MANAGER' | 'STAFF')
  ```
- [ ] `order.ts` - 주문 관련 타입
  ```typescript
  Order, OrderItem, OrderStatus, OrderStatusUpdateRequest
  ```
- [ ] `table.ts` - 테이블 관련 타입
  ```typescript
  Table, TableSession, TableCreateRequest, OrderHistory
  ```
- [ ] `menu.ts` - 메뉴 관련 타입
  ```typescript
  Category, SubCategory, MenuItem, MenuCreateRequest, MenuUpdateRequest
  ```
- [ ] `staff.ts` - 직원 관련 타입
  ```typescript
  Staff, StaffCreateRequest, StaffUpdateRequest
  ```
- [ ] `dashboard.ts` - 대시보드 관련 타입
  ```typescript
  DashboardData, TableDashboardData, SSEEvent
  ```

#### 2-2. API 클라이언트 (`src/api/`)
- [ ] `client.ts` - Axios 인스턴스 설정
  - Base URL 설정
  - Request Interceptor: Authorization 헤더 자동 추가
  - Response Interceptor: 401 시 토큰 갱신 자동 처리
  - 에러 핸들링 공통 로직
- [ ] `auth.api.ts` - 인증 API 함수
- [ ] `order.api.ts` - 주문 API 함수
- [ ] `table.api.ts` - 테이블 API 함수
- [ ] `menu.api.ts` - 메뉴/카테고리 API 함수
- [ ] `staff.api.ts` - 직원 API 함수
- [ ] `dashboard.api.ts` - 대시보드 API 함수

#### 2-3. 공통 컴포넌트 (`src/components/`)
- [ ] `Layout.tsx` - 전체 레이아웃 (사이드바 + 헤더 + 콘텐츠)
- [ ] `Sidebar.tsx` - 네비게이션 사이드바 (역할 기반 메뉴 표시)
- [ ] `Header.tsx` - 상단 헤더 (매장명, 사용자 정보, 로그아웃)
- [ ] `ConfirmDialog.tsx` - 확인/취소 팝업
- [ ] `LoadingSpinner.tsx` - 로딩 인디케이터
- [ ] `ErrorMessage.tsx` - 에러 메시지 표시
- [ ] `Badge.tsx` - 상태 뱃지 (주문 상태 등)
- [ ] `Pagination.tsx` - 페이지네이션 컴포넌트

### 산출물
- 전체 TypeScript 타입 정의
- Axios 기반 API 클라이언트 (인터셉터 포함)
- 재사용 가능한 공통 UI 컴포넌트

---

## Phase 3: 인증 (Auth)

### 목표
관리자 로그인, 토큰 관리, 인증 상태 기반 라우트 가드 구현

### 작업 항목
- [ ] `useAuth` Hook 구현
  - 로그인 (POST `/api/auth/admin/login`)
  - 로그아웃 (POST `/api/auth/logout`)
  - 토큰 저장/삭제 (localStorage)
  - 토큰 갱신 (POST `/api/auth/refresh`)
  - 인증 상태 관리 (token, storeId, staffId, role)
  - 역할 확인 함수 (isManager, isStaff)
- [ ] `LoginPage.tsx` 구현
  - 매장 코드, 사용자명, 비밀번호 입력 폼
  - 입력값 검증 (필수 필드, 비밀번호 8자 이상)
  - 에러 메시지 표시 (인증 실패, 계정 잠금 등)
  - 로그인 성공 시 대시보드로 리다이렉트
- [ ] `ProtectedRoute.tsx` 구현
  - 미인증 시 로그인 페이지로 리다이렉트
  - 역할 기반 접근 제어 (MANAGER 전용 페이지)
- [ ] 라우팅 설정 (`src/routes/`)
  - 공개 라우트: `/login`
  - 보호 라우트: `/`, `/tables/*`, `/menus`, `/staff`
  - MANAGER 전용 라우트: `/menus`, `/staff`, 테이블 등록

### 연동 API
| API | Method | Path | 용도 |
|-----|--------|------|------|
| 관리자 로그인 | POST | `/api/auth/admin/login` | 로그인 |
| 토큰 갱신 | POST | `/api/auth/refresh` | 자동 갱신 |
| 로그아웃 | POST | `/api/auth/logout` | 로그아웃 |

### 산출물
- 로그인 페이지 (폼 검증 + 에러 처리)
- 인증 상태 관리 Hook
- 라우트 가드 (인증 + 역할 기반)

---

## Phase 4: 대시보드 (Dashboard)

### 목표
실시간 주문 모니터링 대시보드 구현 (SSE 기반)

### 작업 항목
- [ ] `useSSE` Hook 구현
  - SSE 연결 (GET `/api/stores/{storeId}/orders/subscribe`)
  - 이벤트 핸들링: NEW_ORDER, ORDER_STATUS_CHANGED, ORDER_DELETED, TABLE_RESET
  - 자동 재연결 (연결 끊김 시 3초 후)
  - 연결 상태 관리 (isConnected)
- [ ] `useDashboard` Hook 구현
  - 대시보드 데이터 조회 (GET `/api/stores/{storeId}/dashboard`)
  - SSE 이벤트 수신 → 테이블 데이터 실시간 업데이트
  - 신규 주문 테이블 강조 (3초간 하이라이트)
- [ ] `DashboardPage.tsx` 구현
  - 상단: TableFilter (테이블 번호 필터링)
  - 본문: TableCard 그리드 배열
  - 실시간 업데이트 반영
- [ ] `TableFilter.tsx` 구현
  - 테이블 번호 입력/선택으로 필터링
- [ ] `TableCard.tsx` 구현
  - 테이블 번호, 총 주문액, 최신 주문 미리보기 (최대 3개)
  - 클릭 시 OrderDetailPage로 이동
  - 신규 주문 시 배경색 변경 + 펄스 애니메이션 (3초)

### 연동 API
| API | Method | Path | 용도 |
|-----|--------|------|------|
| 대시보드 조회 | GET | `/api/stores/{storeId}/dashboard` | 초기 데이터 |
| SSE 구독 | GET | `/api/stores/{storeId}/orders/subscribe` | 실시간 알림 |

### 산출물
- 실시간 주문 대시보드 페이지
- SSE 연결 및 이벤트 처리 Hook
- 테이블 카드 그리드 (필터링 + 하이라이트)

---

## Phase 5: 주문 관리 (Order)

### 목표
테이블별 주문 상세 조회, 상태 변경, 삭제 기능 구현

### 작업 항목
- [ ] `useOrderManagement` Hook 구현
  - 주문 목록 조회 (GET `/api/stores/{storeId}/orders?tableId=X`)
  - 주문 상태 변경 (PUT `/api/stores/{storeId}/orders/{orderId}/status`)
  - 주문 삭제 (DELETE `/api/stores/{storeId}/orders/{orderId}`)
  - 로딩/에러 상태 관리
- [ ] `OrderDetailPage.tsx` 구현 (`/tables/{tableId}/orders`)
  - 테이블별 전체 주문 목록 표시
  - 주문 카드 리스트
- [ ] `OrderCard.tsx` 구현
  - 주문 번호, 시각, 메뉴 목록(축약), 총 금액, 상태 뱃지
  - 상태 변경 버튼, 삭제 버튼
- [ ] `OrderStatusControl.tsx` 구현
  - 현재 상태에 따라 다음 상태 버튼만 표시
    - PENDING → "접수" 버튼
    - ACCEPTED → "준비중" 버튼
    - PREPARING → "완료" 버튼
    - COMPLETED → 버튼 없음
- [ ] `OrderDeleteButton.tsx` 구현
  - 삭제 확인 다이얼로그 연동

### 연동 API
| API | Method | Path | 용도 |
|-----|--------|------|------|
| 주문 목록 | GET | `/api/stores/{storeId}/orders` | 테이블별 주문 |
| 상태 변경 | PUT | `/api/stores/{storeId}/orders/{orderId}/status` | 상태 전이 |
| 주문 삭제 | DELETE | `/api/stores/{storeId}/orders/{orderId}` | 주문 삭제 |

### 산출물
- 주문 상세 페이지 (테이블별)
- 주문 상태 변경 UI (순방향 전이만)
- 주문 삭제 (확인 다이얼로그)

---

## Phase 6: 테이블 관리 (Table)

### 목표
테이블 목록 조회, 등록(MANAGER), 이용 완료, 과거 주문 내역 조회

### 작업 항목
- [ ] `useTableManagement` Hook 구현
  - 테이블 목록 조회 (GET `/api/stores/{storeId}/tables`)
  - 테이블 등록 (POST `/api/stores/{storeId}/tables`)
  - 이용 완료 (POST `/api/stores/{storeId}/tables/{tableId}/complete`)
  - 과거 내역 조회 (GET `/api/stores/{storeId}/tables/{tableId}/history`)
- [ ] `TableManagementPage.tsx` 구현 (`/tables`)
  - 테이블 목록 표시
  - MANAGER: 테이블 등록 버튼
  - 각 테이블: 이용 완료 버튼, 과거 내역 버튼
- [ ] `TableList.tsx` 구현
  - 테이블 번호, 활성 상태, 현재 세션 정보 표시
- [ ] `TableSetupForm.tsx` 구현 (MANAGER 전용)
  - 테이블 번호, 비밀번호 입력
  - 입력값 검증 (테이블 번호 1~20자, 비밀번호 8자 이상)
  - 중복 에러 처리
- [ ] `TableCompleteButton.tsx` 구현
  - 이용 완료 확인 다이얼로그
  - 활성 세션 없을 때 비활성화
- [ ] `OrderHistoryModal.tsx` 구현
  - 과거 주문 내역 모달
  - 날짜 필터 (startDate, endDate)
  - 페이지네이션

### 연동 API
| API | Method | Path | 용도 |
|-----|--------|------|------|
| 테이블 목록 | GET | `/api/stores/{storeId}/tables` | 목록 조회 |
| 테이블 등록 | POST | `/api/stores/{storeId}/tables` | 초기 설정 |
| 이용 완료 | POST | `/api/stores/{storeId}/tables/{tableId}/complete` | 세션 종료 |
| 과거 내역 | GET | `/api/stores/{storeId}/tables/{tableId}/history` | 이력 조회 |

### 산출물
- 테이블 관리 페이지
- 테이블 등록 폼 (MANAGER 전용)
- 이용 완료 처리
- 과거 주문 내역 모달 (날짜 필터 + 페이지네이션)

---

## Phase 7: 메뉴 관리 (Menu)

### 목표
카테고리(대분류/소분류) 관리, 메뉴 CRUD, 이미지 업로드, 노출 순서 변경 (MANAGER 전용)

### 작업 항목
- [ ] `useMenuManagement` Hook 구현
  - 카테고리 목록 조회 (GET `/api/stores/{storeId}/categories`)
  - 대분류 생성 (POST `/api/stores/{storeId}/categories`)
  - 소분류 생성 (POST `/api/stores/{storeId}/categories/{id}/subcategories`)
  - 카테고리 수정 (PUT `/api/stores/{storeId}/categories/{id}`)
  - 카테고리 삭제 (DELETE `/api/stores/{storeId}/categories/{id}`)
  - 메뉴 목록 조회 (GET `/api/stores/{storeId}/menus`)
  - 메뉴 등록 (POST `/api/stores/{storeId}/menus`)
  - 메뉴 수정 (PUT `/api/stores/{storeId}/menus/{menuId}`)
  - 메뉴 삭제 (DELETE `/api/stores/{storeId}/menus/{menuId}`)
  - 순서 변경 (PUT `/api/stores/{storeId}/menus/order`)
  - 이미지 업로드 (POST `/api/stores/{storeId}/menus/{menuId}/image`)
- [ ] `MenuManagementPage.tsx` 구현 (`/menus`)
  - 좌측: 카테고리 트리 (대분류 > 소분류)
  - 우측: 선택된 카테고리의 메뉴 목록
- [ ] `CategoryManager.tsx` 구현
  - 대분류/소분류 추가, 수정, 삭제
  - 삭제 시 하위 항목 존재 에러 처리
- [ ] `MenuList.tsx` 구현
  - 메뉴 카드/리스트 표시
  - 드래그 앤 드롭 순서 변경 (또는 화살표 버튼)
- [ ] `MenuForm.tsx` 구현
  - 메뉴명, 가격, 설명, 소분류 선택, 이미지 업로드
  - 입력값 검증 (필수 필드, 가격 100원 이상)
  - 등록/수정 모드 지원
- [ ] `ImageUploader.tsx` 구현
  - 파일 선택, 미리보기
  - 파일 형식 검증 (jpg/png/gif/webp)
  - 파일 크기 검증 (5MB)
  - 업로드 진행 표시
- [ ] `MenuOrderEditor.tsx` 구현
  - 메뉴 노출 순서 변경 UI

### 연동 API
| API | Method | Path | 용도 |
|-----|--------|------|------|
| 카테고리 목록 | GET | `/api/stores/{storeId}/categories` | 조회 |
| 대분류 생성 | POST | `/api/stores/{storeId}/categories` | 생성 |
| 소분류 생성 | POST | `/api/stores/{storeId}/categories/{id}/subcategories` | 생성 |
| 카테고리 수정 | PUT | `/api/stores/{storeId}/categories/{id}` | 수정 |
| 카테고리 삭제 | DELETE | `/api/stores/{storeId}/categories/{id}` | 삭제 |
| 메뉴 목록 | GET | `/api/stores/{storeId}/menus` | 조회 |
| 메뉴 등록 | POST | `/api/stores/{storeId}/menus` | 등록 |
| 메뉴 수정 | PUT | `/api/stores/{storeId}/menus/{menuId}` | 수정 |
| 메뉴 삭제 | DELETE | `/api/stores/{storeId}/menus/{menuId}` | 삭제 |
| 순서 변경 | PUT | `/api/stores/{storeId}/menus/order` | 순서 |
| 이미지 업로드 | POST | `/api/stores/{storeId}/menus/{menuId}/image` | 이미지 |

### 산출물
- 메뉴 관리 페이지 (카테고리 트리 + 메뉴 리스트)
- 카테고리 CRUD
- 메뉴 CRUD + 이미지 업로드
- 메뉴 노출 순서 변경

---

## Phase 8: 직원 관리 (Staff)

### 목표
직원 목록 조회, 등록, 수정, 삭제 (MANAGER 전용)

### 작업 항목
- [ ] `useStaffManagement` Hook 구현
  - 직원 목록 조회 (GET `/api/stores/{storeId}/staff`)
  - 직원 등록 (POST `/api/stores/{storeId}/staff`)
  - 직원 수정 (PUT `/api/stores/{storeId}/staff/{staffId}`)
  - 직원 삭제 (DELETE `/api/stores/{storeId}/staff/{staffId}`)
- [ ] `StaffManagementPage.tsx` 구현 (`/staff`)
  - 직원 목록 테이블
  - 등록 버튼
- [ ] `StaffList.tsx` 구현
  - 사용자명, 역할, 활성 상태, 생성일 표시
  - 수정/삭제 버튼
- [ ] `StaffForm.tsx` 구현
  - 사용자명 (영문+숫자, 1~50자)
  - 비밀번호 (8자 이상)
  - 역할 선택 (MANAGER / STAFF)
  - 등록/수정 모드 지원
  - 중복 username 에러 처리
- [ ] `StaffDeleteButton.tsx` 구현
  - 삭제 확인 다이얼로그
  - 자기 자신 삭제 시도 에러 처리

### 연동 API
| API | Method | Path | 용도 |
|-----|--------|------|------|
| 직원 목록 | GET | `/api/stores/{storeId}/staff` | 조회 |
| 직원 등록 | POST | `/api/stores/{storeId}/staff` | 등록 |
| 직원 수정 | PUT | `/api/stores/{storeId}/staff/{staffId}` | 수정 |
| 직원 삭제 | DELETE | `/api/stores/{storeId}/staff/{staffId}` | 삭제 |

### 산출물
- 직원 관리 페이지 (MANAGER 전용)
- 직원 CRUD (폼 검증 + 에러 처리)

---

## Phase 9: 통합 및 마무리

### 목표
역할 기반 UI 제어 통합, 글로벌 에러 처리, UX 개선

### 작업 항목
- [ ] 역할 기반 UI 제어 통합
  - MANAGER: 모든 메뉴 표시
  - STAFF: 대시보드, 주문 관리, 테이블 이용 완료/과거 내역만 표시
  - 사이드바 메뉴 동적 렌더링
  - MANAGER 전용 페이지 직접 접근 차단
- [ ] 글로벌 에러 처리
  - 네트워크 에러 토스트 알림
  - 401 → 자동 토큰 갱신 또는 로그인 리다이렉트
  - 403 → 권한 없음 안내
  - 404 → Not Found 페이지
  - 500 → 서버 오류 안내
- [ ] UX 개선
  - 로딩 상태 표시 (스켈레톤 또는 스피너)
  - 성공/실패 토스트 알림
  - 빈 상태 UI (데이터 없을 때)
  - SSE 연결 상태 표시 (연결됨/끊김)
- [ ] 반응형 레이아웃 점검
  - 데스크톱 기준 최적화
  - 최소 너비 1024px 지원
- [ ] 접근성 (Accessibility)
  - 키보드 네비게이션
  - ARIA 레이블
  - 포커스 관리

### 산출물
- 역할 기반 완전한 UI 제어
- 통합 에러 처리
- 최종 완성된 관리자 웹 애플리케이션

---

## Phase별 예상 작업량

| Phase | 예상 파일 수 | 복잡도 |
|:-----:|:-----------:|:------:|
| 1 | 5~8 | ⭐ |
| 2 | 15~20 | ⭐⭐ |
| 3 | 5~7 | ⭐⭐ |
| 4 | 6~8 | ⭐⭐⭐ |
| 5 | 5~7 | ⭐⭐ |
| 6 | 6~8 | ⭐⭐ |
| 7 | 8~12 | ⭐⭐⭐ |
| 8 | 5~6 | ⭐⭐ |
| 9 | 3~5 | ⭐⭐ |

---

## 참조 문서

- **프론트엔드 컴포넌트 설계**: `unit4-frontend-admin/functional-design/frontend-components.md`
- **백엔드 Core API 명세**: `unit1-backend-core/api-specification.md`
- **백엔드 Domain API 명세**: `unit2-backend-domain/functional-design/api-specification.md`
- **애플리케이션 설계**: `inception/application-design/application-design.md`
- **도메인 엔티티 (Core)**: `unit1-backend-core/functional-design/domain-entities.md`
- **도메인 엔티티 (Domain)**: `unit2-backend-domain/functional-design/domain-entities.md`
- **비즈니스 규칙 (Core)**: `unit1-backend-core/functional-design/business-rules.md`
- **비즈니스 규칙 (Domain)**: `unit2-backend-domain/functional-design/business-rules.md`
