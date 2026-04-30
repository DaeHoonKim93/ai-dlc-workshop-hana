# Unit 1: Backend-Core - Tech Stack Decisions

---

## 1. 핵심 기술 스택

| 항목 | 선택 | 버전 | 근거 |
|------|------|------|------|
| **Language** | Java | 17 (LTS) | Spring Boot 3.x 최소 요구, 안정성 우선 |
| **Framework** | Spring Boot | 3.2.x | 안정 버전, 충분한 커뮤니티 지원 |
| **Build Tool** | Gradle | Groovy DSL | 사용자 선호, 멀티모듈 지원 |
| **Database** | H2 | 최신 | 개발/테스트 전용, 프로덕션 전환 시 MySQL/PostgreSQL로 교체 |
| **ORM** | Spring Data JPA | (Spring Boot 연동) | Hibernate 기반, 생산성 높음 |
| **Security** | Spring Security | (Spring Boot 연동) | JWT 인증, RBAC |
| **Test** | JUnit 5 + Mockito | (Spring Boot 연동) | 표준 테스트 프레임워크 |
| **Logging** | SLF4J + Logback | (Spring Boot 기본) | 콘솔/파일 출력 |
| **Container** | Docker Compose | 최신 | 로컬 개발 환경 구성 |

---

## 2. 멀티모듈 구조 (Unit 1 관점)

```
table-order-backend/
+-- common/              # 공통 모듈 (예외, DTO, 유틸)
+-- auth/                # 인증/인가 모듈
+-- store/               # 매장 + 직원 관리 모듈
+-- unit1-app/           # Unit 1 전용 메인 애플리케이션
```

### Unit 1 (unit1-app) 의존 모듈
```
unit1-app
  +-- auth
  +-- store
  +-- common
```

### Unit 2 (unit2-app) 의존 모듈 (참고)
```
unit2-app
  +-- table
  +-- menu
  +-- order
  +-- common
  +-- auth (JWT 검증용)
```

---

## 3. 배포 구조

### Docker Compose 구성
```yaml
# 개념적 구조 (실제 docker-compose.yml은 Code Generation에서 생성)
services:
  unit1:
    build: ./unit1-app
    ports:
      - "8081:8081"
    environment:
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - SPRING_PROFILES_ACTIVE=dev
    networks:
      - table-order-net

  unit2:
    build: ./unit2-app
    ports:
      - "8082:8082"
    environment:
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - SPRING_PROFILES_ACTIVE=dev
    networks:
      - table-order-net

  # Unit 3, 4 (프론트엔드)는 별도 컨테이너

networks:
  table-order-net:
    driver: bridge
```

### URL 구조
| 서비스 | 컨테이너명 | 포트 | Context Path | 예시 |
|--------|-----------|------|-------------|------|
| Unit 1 | unit1 | 8081 | `/unit1` | `http://unit1:8081/unit1/api/auth/admin/login` |
| Unit 2 | unit2 | 8082 | (별도 정의) | `http://unit2:8082/api/stores/{storeId}/orders` |

### 서비스 간 통신
- Docker Compose 내부 네트워크 (`table-order-net`)에서 서비스명으로 통신
- Unit 2 → Unit 1: JWT 검증을 위해 동일한 `JWT_SECRET_KEY` 환경변수 공유
- 프론트엔드 → 백엔드: 서비스명 + 포트로 접근

---

## 4. 주요 의존성 (Gradle)

### common 모듈
```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

### auth 모듈
```groovy
dependencies {
    implementation project(':common')
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6'
}
```

### store 모듈
```groovy
dependencies {
    implementation project(':common')
    implementation project(':auth')
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
}
```

### unit1-app 모듈
```groovy
dependencies {
    implementation project(':common')
    implementation project(':auth')
    implementation project(':store')
    runtimeOnly 'com.h2database:h2'
    
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
}
```

---

## 5. 설정 파일 구조

### application.yml (unit1-app)
```yaml
server:
  port: 8081
  servlet:
    context-path: /unit1

spring:
  datasource:
    url: jdbc:h2:mem:unit1db
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        format_sql: true

jwt:
  secret-key: ${JWT_SECRET_KEY:default-dev-secret-key-min-32-chars!!}
  access-token-expiration: 57600000   # 16시간 (ms)
  refresh-token-expiration: 604800000  # 7일 (ms)

logging:
  level:
    root: INFO
    com.tableorder: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

---

## 6. 결정 사항 요약

| 결정 항목 | 결정 내용 | 비고 |
|-----------|----------|------|
| Java 17 | LTS 안정성 우선 | Virtual Threads 불필요 |
| Spring Boot 3.2.x | 안정 버전 | 3.3+ 신기능 불필요 |
| H2 DB | 개발/테스트 전용 | 프로덕션 전환 시 교체 |
| Gradle Groovy | 사용자 선호 | Kotlin DSL 대비 학습 비용 낮음 |
| 별도 JAR 배포 | Unit 1, 2 분리 | Docker Compose 네트워크 통신 |
| Context Path `/unit1` | URL 구분 | 프론트엔드에서 라우팅 용이 |
| CORS 전체 허용 | POC 단계 | 프로덕션 전환 시 제한 필요 |
| MFA 미지원 | MVP 범위 외 | 추후 TOTP 도입 예정 |
| 환경변수 키 관리 | 단순성 우선 | Secrets Manager는 추후 |
