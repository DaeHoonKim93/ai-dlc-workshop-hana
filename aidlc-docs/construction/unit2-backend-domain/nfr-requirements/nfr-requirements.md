# Unit 2: Backend-Domain - NFR Requirements

---

## 1. 성능 (Performance)

### NFR-PERF-01: 주문 처리량
- **목표**: 피크 시간 기준 분당 500건 이상 주문 처리
- **측정**: 주문 생성 API (POST /api/stores/{storeId}/orders) 처리량
- **설계 고려사항**:
  - DB 커넥션 풀 최적화 (HikariCP)
  - 주문 생성 트랜잭션 최소화
  - 인덱스 최적화 (storeId, tableId, sessionId, status)

### NFR-PERF-02: API 응답 시간
- **목표**: 평균 200ms 이내, P95 500ms 이내, P99 1000ms 이내
- **적용 대상**: 모든 REST API 엔드포인트
- **설계 고려사항**:
  - JPA N+1 문제 방지 (fetch join, EntityGraph)
  - 불필요한 데이터 로딩 방지 (DTO Projection)

### NFR-PERF-03: SSE 알림 지연
- **목표**: 주문 이벤트 발생 후 2초 이내 관리자 대시보드 전달
- **동시 연결**: 1~5명 (소규모)
- **설계 고려사항**:
  - SseEmitter 인메모리 관리 (소규모이므로 충분)
  - Heartbeat 30초 간격

### NFR-PERF-04: 메뉴 조회 성능
- **목표**: 카테고리별 메뉴 목록 100ms 이내 응답
- **설계 고려사항**:
  - 카테고리+소분류+메뉴 한 번에 조회 (fetch join)
  - displayOrder 인덱스

### NFR-PERF-05: 대시보드 초기 로딩
- **목표**: 100개+ 테이블 대시보드 데이터 500ms 이내 응답
- **설계 고려사항**:
  - 테이블별 집계 쿼리 최적화
  - latestOrders 서브쿼리 최적화

---

## 2. 보안 (Security)

### NFR-SEC-01: 입력값 검증 (SECURITY-05)
- 모든 API 엔드포인트에서 Bean Validation 적용
- 문자열 최대 길이 제한
- SQL Injection 방지 (JPA parameterized queries)
- XSS 방지 (입력값 이스케이프)

### NFR-SEC-02: 접근 제어 (SECURITY-08)
- 모든 엔드포인트에 Spring Security 인증 필터 적용
- 역할 기반 접근 제어 (@PreAuthorize)
- 매장 격리 (storeId 검증)
- TABLE 역할은 본인 테이블 데이터만 접근

### NFR-SEC-03: 에러 응답 보안 (SECURITY-09)
- 프로덕션 에러 응답에 스택 트레이스 미포함
- 내부 경로/버전 정보 미노출
- 일반적인 에러 메시지만 반환

### NFR-SEC-04: 파일 업로드 보안
- 이미지 파일 형식 화이트리스트 (jpg, jpeg, png, gif, webp)
- 파일 크기 제한 (5MB)
- 파일명 UUID 변환 (원본 파일명 미사용)
- Content-Type 검증

### NFR-SEC-05: CORS 정책 (SECURITY-08)
- 허용 Origin 명시적 설정 (와일드카드 금지)
- 인증된 엔드포인트에 credentials 허용

---

## 3. 확장성 (Scalability)

### NFR-SCALE-01: 수평 확장
- Stateless API 설계 (세션 정보 JWT에 포함)
- SSE 연결은 인스턴스 로컬 (소규모이므로 단일 인스턴스 충분)
- DB 커넥션 풀 설정으로 다중 인스턴스 지원 가능

### NFR-SCALE-02: 데이터 증가 대응
- OrderHistory 무기한 보관 → 인덱스 최적화 필수
- 날짜 기반 조회 인덱스 (orderedAt, completedAt)
- 페이지네이션 필수 적용

---

## 4. 가용성 (Availability)

### NFR-AVAIL-01: 서비스 가용성
- **목표**: 99.9% (월간 다운타임 43분 이내)
- SSE 연결 끊김 시 클라이언트 자동 재연결
- DB 연결 실패 시 재시도 로직

### NFR-AVAIL-02: 장애 격리
- 모듈별 독립적 예외 처리
- SSE 전송 실패가 주문 처리에 영향 없음 (비동기)
- S3 업로드 실패가 메뉴 등록에 영향 없음 (이미지는 optional)

---

## 5. 유지보수성 (Maintainability)

### NFR-MAINT-01: 코드 품질
- 계층형 아키텍처 준수 (Controller → Service → Repository)
- 단위 테스트 커버리지 (Service 레이어 중심)
- Javadoc 주요 클래스/메서드 문서화

### NFR-MAINT-02: 로깅 (SECURITY-03)
- 구조화된 로깅 (SLF4J + Logback)
- 요청 ID (correlation ID) 포함
- 민감 정보 로깅 금지 (비밀번호, 토큰)

### NFR-MAINT-03: 예외 처리 (SECURITY-15)
- GlobalExceptionHandler로 일관된 에러 응답
- 모든 외부 호출(DB, S3)에 명시적 예외 처리
- 리소스 정리 (try-with-resources)

---

## 6. Security Extension 준수 매트릭스

| Rule | 적용 여부 | Unit 2 적용 내용 |
|------|:---------:|-----------------|
| SECURITY-01 | N/A | DB 암호화는 인프라 레벨 (Infrastructure Design에서 다룸) |
| SECURITY-02 | N/A | 네트워크 로깅은 인프라 레벨 |
| SECURITY-03 | ✅ | 구조화된 로깅, correlation ID, 민감 정보 미로깅 |
| SECURITY-04 | N/A | HTTP 헤더는 common 모듈 (Unit 1) |
| SECURITY-05 | ✅ | Bean Validation, parameterized queries, 입력 길이 제한 |
| SECURITY-06 | N/A | IAM 정책은 인프라 레벨 |
| SECURITY-07 | N/A | 네트워크 설정은 인프라 레벨 |
| SECURITY-08 | ✅ | @PreAuthorize, 매장 격리, CORS 설정 |
| SECURITY-09 | ✅ | 에러 응답 스택 트레이스 미포함, 파일 업로드 검증 |
| SECURITY-10 | ✅ | 의존성 버전 고정 (lock file) |
| SECURITY-11 | ✅ | 보안 로직 분리, Rate limiting (향후), 비즈니스 로직 남용 방지 |
| SECURITY-12 | N/A | 인증은 Unit 1 (auth 모듈) |
| SECURITY-13 | ✅ | 안전한 역직렬화 (Jackson), 데이터 변경 감사 로깅 |
| SECURITY-14 | ✅ | 보안 이벤트 로깅 (권한 위반, 접근 거부) |
| SECURITY-15 | ✅ | GlobalExceptionHandler, fail-closed, 리소스 정리 |

---
