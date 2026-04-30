# Unit 3: Frontend-Customer - 비기능 요구사항 (NFR Requirements)

> **스택 통일**: Unit 4 (admin-web)와 동일한 기술 스택 사용
> Vite + React + TypeScript + CSS Modules + react-router-dom + Custom Hooks + Axios

---

## 1. 성능 요구사항

### NFR-FE-01: 페이지 로딩 성능
- 초기 페이지 로드(FCP): **3초 이내** (태블릿 Wi-Fi 환경 기준)
- Vite의 자동 코드 스플리팅 + React.lazy 활용
- 페이지별 동적 import로 초기 번들 크기 최소화

### NFR-FE-02: API 응답 처리
- API 호출 후 UI 반영: **200ms 이내** (서버 응답 수신 후 렌더링까지)
- 로딩 상태 표시: API 호출 시작 즉시 로딩 인디케이터 표시
- 타임아웃: **10초** (10초 초과 시 타임아웃 에러 표시, 주문 생성은 15초)

### NFR-FE-03: 이미지 로딩 최적화
- **Lazy Loading + 플레이스홀더** 전략 적용
- `loading="lazy"` 속성 활용 (브라우저 네이티브 lazy loading)
- 이미지 로드 실패 시 기본 플레이스홀더 이미지 표시
- 뷰포트 진입 시점에 이미지 로드 시작

### NFR-FE-04: 렌더링 성능
- 메뉴 목록 렌더링: 50개 이상 메뉴 카드 렌더링 시 프레임 드롭 없음
- 장바구니 수량 변경: 실시간 총액 재계산 지연 없음
- 불필요한 리렌더링 방지: React.memo, useMemo, useCallback 적절히 활용

---

## 2. 보안 요구사항

### NFR-FE-05: JWT 토큰 관리
- Access Token, Refresh Token을 localStorage에 저장
- Access Token 만료 시 Refresh Token으로 자동 갱신 (Axios 인터셉터)
- Refresh Token 만료/무효 시 localStorage 클리어 → 로그인 페이지 리다이렉트
- 토큰 값을 콘솔 로그에 출력하지 않음

### NFR-FE-06: XSS 방지
- React의 기본 이스케이프 메커니즘 활용 (JSX 자동 이스케이프)
- `dangerouslySetInnerHTML` 사용 금지
- 사용자 입력값 (storeCode, tableNumber, password) 클라이언트 측 검증
- API 응답 데이터를 HTML로 직접 삽입하지 않음

### NFR-FE-07: 입력값 검증
- LoginPage 입력 필드:
  - storeCode: 1~50자, 빈 값 불가
  - tableNumber: 1~20자, 빈 값 불가
  - password: 8자 이상, 빈 값 불가
- 장바구니 수량: 1 이상 정수만 허용
- 모든 검증은 서버 측 검증과 별도로 클라이언트에서도 수행

### NFR-FE-08: HTTPS 통신
- 모든 API 호출은 HTTPS 프로토콜 사용
- 혼합 콘텐츠(Mixed Content) 차단

---

## 3. 사용성 요구사항

### NFR-FE-09: 터치 친화적 UI
- 모든 인터랙티브 요소: 최소 터치 타겟 **44x44px**
- 버튼 간 최소 간격: **8px**
- 스크롤 영역: 터치 스크롤 네이티브 동작 지원

### NFR-FE-10: 태블릿 반응형 디자인
- 기준 해상도: **768px 이상** 반응형 (특정 기기 미지정)
- 최소 지원 너비: 768px
- 최대 지원 너비: 1920px
- 가로/세로 모드 모두 지원
- CSS Modules + CSS 변수로 반응형 구현

### NFR-FE-11: 접근성 (기본 수준)
- 시맨틱 HTML 태그 사용 (`<nav>`, `<main>`, `<button>`, `<form>` 등)
- 최소 터치 타겟 44x44px 준수
- 이미지에 alt 속성 제공
- 폼 요소에 label 연결

### NFR-FE-12: 다국어 지원 (한국어 + 영어)
- i18n 프레임워크: `react-i18next` 사용
- 기본 언어: 한국어
- 지원 언어: 한국어, 영어
- 언어 전환 UI 제공
- 모든 사용자 대면 텍스트는 번역 키로 관리

---

## 4. 안정성 요구사항

### NFR-FE-13: 에러 핸들링
- 글로벌 에러 바운더리: 예상치 못한 렌더링 에러 캐치 → 에러 페이지 표시
- API 에러: errorCode 기반 사용자 친화적 메시지 표시
- 네트워크 에러: "네트워크 연결을 확인해주세요" + 재시도 버튼
- 타임아웃 에러: "서버 응답이 지연되고 있습니다" + 재시도 버튼

### NFR-FE-14: 오프라인 대응
- 네트워크 끊김 감지 시 에러 메시지 표시
- 장바구니 데이터는 localStorage 기반으로 오프라인에서도 유지
- 네트워크 복구 시 정상적으로 주문 가능
- API 호출 실패 시 장바구니 데이터 손실 없음

### NFR-FE-15: 에러 모니터링
- 별도 모니터링 도구 미사용
- 콘솔 로그 + API 에러 핸들링으로 대응
- 프로덕션 빌드에서 console.log 제거 (console.error, console.warn만 유지)

---

## 5. 유지보수성 요구사항

### NFR-FE-16: 코드 구조 (Unit 4 통일)
- Vite + React SPA 구조
- 디렉토리: `api/`, `components/`, `hooks/`, `pages/`, `routes/`, `types/`, `utils/`, `styles/`
- 각 디렉토리에 `index.ts` re-export 파일 (Unit 4 패턴)
- 컴포넌트별 CSS Modules 파일 (`ComponentName.module.css`)

### NFR-FE-17: 코드 품질
- TypeScript strict 모드 활성화
- ESLint + Prettier 설정
- 컴포넌트/훅/서비스에 JSDoc 주석
- 단위 테스트: Jest + React Testing Library

### NFR-FE-18: 테스트 커버리지
- Custom Hooks: 전체 테스트 (useAuth, useCart, useMenu, useOrders, useToast)
- API Services: 전체 테스트 (authService, menuService, orderService)
- 주요 컴포넌트: 렌더링 + 인터랙션 테스트
- 페이지: 주요 플로우 테스트 (로그인, 메뉴 조회, 장바구니, 주문)
- 유틸리티: 순수 함수 테스트 (format, validation)

---
