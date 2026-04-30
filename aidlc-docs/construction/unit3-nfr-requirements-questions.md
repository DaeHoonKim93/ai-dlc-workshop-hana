# Unit 3: Frontend-Customer - NFR Requirements 질문

아래 질문에 답변해주세요. 각 질문의 선택지 중 하나를 `[Answer]:` 태그 뒤에 기입해주세요.
해당하는 선택지가 없으면 마지막 옵션(Other)을 선택하고 설명을 추가해주세요.

---

## Question 1
프론트엔드 빌드 도구로 무엇을 사용하시겠습니까?

A) Vite (빠른 HMR, ESM 기반, React 공식 권장)
B) Create React App (CRA)
C) Next.js (SSR/SSG 지원)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2
상태 관리 라이브러리를 사용하시겠습니까? (현재 설계는 Custom Hooks + localStorage 기반)

A) Custom Hooks만 사용 (현재 설계 유지, 추가 라이브러리 없음)
B) Zustand (경량 상태 관리, 보일러플레이트 최소)
C) Redux Toolkit (대규모 상태 관리, DevTools 지원)
D) Jotai / Recoil (Atomic 상태 관리)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3
HTTP 클라이언트로 무엇을 사용하시겠습니까?

A) Axios (인터셉터, 자동 JSON 변환, 요청 취소 지원)
B) Fetch API (브라우저 내장, 추가 의존성 없음)
C) Ky (Fetch 기반 경량 래퍼)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 4
CSS/스타일링 방식으로 무엇을 사용하시겠습니까?

A) Tailwind CSS (유틸리티 퍼스트, 빠른 프로토타이핑)
B) CSS Modules (스코프드 CSS, 별도 라이브러리 불필요)
C) Styled-components (CSS-in-JS, 동적 스타일링)
D) Emotion (CSS-in-JS, 성능 최적화)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 5
UI 컴포넌트 라이브러리를 사용하시겠습니까?

A) 사용하지 않음 (커스텀 컴포넌트 직접 구현)
B) Ant Design (풍부한 컴포넌트, 한국어 지원)
C) Material UI (MUI) (Google Material Design 기반)
D) Chakra UI (접근성 우선, 커스터마이징 용이)
E) shadcn/ui (Radix + Tailwind 기반, 복사-붙여넣기 방식)
F) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 6
테스트 프레임워크로 무엇을 사용하시겠습니까?

A) Vitest + React Testing Library (Vite 네이티브, 빠른 실행)
B) Jest + React Testing Library (가장 널리 사용)
C) Vitest + React Testing Library + Playwright (E2E 포함)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 7
태블릿 화면 최적화 기준 해상도는 어떻게 설정하시겠습니까?

A) iPad 기준 (768x1024px ~ 1024x1366px)
B) Android 태블릿 기준 (800x1280px ~ 1200x1920px)
C) 범용 태블릿 (768px 이상 반응형, 특정 기기 미지정)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 8
이미지 로딩 최적화 전략은 어떻게 하시겠습니까? (메뉴 이미지가 핵심 콘텐츠)

A) Lazy Loading + 플레이스홀더 (뷰포트 진입 시 로드)
B) Lazy Loading + 블러 썸네일 (저해상도 미리보기 후 고해상도 전환)
C) 전체 프리로드 (카테고리 선택 시 해당 카테고리 이미지 일괄 로드)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 9
오프라인/네트워크 불안정 상황에 대한 대응 수준은 어떻게 하시겠습니까?

A) 기본 에러 표시만 (네트워크 에러 메시지 + 재시도 버튼)
B) 에러 표시 + 장바구니 오프라인 유지 (localStorage 기반, 네트워크 복구 시 주문 가능)
C) Service Worker 기반 오프라인 지원 (메뉴 캐싱, 오프라인 브라우징 가능)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 10
다국어(i18n) 지원이 필요합니까?

A) 한국어 단일 언어 (다국어 불필요)
B) 한국어 + 영어 (2개 언어)
C) 다국어 프레임워크 구조만 준비 (실제 번역은 추후)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 11
접근성(Accessibility) 준수 수준은 어떻게 하시겠습니까?

A) WCAG 2.1 AA 수준 (시맨틱 HTML, ARIA, 키보드 네비게이션, 색상 대비)
B) 기본 수준 (시맨틱 HTML + 최소 터치 타겟 44x44px만)
C) WCAG 2.1 AAA 수준 (최고 수준 접근성)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 12
프론트엔드 에러 모니터링/로깅 도구를 사용하시겠습니까?

A) 사용하지 않음 (콘솔 로그 + API 에러 핸들링만)
B) Sentry (에러 트래킹, 성능 모니터링)
C) 커스텀 에러 로깅 (API 서버로 에러 리포트 전송)
D) Other (please describe after [Answer]: tag below)

[Answer]: 

---
