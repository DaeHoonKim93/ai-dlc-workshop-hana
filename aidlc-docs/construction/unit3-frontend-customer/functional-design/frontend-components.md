# Unit 3: Frontend-Customer - 프론트엔드 컴포넌트 설계

---

## 1. 페이지 구조

### LoginPage (태블릿 초기 설정)
- **경로**: /login
- **표시 조건**: 로컬 스토리지에 인증 정보 없을 때
- **컴포넌트**: LoginForm (storeCode, tableNumber, password 입력)
- **동작**: 로그인 성공 → 토큰 + 설정 정보 로컬 스토리지 저장 → MenuPage 이동

### MenuPage (메뉴 조회 - 기본 화면)
- **경로**: / (루트)
- **레이아웃**: 상단 CategoryNav + 하단 MenuGrid
- **컴포넌트**: CategoryNav, SubCategoryTabs, MenuCard, MenuDetailModal
- **동작**: 카테고리 선택 → 소분류 표시 → 메뉴 카드 그리드 표시

### CartPage (장바구니)
- **경로**: /cart
- **컴포넌트**: CartItemList, CartItem, CartSummary
- **동작**: 수량 조절, 삭제, 총액 표시, 주문하기 버튼

### OrderConfirmPage (주문 확인)
- **경로**: /order/confirm
- **컴포넌트**: OrderSummary, OrderItemList
- **동작**: 최종 확인 → 주문 확정 버튼 → API 호출

### OrderSuccessPage (주문 성공)
- **경로**: /order/success
- **컴포넌트**: OrderSuccessMessage (주문 번호 표시)
- **동작**: 5초 카운트다운 → 장바구니 비우기 → MenuPage 자동 리다이렉트

### OrderHistoryPage (주문 내역)
- **경로**: /orders
- **컴포넌트**: OrderHistoryList, OrderHistoryItem, OrderStatusBadge
- **동작**: 현재 세션 주문 목록 표시, 상태 뱃지, 무한 스크롤

---

## 2. 주요 컴포넌트

### CategoryNav
- **Props**: categories: Category[], selectedCategoryId: number
- **동작**: 대분류 카테고리 가로 스크롤 탭, 선택 시 onSelect 콜백

### SubCategoryTabs
- **Props**: subCategories: SubCategory[], selectedSubCategoryId: number
- **동작**: 소분류 카테고리 탭, 선택 시 onSelect 콜백

### MenuCard
- **Props**: menuItem: MenuItem
- **동작**: 이미지 + 메뉴명 + 가격 표시, 터치 시 상세 모달, 장바구니 추가 버튼
- **크기**: 최소 터치 타겟 44x44px

### MenuDetailModal
- **Props**: menuItem: MenuItem, isOpen: boolean, onClose: function
- **동작**: 메뉴 상세 정보(설명 포함) 표시, 장바구니 추가 버튼

### CartItem
- **Props**: cartItem: CartItem, onQuantityChange, onRemove
- **동작**: 메뉴명, 단가, 수량 조절(+/-), 소계, 삭제 버튼

### CartSummary
- **Props**: totalAmount: number, itemCount: number
- **동작**: 총 금액 표시, 주문하기 버튼

### OrderStatusBadge
- **Props**: status: OrderStatus
- **동작**: 상태별 색상 뱃지 (대기중=회색, 접수=파랑, 준비중=주황, 완료=초록)

---

## 3. 상태 관리

### useAuth Hook
- **상태**: token, storeId, tableId, isAuthenticated
- **기능**: 자동 로그인, 토큰 갱신, 로그아웃
- **저장소**: localStorage (토큰, 설정 정보)

### useCart Hook
- **상태**: cartItems: CartItem[], totalAmount: number
- **기능**: addItem, removeItem, updateQuantity, clearCart, getItemCount
- **저장소**: localStorage (장바구니 데이터)
- **계산**: totalAmount = sum(각 item의 quantity * price)

### useMenu Hook
- **상태**: categories, menuItems, loading, error
- **기능**: fetchCategories, fetchMenuItems(subCategoryId)
- **캐싱**: 카테고리 목록은 세션 동안 캐싱

### useOrders Hook
- **상태**: orders, loading, error
- **기능**: fetchOrders(sessionId), createOrder(items)

---

## 4. API 연동

| Hook | API 엔드포인트 | 용도 |
|------|---------------|------|
| useAuth | POST /api/auth/table/login | 태블릿 로그인 |
| useAuth | POST /api/auth/refresh | 토큰 갱신 |
| useMenu | GET /api/stores/{storeId}/categories | 카테고리 목록 |
| useMenu | GET /api/stores/{storeId}/menus?subCategoryId=X | 메뉴 목록 |
| useOrders | POST /api/stores/{storeId}/orders | 주문 생성 |
| useOrders | GET /api/stores/{storeId}/orders?tableId=X&sessionId=Y | 주문 내역 |

---
