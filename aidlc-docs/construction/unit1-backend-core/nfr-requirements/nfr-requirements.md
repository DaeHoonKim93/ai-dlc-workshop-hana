# Unit 1: Backend-Core - NFR Requirements

---

## 1. 성능 요구사항

### NFR-PERF-01: 로그인 API 응답 시간
- **목표**: 관리자/태블릿 로그인 API 응답 시간 **500ms 이내** (p95 기준)
- **측정 조건**: bcrypt 해싱 포함, DB 조회 포함
- **참고**: bcrypt strength 10 기준 해싱 시간 약 100~200ms

### NFR-PERF-02: 토큰 검증 응답 시간
- **목표**: JWT 토큰 검증 (JwtAuthenticationFilter) **50ms 이내**
- **측정 조건**: HS256 서명 검증 + 클레임 파싱

### NFR-PERF-03: 직원 관리 API 응답 시간
- **목표**: 직원 CRUD API 응답 시간 **300ms 이내** (p95 기준)

### NFR-PERF-04: 동시 접속자 수
- **목표**: 단일 매장 기준 **100명 이상** 동시 접속 지원
- **구성**: 관리자(MANAGER/STAFF) + 태블릿(TABLE) 합산
- **참고**: Tomcat 기본 스레드 풀 200, 커넥션 풀 적절히 설정

---

## 2. 보안 요구사항

### NFR-SEC-01: 비밀번호 해싱 (SECURITY-12)
- bcrypt 알고리즘, strength 10
- 평문 비밀번호 저장/로깅 절대 금지
- MFA: **MVP에서는 미지원**, 추후 도입 예정 (SECURITY-12 예외 사항으로 문서화)

### NFR-SEC-02: JWT 토큰 보안 (SECURITY-08)
- 서명 알고리즘: HS256
- Access Token 만료: 16시간
- Refresh Token 만료: 7일
- 비밀키: **환경변수**로 관리 (`JWT_SECRET_KEY`), application.yml에서 `${JWT_SECRET_KEY}` 참조
- 모든 요청에서 서버 측 토큰 검증 (서명, 만료, 클레임)

### NFR-SEC-03: Brute-Force 방지 (SECURITY-12)
- 5회 연속 실패 시 15분 계정 잠금
- 로그인 API에만 적용 (SECURITY-11: Rate Limiting은 로그인 API만)

### NFR-SEC-04: CORS 정책 (SECURITY-08)
- **POC 단계**: `Access-Control-Allow-Origin: *` 전체 허용
- **SECURITY-08 예외 사항**: POC/개발 단계 한정, 프로덕션 전환 시 특정 도메인으로 제한 필요
- 허용 메서드: GET, POST, PUT, DELETE, OPTIONS
- 허용 헤더: Authorization, Content-Type
- Credentials: true (쿠키 전송 시)

### NFR-SEC-05: 매장 격리 (SECURITY-08)
- 모든 `/api/stores/{storeId}/**` 요청에서 JWT storeId와 URL storeId 일치 검증
- TABLE 역할은 본인 테이블 데이터만 접근 가능
- 위반 시 403 Forbidden

### NFR-SEC-06: 입력 검증 (SECURITY-05)
- 모든 API 엔드포인트에서 Bean Validation (`@Valid`, `@NotNull`, `@Size` 등) 적용
- 요청 본문 크기 제한: 기본 1MB
- SQL Injection 방지: Spring Data JPA 파라미터 바인딩 사용 (문자열 연결 금지)

### NFR-SEC-07: 에러 처리 (SECURITY-09, SECURITY-15)
- GlobalExceptionHandler로 전역 예외 처리
- 프로덕션 에러 응답에 스택 트레이스, 내부 경로, DB 정보 노출 금지
- 일관된 에러 응답 포맷 (ApiResponse wrapper)
- 인증/인가 실패 시 fail-closed (접근 거부)

### NFR-SEC-08: 하드코딩 금지 (SECURITY-12)
- 소스 코드에 비밀번호, API 키, 시크릿 하드코딩 금지
- 모든 민감 정보는 환경변수 또는 외부 설정으로 관리

---

## 3. 가용성 요구사항

### NFR-AVAIL-01: 서버 구성
- **MVP 단계**: 단일 인스턴스 (Docker 컨테이너)
- Unit 1 (Backend-Core)과 Unit 2 (Backend-Domain)는 **별도 JAR, 별도 컨테이너**로 배포
- 같은 Docker Compose 네트워크에서 서비스명으로 통신

### NFR-AVAIL-02: 배포 구조
- Unit 1 컨테이너: URL prefix `/unit1` (예: `http://unit1:8081/unit1/api/...`)
- Unit 2 컨테이너: 별도 포트/서비스명
- 프론트엔드(Unit 3, 4)는 Docker Compose 네트워크 내에서 서비스명으로 백엔드 접근

### NFR-AVAIL-03: Health Check
- Spring Boot Actuator `/actuator/health` 엔드포인트 활성화
- Docker Compose healthcheck 설정

---

## 4. 로깅 요구사항 (SECURITY-03)

### NFR-LOG-01: 로깅 프레임워크
- SLF4J + Logback (Spring Boot 기본)
- 콘솔 + 파일 출력

### NFR-LOG-02: 로그 포맷
- 포함 항목: timestamp, log level, logger name, correlation/request ID, message
- 민감 데이터 (비밀번호, 토큰, PII) 로깅 금지

### NFR-LOG-03: 보안 이벤트 로깅 (SECURITY-14)
- 로그인 성공/실패 이벤트 로깅
- 계정 잠금 이벤트 로깅
- 권한 위반 (403) 이벤트 로깅
- 토큰 갱신 이벤트 로깅

---

## 5. 테스트 요구사항

### NFR-TEST-01: 단위 테스트
- JUnit 5 + Mockito
- Service 레이어, Security 레이어 단위 테스트 필수
- 목표 커버리지: 주요 비즈니스 로직 80% 이상

### NFR-TEST-02: 통합 테스트
- H2 인메모리 DB를 사용한 Repository 레이어 테스트
- `@SpringBootTest` + `@AutoConfigureMockMvc`로 Controller 통합 테스트

---

## 6. 유지보수성 요구사항

### NFR-MAINT-01: 코드 구조
- Spring Boot 멀티모듈 구조 유지
- Unit 1 전용 app 모듈 (unit1-app) 분리
- 레이어 분리: Controller → Service → Repository

### NFR-MAINT-02: API 문서화
- API 명세서 (이미 작성 완료: api-specification.md)
- Swagger/OpenAPI는 MVP에서 선택사항

---

## 7. Security Extension 준수 요약

| SECURITY Rule | 상태 | 비고 |
|---------------|------|------|
| SECURITY-01 | N/A | 인프라 레벨 (MVP 단계 H2 사용) |
| SECURITY-02 | N/A | 네트워크 인프라 레벨 |
| SECURITY-03 | ✅ 준수 | SLF4J + Logback, 민감 데이터 로깅 금지 |
| SECURITY-04 | N/A | Backend API 서버 (HTML 미제공) |
| SECURITY-05 | ✅ 준수 | Bean Validation, JPA 파라미터 바인딩 |
| SECURITY-06 | N/A | 클라우드 IAM 레벨 (MVP 미적용) |
| SECURITY-07 | N/A | 네트워크 인프라 레벨 |
| SECURITY-08 | ✅ 준수 | JWT 검증, RBAC, 매장 격리, CORS (POC 예외) |
| SECURITY-09 | ✅ 준수 | 에러 처리, 하드코딩 금지 |
| SECURITY-10 | ✅ 준수 | Gradle lock file, 정확한 버전 명시 |
| SECURITY-11 | ✅ 준수 | 보안 모듈 분리, brute-force 방지 |
| SECURITY-12 | ✅ 준수 (예외) | bcrypt, 잠금, 환경변수 키 관리. MFA는 MVP 미지원 |
| SECURITY-13 | N/A | CDN/외부 리소스 미사용 (Backend) |
| SECURITY-14 | ✅ 준수 | 보안 이벤트 로깅 |
| SECURITY-15 | ✅ 준수 | GlobalExceptionHandler, fail-closed |
