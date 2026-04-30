# Unit 3: Frontend-Customer - 프론트엔드 컴포넌트 설계

> **기준 API 명세**: Unit 1 `api-specification.md` (Auth), Unit 2 `api-specification.md` (Category, Menu, Order)
>
> **공통 Response Wrapper**:
> ```json
> { "success": true, "data": { ... }, "message": null }
> ```
> 에러 시:
> ```json
> { "success": false, "data": null, "message": "에러 메시지", "errorCode": "ERROR_CODE" }
> ```

---

## 1. Unit 3 사용 API 목록

| # | API | Method | Path | 출처 | 설명 |
|---|-----|--------|------|------|------|
| 1 | 태블릿 로그인 | POST | `/api/auth/table/login` | Unit1 §1.2 | 매장코드 + 테이블번호 + 비밀번호 |
| 2 | 토큰 갱신 | POST | `/api/auth/refresh` | Unit1 §1.3 | Access Token 만료 시 갱신 |
| 3 | 로그아웃 | POST | `/api/auth/logout` | Unit1 §1.4 | 로그아웃 |
| 4 | 카테고리 목록 조회 | GET | `/api/stores/{storeId}/categories` | Unit2 §2.1 | 대분류 + 소분류 계층 |
| 5 | 메뉴 목록 조회 | GET | `/api/stores/{storeId}/menus?subCategoryId=X` | Unit2 §3.1 | 소분류별 메뉴 목록 |
| 6 | 메뉴 상세 조회 | GET | `/api/stores/{storeId}/menus/{menuId}` | Unit2 §3.2 | 메뉴 상세 정보 |
| 7 | 주문 생성 | POST | `/api/stores/{storeId}/orders` | Unit2 §4.1 | 장바구니 → 주문 전환 |
| 8 | 주문 목록 조회 | GET | `/api/stores/{storeId}/orders?tableId=X&sessionId=Y` | Unit2 §4.2 | 현재 세션 주문 내역 |

### 주요 플로우
```
[태블릿 로그인] → 토큰+storeId+tableId 저장
  → [카테고리 조회] → [메뉴 조회] → 장바구니(localStorage)
  → [주문 생성] → [주문 내역 조회]
  → Access Token 만료 시 [토큰 갱신] 자동 처리
```

### 접근 제어
- 모든 인증 API: `Authorization: Bearer {accessToken}` 헤더 필수
- JWT payload: `{ sub, storeId, role: "TABLE", type: "ACCESS" }`
- TABLE 역할: 본인 테이블의 현재 세션 주문만 조회 가능
- URL의 `{storeId}`와 JWT의 `storeId` 일치 검증 (서버 측)

---

## 2. TypeScript 타입 정의 (API Response 기반)

### 공통 타입
```typescript
// API 공통 응답 래퍼
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  errorCode?: string;
}

// 페이지네이션 응답
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

### Auth 타입 (Unit1 §1.2, §1.3 기반)
```typescript
// POST /api/auth/table/login - Request
interface TableLoginRequest {
  storeCode: string;     // NOT NULL, 1~50자
  tableNumber: string;   // NOT NULL, 1~20자
  password: string;      // NOT NULL, 8자 이상
}

// POST /api/auth/table/login - Response
interface TableLoginResponse {
  accessToken: string;
  refreshToken: string;
  role: 'TABLE';
  storeId: number;
  tableId: number;
}

// POST /api/auth/refresh - Request
interface RefreshTokenRequest {
  refreshToken: string;
}

// POST /api/auth/refresh - Response
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
```

### Category 타입 (Unit2 §2.1 기반)
```typescript
// GET /api/stores/{storeId}/categories - Response 배열 요소
interface SubCategory {
  id: number;
  name: string;
  displayOrder: number;
}

interface Category {
  id: number;
  name: string;
  displayOrder: number;
  subCategories: SubCategory[];
}
```

### Menu 타입 (Unit2 §3.1, §3.2 기반)
```typescript
// GET /api/stores/{storeId}/menus - Response 배열 요소
// GET /api/stores/{storeId}/menus/{menuId} - Response
interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  displayOrder: number;
  isAvailable: boolean;
  createdAt?: string;   // 상세 조회 시에만
  updatedAt?: string;   // 상세 조회 시에만
}
```

### Order 타입 (Unit2 §4.1, §4.2 기반)
```typescript
type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'COMPLETED';

// POST /api/stores/{storeId}/orders - Request
interface CreateOrderRequest {
  tableId: number;                    // NOT NULL
  items: CreateOrderItemRequest[];    // NOT NULL, 최소 1개
}

interface CreateOrderItemRequest {
  menuItemId: number;   // NOT NULL, 존재하고 판매 가능한 메뉴 ID
  quantity: number;      // NOT NULL, 1 이상
}

// 주문 항목 (Response)
interface OrderItem {
  id: number;
  menuItemId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// POST /api/stores/{storeId}/orders - Response
// GET /api/stores/{storeId}/orders/{orderId} - Response
interface Order {
  id: number;
  orderNumber: string;
  tableId: number;
  tableNumber: string;
  sessionId: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}
```

### Cart 타입 (클라이언트 전용 - 서버 API 없음)
```typescript
interface CartItem {
  menuItemId: number;
  menuName: string;
  price: number;          // 단가 (MenuItem.price 스냅샷)
  imageUrl: string | null;
  quantity: number;
}
```

---

## 3. 페이지 구조

### LoginPage (태블릿 초기 설정)
- **경로**: `/login`
- **표시 조건**: localStorage에 인증 정보(accessToken, refreshToken, storeId, tableId) 없을 때
- **컴포넌트**: LoginForm
- **API 연동**:
  - `POST /api/auth/table/login`
  - Request: `{ storeCode, tableNumber, password }`
  - Response: `{ accessToken, refreshToken, role: "TABLE", storeId, tableId }`
- **동작**:
  1. storeCode, tableNumber, password 입력 폼 표시
  2. 필수 필드 클라이언트 검증 (storeCode 1~50자, tableNumber 1~20자, password 8자 이상)
  3. 로그인 API 호출
  4. 성공 → accessToken, refreshToken, storeId, tableId를 localStorage 저장 → MenuPage(`/`) 이동
  5. 실패 → 에러 코드별 메시지 표시:
     - `AUTHENTICATION_FAILED`: "인증 정보가 올바르지 않습니다"
     - `ACCOUNT_LOCKED`: "로그인 시도가 제한되었습니다 (15분 후 재시도)"
     - `VALIDATION_ERROR`: 필드별 검증 에러 표시

### MenuPage (메뉴 조회 - 기본 화면)
- **경로**: `/` (루트)
- **레이아웃**: 상단 CategoryNav + SubCategoryTabs + 하단 MenuGrid + 하단 고정 CartFloatingButton
- **API 연동**:
  - `GET /api/stores/{storeId}/categories` → 대분류 + 소분류 계층 데이터
  - `GET /api/stores/{storeId}/menus?subCategoryId={id}` → 소분류별 메뉴 목록
- **동작**:
  1. 페이지 로드 시 카테고리 API 호출 (세션 동안 캐싱)
  2. 첫 번째 대분류 자동 선택 → 첫 번째 소분류 자동 선택
  3. 선택된 소분류의 메뉴 목록 API 호출
  4. 메뉴 카드 그리드 표시 (isAvailable=true인 메뉴만)
  5. 카테고리 변경 시 메뉴 목록 재조회
  6. 메뉴가 없는 카테고리: "등록된 메뉴가 없습니다" 메시지

### CartPage (장바구니)
- **경로**: `/cart`
- **컴포넌트**: CartItemList, CartItem, CartSummary
- **데이터 소스**: localStorage (서버 API 없음)
- **동작**:
  1. localStorage에서 CartItem[] 로드
  2. 수량 조절 (+/-), 개별 삭제, 전체 비우기
  3. 수량 1인 항목 감소 시 해당 항목 삭제
  4. 총 금액 실시간 계산: `sum(quantity * price)`
  5. 변경 시 localStorage 즉시 동기화
  6. 장바구니 비어있을 때: "장바구니가 비어있습니다" + 메뉴 보기 버튼
  7. "주문하기" 버튼 → OrderConfirmPage 이동

### OrderConfirmPage (주문 확인)
- **경로**: `/order/confirm`
- **컴포넌트**: OrderSummary, OrderItemList
- **동작**:
  1. localStorage에서 CartItem[] 로드하여 최종 확인 표시
  2. 각 항목: 메뉴명, 수량, 단가, 소계 표시
  3. 총 금액, 현재 테이블 번호 표시
  4. "뒤로가기" → CartPage로 복귀
  5. "주문 확정" 버튼 → 주문 생성 API 호출
  6. 장바구니 비어있으면 진입 차단 → "장바구니에 메뉴를 추가해주세요" 메시지
- **API 연동** (주문 확정 시):
  - `POST /api/stores/{storeId}/orders`
  - Request: `{ tableId, items: [{ menuItemId, quantity }] }`
  - Response: `{ id, orderNumber, tableId, tableNumber, sessionId, status: "PENDING", items: [...], totalAmount, createdAt }`
  - 성공 → OrderSuccessPage 이동 (orderNumber 전달)
  - 실패 에러 처리:
    - `VALIDATION_ERROR` (빈 주문 / 수량 0 이하): 에러 메시지 표시
    - `VALIDATION_ERROR` (판매 불가 메뉴): "판매 중지된 메뉴가 포함되어 있습니다: {메뉴명}" 표시
    - `NOT_FOUND` (테이블/메뉴 없음): 에러 메시지 표시
    - 네트워크 에러: "네트워크 연결을 확인해주세요" 표시 + 재시도 버튼
  - 중복 주문 방지: API 호출 중 버튼 비활성화 + 로딩 인디케이터

### OrderSuccessPage (주문 성공)
- **경로**: `/order/success`
- **컴포넌트**: OrderSuccessMessage
- **동작**:
  1. 주문 번호(orderNumber) 표시
  2. 5초 카운트다운 표시
  3. 카운트다운 완료 → localStorage 장바구니 비우기 → MenuPage(`/`) 자동 리다이렉트
  4. 카운트다운 중 수동 이동도 가능

### OrderHistoryPage (주문 내역)
- **경로**: `/orders`
- **컴포넌트**: OrderHistoryList, OrderHistoryItem, OrderStatusBadge
- **API 연동**:
  - `GET /api/stores/{storeId}/orders?tableId={tableId}&sessionId={sessionId}&page={page}&size={size}`
  - Response: 페이지네이션 래퍼 `{ content: Order[], page, size, totalElements, totalPages, last }`
  - TABLE 역할은 서버에서 자동으로 본인 테이블 + 현재 세션 필터링
- **동작**:
  1. 현재 세션 주문 목록을 시간 순으로 표시
  2. 각 주문: orderNumber, createdAt, items(menuName, quantity), totalAmount, status 표시
  3. 상태 뱃지: PENDING=회색, ACCEPTED=파랑, PREPARING=주황, COMPLETED=초록
  4. 무한 스크롤 (page 파라미터 증가, last=true일 때 중단)
  5. 주문 없을 때: "주문 내역이 없습니다" 메시지

---

## 4. 주요 컴포넌트

### CategoryNav
- **Props**: `categories: Category[]`, `selectedCategoryId: number`, `onSelect: (categoryId: number) => void`
- **동작**: 대분류 카테고리 가로 스크롤 탭, 선택 시 onSelect 콜백
- **데이터 매핑**: Category.id, Category.name, Category.displayOrder 순 정렬

### SubCategoryTabs
- **Props**: `subCategories: SubCategory[]`, `selectedSubCategoryId: number`, `onSelect: (subCategoryId: number) => void`
- **동작**: 소분류 카테고리 탭, 선택 시 onSelect 콜백 → 메뉴 목록 재조회 트리거
- **데이터 매핑**: SubCategory.id, SubCategory.name, SubCategory.displayOrder 순 정렬

### MenuCard
- **Props**: `menuItem: MenuItem`, `onAddToCart: (item: MenuItem) => void`, `onDetail: (item: MenuItem) => void`
- **표시 필드**: menuItem.imageUrl (없으면 플레이스홀더), menuItem.name, menuItem.price
- **동작**: 카드 터치 → onDetail (상세 모달), 장바구니 추가 버튼 → onAddToCart
- **크기**: 최소 터치 타겟 44x44px
- **필터**: isAvailable=false인 메뉴는 표시하지 않음

### MenuDetailModal
- **Props**: `menuItem: MenuItem | null`, `isOpen: boolean`, `onClose: () => void`, `onAddToCart: (item: MenuItem) => void`
- **표시 필드**: menuItem.imageUrl, menuItem.name, menuItem.price, menuItem.description
- **동작**: 메뉴 상세 정보 표시, 장바구니 추가 버튼, 닫기 버튼

### CartItem
- **Props**: `cartItem: CartItem`, `onQuantityChange: (menuItemId: number, quantity: number) => void`, `onRemove: (menuItemId: number) => void`
- **표시 필드**: cartItem.menuName, cartItem.price (단가), cartItem.quantity, subtotal (price * quantity)
- **동작**: 수량 +/- 버튼, 삭제 버튼

### CartSummary
- **Props**: `totalAmount: number`, `itemCount: number`, `onOrder: () => void`
- **동작**: 총 금액 표시, 총 아이템 수 표시, "주문하기" 버튼

### CartFloatingButton
- **Props**: `itemCount: number`, `totalAmount: number`
- **위치**: MenuPage 하단 고정
- **동작**: 장바구니 아이템 수 뱃지 표시, 터치 시 CartPage 이동

### OrderStatusBadge
- **Props**: `status: OrderStatus`
- **매핑**:
  - `PENDING` → 회색 뱃지, "대기중"
  - `ACCEPTED` → 파랑 뱃지, "접수"
  - `PREPARING` → 주황 뱃지, "준비중"
  - `COMPLETED` → 초록 뱃지, "완료"

### OrderHistoryItem
- **Props**: `order: Order`
- **표시 필드**: order.orderNumber, order.createdAt, order.items (menuName x quantity), order.totalAmount, order.status (OrderStatusBadge)

---

## 5. 상태 관리 (Custom Hooks)

### useAuth Hook
- **상태**:
  - `accessToken: string | null`
  - `refreshToken: string | null`
  - `storeId: number | null`
  - `tableId: number | null`
  - `isAuthenticated: boolean`
  - `isLoading: boolean`
- **저장소**: localStorage 키: `auth_accessToken`, `auth_refreshToken`, `auth_storeId`, `auth_tableId`
- **기능**:
  - `login(request: TableLoginRequest): Promise<void>` — POST `/api/auth/table/login` 호출, 응답 저장
  - `logout(): Promise<void>` — POST `/api/auth/logout` 호출, localStorage 클리어
  - `refreshAccessToken(): Promise<void>` — POST `/api/auth/refresh` 호출, 새 토큰 저장
  - `initAuth(): void` — 앱 시작 시 localStorage에서 토큰 복원, 유효성 확인
- **자동 갱신 로직**:
  - API 호출 시 401 응답 → refreshToken으로 자동 갱신 시도
  - 갱신 성공 → 새 accessToken으로 원래 요청 재시도
  - 갱신 실패 (TOKEN_EXPIRED, INVALID_TOKEN) → localStorage 클리어 → LoginPage 리다이렉트

### useCart Hook
- **상태**:
  - `cartItems: CartItem[]`
  - `totalAmount: number` (계산값)
  - `itemCount: number` (계산값)
- **저장소**: localStorage 키: `cart_items`
- **기능**:
  - `addItem(menuItem: MenuItem): void` — 이미 있으면 quantity+1, 없으면 새 CartItem 추가 (menuItemId, menuName, price, imageUrl, quantity:1)
  - `removeItem(menuItemId: number): void` — 해당 항목 삭제
  - `updateQuantity(menuItemId: number, quantity: number): void` — quantity 0 이하면 삭제
  - `clearCart(): void` — 전체 비우기
- **계산**:
  - `totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)`
  - `itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)`
- **동기화**: 모든 변경 시 localStorage 즉시 반영

### useMenu Hook
- **상태**:
  - `categories: Category[]`
  - `menuItems: MenuItem[]`
  - `loading: boolean`
  - `error: string | null`
- **기능**:
  - `fetchCategories(): Promise<void>` — GET `/api/stores/{storeId}/categories`, 세션 동안 캐싱
  - `fetchMenuItems(subCategoryId: number): Promise<void>` — GET `/api/stores/{storeId}/menus?subCategoryId={id}`
- **캐싱**: 카테고리 목록은 최초 1회 조회 후 메모리 캐싱 (새로고침 시 재조회)
- **필터**: isAvailable=false 메뉴는 클라이언트에서 필터링

### useOrders Hook
- **상태**:
  - `orders: Order[]`
  - `loading: boolean`
  - `error: string | null`
  - `hasMore: boolean` (무한 스크롤용)
  - `currentPage: number`
- **기능**:
  - `createOrder(items: CreateOrderItemRequest[]): Promise<Order>` — POST `/api/stores/{storeId}/orders`, Request: `{ tableId, items }`
  - `fetchOrders(page?: number): Promise<void>` — GET `/api/stores/{storeId}/orders?tableId={tableId}&page={page}&size=20`
  - `loadMore(): Promise<void>` — 다음 페이지 로드 (currentPage 증가, last=true면 hasMore=false)
- **참고**: TABLE 역할은 서버에서 자동으로 본인 테이블 + 현재 세션 필터링

---

## 6. API 서비스 레이어

### API Client (axios 인스턴스)
```typescript
// baseURL: 환경변수 VITE_API_BASE_URL (예: http://localhost:8080/api)
// 요청 인터셉터: Authorization 헤더 자동 추가
// 응답 인터셉터: 401 시 토큰 갱신 → 재시도 / 실패 시 로그아웃
```

### authService
| 메서드 | API | Request | Response |
|--------|-----|---------|----------|
| `login(req)` | POST `/api/auth/table/login` | `TableLoginRequest` | `ApiResponse<TableLoginResponse>` |
| `refresh(req)` | POST `/api/auth/refresh` | `RefreshTokenRequest` | `ApiResponse<RefreshTokenResponse>` |
| `logout()` | POST `/api/auth/logout` | - | `ApiResponse<{ message: string }>` |

### menuService
| 메서드 | API | Request | Response |
|--------|-----|---------|----------|
| `getCategories(storeId)` | GET `/api/stores/{storeId}/categories` | - | `ApiResponse<Category[]>` |
| `getMenus(storeId, subCategoryId?)` | GET `/api/stores/{storeId}/menus` | Query: `subCategoryId` | `ApiResponse<MenuItem[]>` |
| `getMenuDetail(storeId, menuId)` | GET `/api/stores/{storeId}/menus/{menuId}` | - | `ApiResponse<MenuItem>` |

### orderService
| 메서드 | API | Request | Response |
|--------|-----|---------|----------|
| `createOrder(storeId, req)` | POST `/api/stores/{storeId}/orders` | `CreateOrderRequest` | `ApiResponse<Order>` |
| `getOrders(storeId, params)` | GET `/api/stores/{storeId}/orders` | Query: `tableId, sessionId, page, size` | `ApiResponse<PageResponse<Order>>` |

---

## 7. 에러 처리 매핑

### API 에러 코드 → UI 메시지
| errorCode | HTTP | UI 메시지 | 발생 화면 |
|-----------|------|-----------|-----------|
| `AUTHENTICATION_FAILED` | 401 | "인증 정보가 올바르지 않습니다" | LoginPage |
| `ACCOUNT_LOCKED` | 401 | "로그인 시도가 제한되었습니다 (15분 후 재시도)" | LoginPage |
| `VALIDATION_ERROR` | 400 | 서버 message 그대로 표시 | LoginPage, OrderConfirmPage |
| `TOKEN_EXPIRED` | 401 | 자동 갱신 시도 → 실패 시 LoginPage 리다이렉트 | 전역 |
| `INVALID_TOKEN` | 401 | localStorage 클리어 → LoginPage 리다이렉트 | 전역 |
| `NOT_FOUND` | 404 | "요청한 정보를 찾을 수 없습니다" | MenuPage, OrderConfirmPage |
| `FORBIDDEN` | 403 | "접근 권한이 없습니다" → LoginPage 리다이렉트 | 전역 |
| 네트워크 에러 | - | "네트워크 연결을 확인해주세요" + 재시도 버튼 | 전역 |
| 타임아웃 | - | "서버 응답이 지연되고 있습니다" + 재시도 버튼 | 전역 |

---

## 8. 라우팅 및 인증 가드

### 라우트 정의
| 경로 | 페이지 | 인증 필요 |
|------|--------|-----------|
| `/login` | LoginPage | ❌ |
| `/` | MenuPage | ✅ |
| `/cart` | CartPage | ✅ |
| `/order/confirm` | OrderConfirmPage | ✅ |
| `/order/success` | OrderSuccessPage | ✅ |
| `/orders` | OrderHistoryPage | ✅ |

### 인증 가드 로직
1. 인증 필요 경로 접근 시 localStorage에서 accessToken 확인
2. accessToken 없음 → `/login` 리다이렉트
3. accessToken 있음 → 정상 진입
4. API 호출 중 401 → 토큰 갱신 시도 → 실패 시 `/login` 리다이렉트

---
