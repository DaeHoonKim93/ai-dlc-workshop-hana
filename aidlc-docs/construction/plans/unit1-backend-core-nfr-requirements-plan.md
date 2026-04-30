# NFR Requirements Plan - Unit 1: Backend-Core

## 개요
Unit 1 (Backend-Core: 인증/인가 + 직원 관리)의 비기능 요구사항을 정의하고 기술 스택을 결정합니다.

---

## 실행 계획

- [x] Step 1: Functional Design 분석
- [x] Step 2: NFR 질문 수집 및 답변
- [x] Step 3: NFR Requirements 문서 생성
- [x] Step 4: Tech Stack Decisions 문서 생성
- [ ] Step 5: 승인 및 상태 업데이트

---

## NFR 질문

아래 각 질문의 `[Answer]:` 태그 뒤에 답변을 작성해 주세요.

---

### Q1. 기술 스택 - Java 버전
Unit 1 Backend에 사용할 Java 버전은?

A) Java 17 (LTS, Spring Boot 3.x 최소 요구)
B) Java 21 (LTS, 최신 안정 버전, Virtual Threads 지원)
C) 기타

[Answer]: A

---

### Q2. 기술 스택 - Spring Boot 버전
Spring Boot 버전 선호도는?

A) Spring Boot 3.2.x (안정 버전)
B) Spring Boot 3.3.x (최신 안정)
C) Spring Boot 3.4.x (최신)
D) 기타

[Answer]: A

---

### Q3. 기술 스택 - 데이터베이스
사용할 RDBMS는?

A) MySQL 8.x
B) PostgreSQL 15+
C) H2 (개발/테스트 전용, 프로덕션은 별도)
D) MariaDB
E) 기타

[Answer]: C

---

### Q4. 기술 스택 - 빌드 도구
빌드 도구 선호도는?

A) Gradle (Kotlin DSL)
B) Gradle (Groovy DSL)
C) Maven
D) 기타

[Answer]: B

---

### Q5. 성능 - 로그인 API 응답 시간
관리자/태블릿 로그인 API의 목표 응답 시간은?

A) 500ms 이내 (일반적)
B) 200ms 이내 (빠른 응답)
C) 1초 이내 (여유 있게)
D) 특별한 요구 없음

[Answer]: A

---

### Q6. 성능 - 동시 접속자 수
단일 매장 기준 예상 최대 동시 접속자 수는? (관리자 + 태블릿 합산)

A) 10명 이하 (소규모 매장)
B) 10~50명 (중규모)
C) 50~100명 (대규모)
D) 100명 이상

[Answer]: D

---

### Q7. 보안 - MFA (다중 인증)
관리자 계정에 MFA를 지원할 예정인가요? (SECURITY-12 관련)

A) MVP에서는 미지원, 추후 도입
B) MVP부터 TOTP 기반 MFA 지원
C) 기타

[Answer]:A

---

### Q8. 보안 - CORS 허용 Origin
CORS에서 허용할 Origin 정책은?

A) 특정 도메인만 허용 (프론트엔드 배포 도메인)
B) 개발 단계에서는 localhost 허용, 프로덕션에서 특정 도메인만
C) 기타

[Answer]: A-POC라서 전체허용

---

### Q9. 보안 - Rate Limiting
로그인 API 외에 추가적인 Rate Limiting이 필요한 엔드포인트가 있나요? (SECURITY-11 관련)

A) 로그인 API만 (이미 brute-force 방지 있음)
B) 모든 public API에 기본 Rate Limiting 적용
C) 기타

[Answer]: A

---

### Q10. 가용성 - 서버 구성
MVP 단계에서의 서버 구성은?

A) 단일 인스턴스 (MVP 충분)
B) 이중화 (Active-Standby)
C) 아직 미정, 코드 레벨에서만 준비

[Answer]: A. UNITB하고는 별도 vm으로 뜸

---

### Q11. 로깅 - 로깅 프레임워크
로깅 프레임워크 및 출력 방식은? (SECURITY-03 관련)

A) SLF4J + Logback (Spring Boot 기본, 콘솔/파일 출력)
B) SLF4J + Logback + JSON 포맷 (구조화 로깅)
C) 기타

[Answer]: A

---

### Q12. 테스트 - 테스트 프레임워크
단위 테스트 프레임워크 선호도는?

A) JUnit 5 + Mockito (표준)
B) JUnit 5 + Mockito + Testcontainers (통합 테스트 포함)
C) 기타

[Answer]: A

---

### Q13. 기술 스택 - ORM / 데이터 접근
데이터 접근 기술 선호도는?

A) Spring Data JPA (Hibernate)
B) MyBatis
C) jOOQ
D) 기타

[Answer]: A

---

### Q14. 보안 - JWT 비밀키 관리
JWT 서명 비밀키 관리 방식은?

A) 환경변수로 관리 (application.yml에서 참조)
B) AWS Secrets Manager / Parameter Store
C) Vault (HashiCorp)
D) 기타

[Answer]: A

---

### Q15. 배포 - 컨테이너화
Docker 컨테이너화 여부는?

A) Docker 사용 (Dockerfile 포함)
B) Docker 미사용 (JAR 직접 실행)
C) Docker Compose로 로컬 개발 환경만
D) 기타

[Answer]: C

---
