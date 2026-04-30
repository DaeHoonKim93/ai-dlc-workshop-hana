# Unit 3: Frontend-Customer - 기술 스택 결정사항

> **변경 사유**: Unit 4 (admin-web)와 기술 스택 통일. 같은 팀 유지보수 시 코드 리뷰 효율, 공통 유틸/타입 공유, 온보딩 비용 감소를 위해 Unit 4의 기존 스택에 맞춤.

---

## 1. 핵심 기술 스택

| 영역 | 기술 | 버전 | 선택 근거 |
|------|------|------|-----------|
| **빌드 도구** | Vite | 6.x | Unit4 통일, 빠른 HMR, ESM 기반 |
| **언어** | TypeScript | 5.x | 타입 안전성, IDE 지원, 런타임 에러 사전 방지 |
| **프레임워크** | React | 18.x | Unit4 통일, SPA 구조 |
| **라우팅** | react-router-dom | 6.x | Unit4 통일, SPA 클라이언트 라우팅 |
| **상태 관리** | Custom Hooks + localStorage | - | Unit4 통일, 추가 라이브러리 없이 훅 기반 상태 관리 |
| **HTTP 클라이언트** | Axios | 1.x | Unit4 통일, 인터셉터(토큰 자동 갱신), 자동 JSON 변환, 타임아웃 |
| **스타일링** | CSS Modules | - | Unit4 통일, 스코프드 CSS, 추가 의존성 없음 |
| **UI 컴포넌트** | 커스텀 컴포넌트 | - | Unit4 통일, 직접 구현, 외부 라이브러리 미사용 |
| **다국어** | react-i18next | 14.x | 한국어 + 영어 지원, React 생태계 표준 i18n |
| **테스트** | Jest + React Testing Library | Jest 29.x, RTL 14.x | 가장 널리 사용, 풍부한 생태계 |

---

## 2. 프로젝트 구조

> Unit 4 (admin-web)의 디렉토리 구조와 동일한 패턴을 따릅니다.

```
customer-web/
├── eslint.config.js
├── index.html                    # Vite 엔트리 HTML
├── package.json
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx                   # 루트 컴포넌트 (Provider 래핑)
│   ├── main.tsx                  # Vite 엔트리포인트
│   ├── vite-env.d.ts
│   ├── api/                      # API 서비스 레이어
│   │   ├── client.ts             # Axios 인스턴스 + 인터셉터
│   │   ├── auth.api.ts           # 태블릿 로그인, 토큰 갱신, 로그아웃
│   │   ├── menu.api.ts           # 카테고리 조회, 메뉴 조회
│   │   ├── order.api.ts          # 주문 생성, 주문 목록 조회
│   │   └── index.ts              # API 모듈 re-export
│   ├── components/               # 재사용 UI 컴포넌트
│   │   ├── AuthProvider.tsx      # 인증 컨텍스트 Provider
│   │   ├── ProtectedRoute.tsx    # 인증 가드 라우트
│   │   ├── ErrorBoundary.tsx     # 글로벌 에러 바운더리
│   │   ├── ErrorBoundary.module.css
│   │   ├── LoadingSpinner.tsx    # 로딩 인디케이터
│   │   ├── LoadingSpinner.module.css
│   │   ├── Toast.tsx             # 토스트 알림
│   │   ├── Toast.module.css
│   │   ├── CategoryNav.tsx       # 대분류 카테고리 탭
│   │   ├── CategoryNav.module.css
│   │   ├── SubCategoryTabs.tsx   # 소분류 카테고리 탭
│   │   ├── SubCategoryTabs.module.css
│   │   ├── MenuCard.tsx          # 메뉴 카드
│   │   ├── MenuCard.module.css
│   │   ├── MenuDetailModal.tsx   # 메뉴 상세 모달
│   │   ├── MenuDetailModal.module.css
│   │   ├── CartItem.tsx          # 장바구니 아이템
│   │   ├── CartItem.module.css
│   │   ├── CartSummary.tsx       # 장바구니 요약
│   │   ├── CartSummary.module.css
│   │   ├── CartFloatingButton.tsx # 장바구니 플로팅 버튼
│   │   ├── CartFloatingButton.module.css
│   │   ├── OrderStatusBadge.tsx  # 주문 상태 뱃지
│   │   ├── OrderStatusBadge.module.css
│   │   ├── OrderHistoryItem.tsx  # 주문 내역 아이템
│   │   ├── OrderHistoryItem.module.css
│   │   ├── ConfirmDialog.tsx     # 확인 팝업
│   │   ├── ConfirmDialog.module.css
│   │   └── index.ts              # 컴포넌트 re-export
│   ├── hooks/                    # Custom Hooks
│   │   ├── useAuth.ts            # 인증/세션 관리
│   │   ├── useCart.ts            # 장바구니 상태 (localStorage)
│   │   ├── useMenu.ts           # 메뉴/카테고리 데이터
│   │   ├── useOrders.ts         # 주문 생성/조회
│   │   ├── useToast.ts          # 토스트 알림 관리
│   │   └── index.ts              # 훅 re-export
│   ├── pages/                    # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── LoginPage.module.css
│   │   ├── MenuPage.tsx
│   │   ├── MenuPage.module.css
│   │   ├── CartPage.tsx
│   │   ├── CartPage.module.css
│   │   ├── OrderConfirmPage.tsx
│   │   ├── OrderConfirmPage.module.css
│   │   ├── OrderSuccessPage.tsx
│   │   ├── OrderSuccessPage.module.css
│   │   ├── OrderHistoryPage.tsx
│   │   ├── OrderHistoryPage.module.css
│   │   └── index.ts              # 페이지 re-export
│   ├── routes/                   # 라우팅 설정
│   │   └── AppRoutes.tsx         # react-router-dom 라우트 정의
│   ├── types/                    # TypeScript 타입 정의
│   │   ├── api.ts                # API 공통 타입 (ApiResponse, PageResponse)
│   │   ├── auth.ts               # 인증 관련 타입
│   │   ├── menu.ts               # 메뉴/카테고리 타입
│   │   ├── order.ts              # 주문 타입
│   │   ├── cart.ts               # 장바구니 타입 (클라이언트 전용)
│   │   └── index.ts              # 타입 re-export
│   ├── utils/                    # 유틸리티 함수
│   │   ├── format.ts             # 가격 포맷, 날짜 포맷
│   │   ├── validation.ts         # 입력값 검증
│   │   ├── constants.ts          # 상수 정의
│   │   ├── i18n.ts               # react-i18next 설정
│   │   └── index.ts              # 유틸 re-export
│   ├── locales/                  # 다국어 번역 파일
│   │   ├── ko.json               # 한국어
│   │   └── en.json               # 영어
│   └── styles/                   # 글로벌 스타일
│       └── global.css            # CSS 변수, 리셋, 공통 스타일
├── tsconfig.json
└── vite.config.ts
```

### Unit 4 (admin-web)와의 구조 비교

| 디렉토리 | Unit 3 (customer-web) | Unit 4 (admin-web) | 동일 |
|----------|----------------------|---------------------|------|
| `api/` | client, auth, menu, order | client, auth, menu, order, dashboard, staff, table | ✅ 패턴 동일 |
| `components/` | AuthProvider, ProtectedRoute, Toast 등 | AuthProvider, ProtectedRoute, Toast 등 | ✅ 패턴 동일 |
| `hooks/` | useAuth, useCart, useMenu, useOrders | useAuth | ✅ 패턴 동일 |
| `pages/` | LoginPage, MenuPage 등 | LoginPage 등 | ✅ 패턴 동일 |
| `routes/` | AppRoutes.tsx | AppRoutes.tsx | ✅ 동일 |
| `types/` | api, auth, menu, order, cart | api, auth, menu, order, staff, table 등 | ✅ 패턴 동일 |
| `utils/` | format, validation, constants, i18n | format | ✅ 패턴 동일 |
| `styles/` | global.css | global.css | ✅ 동일 |

---

## 3. 상태 관리 설계 (Custom Hooks + localStorage)

> Redux Toolkit 대신 Unit 4와 동일하게 Custom Hooks 패턴을 사용합니다.
> 장바구니, 인증 등 영속 상태는 localStorage로 관리합니다.

### useAuth Hook
```typescript
// 상태: accessToken, refreshToken, storeId, tableId, isAuthenticated, isLoading
// 저장소: localStorage (auth_accessToken, auth_refreshToken, auth_storeId, auth_tableId)
// 기능: login, logout, refreshAccessToken, initAuth
// Context: AuthProvider를 통해 전역 제공
```

### useCart Hook
```typescript
// 상태: cartItems, totalAmount (계산), itemCount (계산)
// 저장소: localStorage (cart_items)
// 기능: addItem, removeItem, updateQuantity, clearCart
// 계산: totalAmount = sum(quantity * price), itemCount = sum(quantity)
```

### useMenu Hook
```typescript
// 상태: categories, menuItems, selectedCategoryId, selectedSubCategoryId, loading, error
// 캐싱: 카테고리 목록 메모리 캐싱 (세션 동안 유지)
// 기능: fetchCategories, fetchMenuItems(subCategoryId)
```

### useOrders Hook
```typescript
// 상태: orders, currentPage, hasMore, loading, submitting, error
// 기능: createOrder, fetchOrders, loadMore
// submitting 플래그로 중복 주문 방지
```

### useToast Hook
```typescript
// 상태: toasts (메시지 배열)
// 기능: showToast(message, type), removeToast(id)
// 자동 제거: 3초 후 자동 사라짐
```

---

## 4. Axios 인터셉터 설계

> Unit 4의 `api/client.ts` 패턴과 동일하게 구성합니다.

### 요청 인터셉터
```
모든 요청 → localStorage에서 accessToken 읽기 → Authorization: Bearer {accessToken} 헤더 추가
```

### 응답 인터셉터
```
401 응답 수신
  → refreshToken 존재?
    → Yes → POST /api/auth/refresh 호출
      → 성공 → 새 토큰 localStorage 저장 → 원래 요청 재시도
      → 실패 → localStorage 클리어 → /login 리다이렉트
    → No → localStorage 클리어 → /login 리다이렉트
```

### 타임아웃 설정
- 기본 타임아웃: **10초**
- 주문 생성 API: **15초** (서버 처리 시간 고려)

---

## 5. 라우팅 설계 (react-router-dom)

```typescript
// src/routes/AppRoutes.tsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order/confirm" element={<OrderConfirmPage />} />
      <Route path="/order/success" element={<OrderSuccessPage />} />
      <Route path="/orders" element={<OrderHistoryPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### ProtectedRoute
- localStorage에서 accessToken 확인
- 없으면 `/login`으로 `<Navigate>` 리다이렉트
- Unit 4의 `ProtectedRoute.tsx`와 동일 패턴

---

## 6. CSS Modules 스타일링 전략

### 컨벤션 (Unit 4 통일)
- 각 컴포넌트마다 `ComponentName.module.css` 파일 생성
- CSS 변수는 `styles/global.css`에서 정의
- 클래스명: camelCase (`styles.menuCard`, `styles.cartItem`)

### 글로벌 CSS 변수
```css
/* src/styles/global.css */
:root {
  /* 색상 */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
  --color-gray: #8c8c8c;

  /* 주문 상태 색상 */
  --status-pending: #8c8c8c;
  --status-accepted: #1890ff;
  --status-preparing: #faad14;
  --status-completed: #52c41a;

  /* 터치 타겟 */
  --min-touch-target: 44px;

  /* 간격 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 폰트 */
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;

  /* 반응형 */
  --tablet-min-width: 768px;
}
```

---

## 7. 다국어 설정 (react-i18next)

### 설정 파일
```typescript
// src/utils/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from '../locales/ko.json';
import en from '../locales/en.json';

i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: localStorage.getItem('language') || 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});
```

### 번역 파일 구조
```json
// src/locales/ko.json
{
  "login": {
    "title": "태블릿 설정",
    "storeCode": "매장 코드",
    "tableNumber": "테이블 번호",
    "password": "비밀번호",
    "submit": "로그인"
  },
  "menu": {
    "empty": "등록된 메뉴가 없습니다",
    "addToCart": "장바구니 추가"
  },
  "cart": {
    "title": "장바구니",
    "empty": "장바구니가 비어있습니다",
    "order": "주문하기",
    "total": "총 금액"
  }
  // ...
}
```

---

## 8. 테스트 전략

### Jest 설정
- `jest-environment-jsdom` (브라우저 환경 시뮬레이션)
- Axios mock: `jest.mock()` 또는 `msw`
- CSS Modules mock: `identity-obj-proxy`

### 테스트 범위
| 대상 | 테스트 유형 | 도구 |
|------|------------|------|
| Custom Hooks | 훅 동작 + localStorage 연동 테스트 | `@testing-library/react` renderHook |
| API Services | API 호출 + 에러 핸들링 + 인터셉터 테스트 | Jest + Axios mock |
| 컴포넌트 | 렌더링 + 인터랙션 테스트 | React Testing Library |
| 페이지 | 주요 플로우 통합 테스트 | React Testing Library |
| 유틸리티 | 순수 함수 테스트 | Jest |

---

## 9. 의존성 목록 (pinned versions)

### dependencies
```json
{
  "react": "18.3.x",
  "react-dom": "18.3.x",
  "react-router-dom": "6.23.x",
  "axios": "1.7.x",
  "i18next": "23.11.x",
  "react-i18next": "14.1.x",
  "typescript": "5.4.x"
}
```

### devDependencies
```json
{
  "@types/react": "18.3.x",
  "@types/react-dom": "18.3.x",
  "@vitejs/plugin-react": "4.3.x",
  "vite": "6.x",
  "jest": "29.7.x",
  "@testing-library/react": "14.2.x",
  "@testing-library/jest-dom": "6.4.x",
  "@testing-library/user-event": "14.5.x",
  "jest-environment-jsdom": "29.7.x",
  "ts-jest": "29.1.x",
  "identity-obj-proxy": "3.0.x",
  "eslint": "9.x",
  "prettier": "3.2.x"
}
```

---
