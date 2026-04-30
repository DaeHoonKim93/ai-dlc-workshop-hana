# Unit 4: Frontend-Admin - 프론트엔드 컴포넌트 설계

---

## 1. 페이지 구조

### LoginPage (관리자 로그인)
- **경로**: /login
- **컴포넌트**: AdminLoginForm (storeCode, username, password)
- **동작**: 로그인 성공 → 토큰 저장 → DashboardPage 이동

### DashboardPage (실시간 주문 대시보드)
- **경로**: / (루트)
- **레이아웃**: 상단 TableFilter + 그리드 TableCard 배열
- **컴포넌트**: TableFilter, TableCard (그리드), OrderPreview
- **동작**: SSE 연결, 실시간 업데이트, 신규 주문 강조

### OrderDetailPage (주문 상세)
- **경로**: /tables/{tableId}/orders
- **컴포넌트**: OrderList, OrderCard, OrderStatusControl, OrderDeleteButton
- **동작**: 테이블별 전체 주문 목록, 상태 변경, 삭제

### TableManagementPage (테이블 관리)
- **경로**: /tables
- **컴포넌트**: TableList, TableSetupForm, TableCompleteButton, OrderHistoryModal
- **동작**: 테이블 목록, 초기 설정(매니저), 이용 완료, 과거 내역

### MenuManagementPage (메뉴 관리)
- **경로**: /menus
- **접근**: MANAGER 전용
- **컴포넌트**: CategoryManager, MenuList, MenuForm, ImageUploader, MenuOrderEditor
- **동작**: 카테고리/메뉴 CRUD, 이미지 업로드, 순서 조정

### StaffManagementPage (직원 관리)
- **경로**: /staff
- **접근**: MANAGER 전용
- **컴포넌트**: StaffList, StaffForm, StaffDeleteButton
- **동작**: 직원 CRUD

---

## 2. 주요 컴포넌트

### TableCard (대시보드)
- **Props**: table: TableDashboardData
- **표시**: 테이블 번호, 총 주문액, 최신 주문 미리보기 (최대 3개)
- **동작**: 클릭 → OrderDetailPage 이동
- **강조**: 신규 주문 시 배경색 변경 + 펄스 애니메이션 (3초)

### TableFilter
- **Props**: onFilter: (tableNumbers: string[]) => void
- **동작**: 테이블 번호 입력/선택으로 필터링

### OrderCard
- **Props**: order: OrderResponse
- **표시**: 주문 번호, 시각, 메뉴 목록(축약), 총 금액, 상태 뱃지
- **동작**: 상태 변경 버튼, 삭제 버튼

### OrderStatusControl
- **Props**: currentStatus: OrderStatus, onStatusChange: (newStatus) => void
- **동작**: 현재 상태에 따라 다음 상태 버튼만 표시
  - PENDING → "접수" 버튼
  - ACCEPTED → "준비중" 버튼
  - PREPARING → "완료" 버튼
  - COMPLETED → 버튼 없음

### ConfirmDialog
- **Props**: title, message, onConfirm, onCancel, isOpen
- **동작**: 확인/취소 팝업 (주문 삭제, 이용 완료 등)

### MenuForm
- **Props**: menuItem?: MenuItem (수정 시), onSubmit, onCancel
- **필드**: 메뉴명, 가격, 설명, 소분류 카테고리 선택, 이미지 업로드
- **검증**: 필수 필드, 가격 100원 이상

### ImageUploader
- **Props**: currentImageUrl?: string, onUpload: (file) => void
- **동작**: 파일 선택, 미리보기, 업로드
- **검증**: 파일 형식 (jpg/png/gif/webp), 크기 (5MB)

### OrderHistoryModal
- **Props**: tableId, isOpen, onClose
- **동작**: 과거 주문 내역 표시, 날짜 필터, 페이지네이션

---

## 3. 상태 관리

### useAuth Hook
- **상태**: token, storeId, staffId, role, isAuthenticated
- **기능**: 로그인, 로그아웃, 토큰 갱신, 역할 확인
- **저장소**: localStorage (토큰)

### useSSE Hook
- **상태**: isConnected, lastEvent
- **기능**: connect(storeId), disconnect, onEvent(callback)
- **이벤트 처리**: NEW_ORDER, ORDER_STATUS_CHANGED, ORDER_DELETED, TABLE_RESET
- **재연결**: 연결 끊김 시 3초 후 자동 재연결

### useDashboard Hook
- **상태**: tables: TableDashboardData[], highlightedTableIds: Set
- **기능**: SSE 이벤트 수신 → 테이블 데이터 업데이트
- **강조**: 신규 주문 테이블 3초간 강조 후 자동 해제

### useOrderManagement Hook
- **상태**: orders, loading, error
- **기능**: fetchOrders(tableId), updateStatus(orderId, status), deleteOrder(orderId)

### useTableManagement Hook
- **상태**: tables, loading, error
- **기능**: fetchTables, createTable, completeTable, fetchHistory

### useMenuManagement Hook
- **상태**: categories, menuItems, loading, error
- **기능**: CRUD for categories, subCategories, menuItems, uploadImage, updateOrder

---

## 4. 역할 기반 UI 제어

| UI 요소 | MANAGER | STAFF |
|---------|:-------:|:-----:|
| 대시보드 (주문 모니터링) | ✅ | ✅ |
| 주문 상태 변경 | ✅ | ✅ |
| 주문 삭제 | ✅ | ✅ |
| 테이블 이용 완료 | ✅ | ✅ |
| 과거 내역 조회 | ✅ | ✅ |
| 테이블 초기 설정 | ✅ | ❌ (숨김) |
| 메뉴 관리 메뉴 | ✅ | ❌ (숨김) |
| 직원 관리 메뉴 | ✅ | ❌ (숨김) |

---

## 5. API 연동

| Hook | API 엔드포인트 | 용도 |
|------|---------------|------|
| useAuth | POST /api/auth/admin/login | 관리자 로그인 |
| useSSE | GET /api/stores/{storeId}/orders/subscribe | SSE 구독 |
| useOrderManagement | GET /api/stores/{storeId}/orders | 주문 목록 |
| useOrderManagement | PUT /api/stores/{storeId}/orders/{id}/status | 상태 변경 |
| useOrderManagement | DELETE /api/stores/{storeId}/orders/{id} | 주문 삭제 |
| useTableManagement | GET /api/stores/{storeId}/tables | 테이블 목록 |
| useTableManagement | POST /api/stores/{storeId}/tables | 테이블 등록 |
| useTableManagement | POST /api/stores/{storeId}/tables/{id}/complete | 이용 완료 |
| useTableManagement | GET /api/stores/{storeId}/tables/{id}/history | 과거 내역 |
| useMenuManagement | GET/POST/PUT/DELETE /api/stores/{storeId}/menus | 메뉴 CRUD |
| useMenuManagement | GET/POST /api/stores/{storeId}/categories | 카테고리 |
| useMenuManagement | POST /api/stores/{storeId}/menus/{id}/image | 이미지 업로드 |

---
