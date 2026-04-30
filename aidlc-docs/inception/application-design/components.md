# 테이블오더 서비스 - 컴포넌트 정의

## 1. Backend 컴포넌트 (Spring Boot Multi-Module)

### 1.1 모듈 구조

```
table-order-backend/
+-- common/              # 공통 모듈
+-- auth/                # 인증/인가 모듈
+-- store/               # 매장 모듈
+-- table/               # 테이블 모듈
+-- menu/                # 메뉴 모듈
+-- order/               # 주문 모듈
+-- app/                 # 메인 애플리케이션 모듈 (조립)
```

### 1.2 common 모듈
**책임**: 전체 모듈에서 공유하는 공통 코드
- 공통 예외 클래스 (GlobalExceptionHandler)
- 공통 응답 DTO (ApiResponse, PageResponse)
- 공통 유틸리티 (DateUtils 등)
- 공통 설정 (CORS, Security 기본 설정)
- 공통 상수 정의

### 1.3 auth 모듈
**책임**: 인증/인가 처리
- JWT 토큰 생성/검증/갱신
- 관리자 로그인 (매장 식별자 + 사용자명 + 비밀번호)
- 태블릿 로그인 (매장 식별자 + 테이블 번호 + 비밀번호)
- 역할 기반 접근 제어 (MANAGER, STAFF)
- 로그인 시도 제한 (brute-force 방지)
- 비밀번호 bcrypt 해싱

### 1.4 store 모듈
**책임**: 매장 정보 관리
- 매장 정보 조회
- 관리자 계정 관리 (CRUD)
- 역할 할당 및 권한 관리

### 1.5 table 모듈
**책임**: 테이블 및 세션 관리
- 테이블 CRUD (초기 설정 포함)
- 테이블 세션 라이프사이클 (시작/종료)
- 이용 완료 처리 (세션 종료, 이력 이동, 리셋)
- 과거 주문 내역 조회

### 1.6 menu 모듈
**책임**: 메뉴 및 카테고리 관리
- 카테고리 CRUD (대분류/소분류)
- 메뉴 아이템 CRUD
- 메뉴 노출 순서 관리
- 이미지 업로드 (S3 연동)
- 메뉴 조회 (고객용 — 카테고리별)

### 1.7 order 모듈
**책임**: 주문 처리 및 실시간 알림
- 주문 생성
- 주문 상태 변경 (대기중 → 접수 → 준비중 → 완료)
- 주문 삭제
- 주문 조회 (테이블별, 세션별)
- SSE 기반 실시간 주문 알림
- 주문 이력 관리 (OrderHistory)

### 1.8 app 모듈
**책임**: 애플리케이션 조립 및 실행
- Spring Boot 메인 클래스
- 모듈 통합 설정
- 프로파일별 설정 (dev, prod)

---

## 2. Frontend 컴포넌트

### 2.1 customer-web (고객용)

```
customer-web/
+-- src/
    +-- pages/           # 페이지 컴포넌트
    +-- components/      # 재사용 UI 컴포넌트
    +-- hooks/           # 커스텀 훅
    +-- services/        # API 호출 서비스
    +-- store/           # 상태 관리 (장바구니 등)
    +-- types/           # TypeScript 타입 정의
    +-- utils/           # 유틸리티 함수
```

**Pages**:
- LoginPage: 태블릿 초기 설정 화면
- MenuPage: 메뉴 조회/탐색 (기본 화면)
- CartPage: 장바구니 관리
- OrderConfirmPage: 주문 확인
- OrderSuccessPage: 주문 성공 (5초 표시)
- OrderHistoryPage: 주문 내역 조회

**Components**:
- CategoryNav: 카테고리 네비게이션 (대분류/소분류)
- MenuCard: 메뉴 카드
- MenuDetail: 메뉴 상세 모달
- CartItem: 장바구니 아이템
- CartSummary: 장바구니 요약/총액
- OrderStatusBadge: 주문 상태 뱃지

**Hooks**:
- useAuth: 태블릿 인증/세션 관리
- useCart: 장바구니 상태 관리 (로컬 스토리지)
- useMenu: 메뉴 데이터 조회
- useOrders: 주문 내역 조회

**Services**:
- authService: 인증 API 호출
- menuService: 메뉴 API 호출
- orderService: 주문 API 호출

### 2.2 admin-web (관리자용)

```
admin-web/
+-- src/
    +-- pages/           # 페이지 컴포넌트
    +-- components/      # 재사용 UI 컴포넌트
    +-- hooks/           # 커스텀 훅
    +-- services/        # API 호출 서비스
    +-- store/           # 상태 관리
    +-- types/           # TypeScript 타입 정의
    +-- utils/           # 유틸리티 함수
```

**Pages**:
- LoginPage: 관리자 로그인
- DashboardPage: 실시간 주문 대시보드
- OrderDetailPage: 주문 상세 보기
- TableManagementPage: 테이블 관리
- MenuManagementPage: 메뉴 관리
- StaffManagementPage: 직원 관리 (매니저 전용)

**Components**:
- TableCard: 테이블별 주문 카드 (대시보드)
- OrderCard: 주문 카드
- OrderStatusControl: 주문 상태 변경 컨트롤
- TableFilter: 테이블 필터링
- MenuForm: 메뉴 등록/수정 폼
- CategoryManager: 카테고리 관리
- ImageUploader: S3 이미지 업로드
- ConfirmDialog: 확인 팝업
- OrderHistory: 과거 주문 내역

**Hooks**:
- useAuth: 관리자 인증/세션 관리
- useSSE: SSE 실시간 연결 관리
- useDashboard: 대시보드 데이터 관리
- useTableManagement: 테이블 관리
- useMenuManagement: 메뉴 관리
- useOrderManagement: 주문 관리

**Services**:
- authService: 인증 API 호출
- orderService: 주문 API 호출
- tableService: 테이블 API 호출
- menuService: 메뉴 API 호출
- staffService: 직원 관리 API 호출
- sseService: SSE 연결 관리

---

## 3. 공통/인프라 컴포넌트

### 3.1 Security
- JwtTokenProvider: JWT 토큰 생성/검증
- JwtAuthenticationFilter: 요청별 JWT 인증 필터
- SecurityConfig: Spring Security 설정
- RoleBasedAccessControl: 역할 기반 접근 제어

### 3.2 Exception Handling
- GlobalExceptionHandler: 전역 예외 처리 (@ControllerAdvice)
- BusinessException: 비즈니스 로직 예외
- AuthenticationException: 인증 관련 예외
- AuthorizationException: 인가 관련 예외

### 3.3 Configuration
- CorsConfig: CORS 설정
- S3Config: AWS S3 클라이언트 설정
- SseConfig: SSE 설정

---
