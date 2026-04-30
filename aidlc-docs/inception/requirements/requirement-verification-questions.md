# 테이블오더 서비스 - 요구사항 명확화 질문

제공해주신 요구사항 문서를 분석한 결과, 아래 질문들에 대한 답변이 필요합니다.
각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.

---

## Question 1
프로젝트의 개발 언어 및 프레임워크를 어떻게 구성하시겠습니까?

**Backend:**
A) Java + Spring Boot
B) TypeScript + NestJS
C) TypeScript + Express.js
D) Python + FastAPI
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
**Frontend** 프레임워크는 무엇을 사용하시겠습니까?

A) React (TypeScript)
B) Vue.js (TypeScript)
C) Next.js (React 기반 풀스택)
D) Nuxt.js (Vue 기반 풀스택)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
데이터베이스는 어떤 것을 사용하시겠습니까?

A) PostgreSQL
B) MySQL / MariaDB
C) MongoDB
D) SQLite (개발/프로토타입용)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
매장(Store)은 단일 매장만 지원하면 되나요, 아니면 멀티 매장(다수의 매장이 하나의 시스템을 공유)을 지원해야 하나요?

A) 단일 매장 전용 (하나의 배포 = 하나의 매장)
B) 멀티 매장 지원 (하나의 시스템에서 여러 매장 관리)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
배포 환경은 어떻게 계획하고 계신가요?

A) 로컬 개발 환경만 (Docker Compose 등)
B) 클라우드 배포 (AWS, GCP, Azure)
C) 자체 서버 (On-premise)
D) 로컬 개발 우선, 추후 클라우드 배포 고려
E) Other (please describe after [Answer]: tag below)

[Answer]: B - AWS 로 계획중이야

---

## Question 6
관리자 계정 관리는 어떻게 하시겠습니까?

A) 매장당 1개의 관리자 계정 (고정)
B) 매장당 다수의 관리자 계정 (역할 구분 없음)
C) 매장당 다수의 관리자 계정 (역할별 권한 구분: 매니저, 직원 등)
D) Other (please describe after [Answer]: tag below)

[Answer]: C 

---

## Question 7
메뉴 이미지 관리는 어떻게 하시겠습니까?

A) 외부 이미지 URL만 지원 (직접 업로드 없음)
B) 서버에 직접 이미지 업로드 지원
C) 클라우드 스토리지(S3 등)에 이미지 업로드 지원
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 8
테이블 수는 매장당 최대 몇 개 정도를 예상하시나요? (성능 설계 기준)

A) 소규모: 1~10개
B) 중규모: 11~30개
C) 대규모: 31~50개
D) 초대규모: 50개 이상
E) Other (please describe after [Answer]: tag below)

[Answer]: E - 테이블은 100개가 넘을 예정이야

---

## Question 9
동시 주문 처리량은 어느 정도를 예상하시나요? (피크 시간 기준)

A) 낮음: 분당 10건 이하
B) 중간: 분당 10~50건
C) 높음: 분당 50~100건
D) 매우 높음: 분당 100건 이상
E) Other (please describe after [Answer]: tag below)

[Answer]: E - 분당 500건 이상

---

## Question 10
고객용 인터페이스의 접근 방식은 어떻게 하시겠습니까?

A) 태블릿 전용 웹앱 (고정 URL 접속)
B) QR코드 스캔으로 접속하는 모바일 웹
C) 태블릿 전용 + QR코드 모바일 웹 모두 지원
D) Other (please describe after [Answer]: tag below)

[Answer]: B 

---

## Question 11
메뉴 카테고리 구조는 어떻게 하시겠습니까?

A) 1단계 카테고리만 (예: 메인, 사이드, 음료)
B) 2단계 카테고리 (예: 음료 > 커피, 음료 > 주스)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 12
주문 상태 관리 흐름은 어떻게 하시겠습니까?

A) 단순 3단계: 대기중 → 준비중 → 완료
B) 확장 4단계: 대기중 → 접수 → 준비중 → 완료
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 13: Security Extensions
이 프로젝트에 보안 확장 규칙(Security Extension Rules)을 적용하시겠습니까?

A) Yes — 모든 SECURITY 규칙을 blocking constraint로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 모든 SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
C) Other (please describe after [Answer]: tag below)

[Answer]: A 

---
