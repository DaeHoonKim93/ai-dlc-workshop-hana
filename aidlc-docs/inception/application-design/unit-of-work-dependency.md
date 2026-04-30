# 테이블오더 서비스 - Unit of Work 의존성

---

## 유닛 간 의존성 매트릭스

```
                Unit 1        Unit 2        Unit 3        Unit 4
                BE-Core       BE-Domain     FE-Customer   FE-Admin
Unit 1           -             -             -             -
Unit 2          YES            -             -             -
Unit 3          YES           YES            -             -
Unit 4          YES           YES            -             -
```

**읽는 방법**: 행이 열에 의존 (예: Unit 2는 Unit 1에 의존)

---

## 상세 의존성

### Unit 2 → Unit 1 (Backend-Domain → Backend-Core)
| 의존 항목 | 의존 이유 | 차단 여부 |
|-----------|-----------|-----------|
| common 모듈 | 공통 예외, DTO, 유틸리티 | **부분 차단** — common 완성 후 시작 가능 |
| auth 모듈 | Security 필터, 역할 기반 접근 제어 | **부분 차단** — auth 인터페이스 정의 후 시작 가능 |
| Store 엔티티 | 테이블/메뉴/주문이 매장에 소속 | **비차단** — 인터페이스만 참조 |

**완화 전략**: Unit 1이 common + auth 인터페이스를 먼저 구현하면, Unit 2는 1~2일 후 병렬 시작 가능

### Unit 3 → Unit 1, Unit 2 (FE-Customer → Backend)
| 의존 항목 | 의존 이유 | 차단 여부 |
|-----------|-----------|-----------|
| Auth API | 태블릿 로그인 | **비차단** — Mock API로 개발 가능 |
| Menu API | 메뉴 조회 | **비차단** — Mock API로 개발 가능 |
| Order API | 주문 생성/조회 | **비차단** — Mock API로 개발 가능 |

**완화 전략**: API 설계서 기반 Mock API로 동시 개발. 실제 연동은 Backend API 완성 후.

### Unit 4 → Unit 1, Unit 2 (FE-Admin → Backend)
| 의존 항목 | 의존 이유 | 차단 여부 |
|-----------|-----------|-----------|
| Auth API | 관리자 로그인, 역할 기반 접근 | **비차단** — Mock API로 개발 가능 |
| Order API + SSE | 실시간 주문 모니터링 | **비차단** — Mock SSE로 개발 가능 |
| Table API | 테이블 관리 | **비차단** — Mock API로 개발 가능 |
| Menu API | 메뉴 관리 | **비차단** — Mock API로 개발 가능 |
| Staff API | 직원 관리 | **비차단** — Mock API로 개발 가능 |

**완화 전략**: API 설계서 기반 Mock API로 동시 개발. SSE는 Mock EventSource로 시뮬레이션.

---

## 동시 개발 가능성 요약

| 유닛 | 즉시 시작 | 의존성 해소 후 연동 |
|------|:---------:|:------------------:|
| Unit 1 (BE-Core) | ✅ | - |
| Unit 2 (BE-Domain) | ⚠️ 1~2일 후 | Unit 1 common+auth 인터페이스 |
| Unit 3 (FE-Customer) | ✅ (Mock API) | Unit 1+2 API 완성 후 |
| Unit 4 (FE-Admin) | ✅ (Mock API) | Unit 1+2 API 완성 후 |

---

## 통합 포인트

| 통합 시점 | 관련 유닛 | 검증 항목 |
|-----------|-----------|-----------|
| BE 모듈 통합 | Unit 1 + Unit 2 | 모듈 간 의존성, Security 필터 동작 |
| FE-Customer API 연동 | Unit 3 + Unit 1,2 | 인증, 메뉴 조회, 주문 생성 |
| FE-Admin API 연동 | Unit 4 + Unit 1,2 | 인증, 대시보드, SSE 실시간 |
| 전체 통합 | All | E2E 시나리오 (주문 → 모니터링 → 상태 변경 → 이용 완료) |

---
