# Unit 2: Backend-Domain - 기술 스택 세부 결정

---

## 1. 핵심 프레임워크

| 기술 | 버전 | 용도 |
|------|------|------|
| Java | 17 (LTS) | 런타임 |
| Spring Boot | 3.2.x | 애플리케이션 프레임워크 |
| Spring Web | 3.2.x | REST API |
| Spring Data JPA | 3.2.x | 데이터 접근 |
| Spring Security | 6.2.x | 인증/인가 (Unit 1 연동) |
| Spring Validation | 3.2.x | Bean Validation |

---

## 2. 데이터베이스

| 기술 | 버전 | 용도 |
|------|------|------|
| PostgreSQL | 15.x | 메인 데이터베이스 |
| HikariCP | (Spring Boot 내장) | 커넥션 풀 |
| Flyway | 9.x | DB 마이그레이션 |

### HikariCP 설정
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 600000
      connection-timeout: 30000
```

### 주요 인덱스
| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| store_table | (store_id, table_number) UNIQUE | 테이블 번호 조회 |
| table_session | (table_id, is_active) | 활성 세션 조회 |
| category | (store_id, display_order) | 카테고리 정렬 조회 |
| sub_category | (category_id, display_order) | 소분류 정렬 조회 |
| menu_item | (sub_category_id, display_order) | 메뉴 정렬 조회 |
| menu_item | (store_id, is_available) | 매장별 판매 가능 메뉴 |
| orders | (store_id, status) | 매장별 상태 필터 |
| orders | (table_id, session_id) | 테이블/세션별 주문 |
| order_item | (order_id) | 주문별 항목 |
| order_history | (table_id, ordered_at) | 과거 내역 조회 |
| order_history | (store_id, completed_at) | 날짜 필터 |

---

## 3. AWS 서비스

| 서비스 | 용도 | 설정 |
|--------|------|------|
| S3 | 메뉴 이미지 저장 | 퍼블릭 읽기, 서버에서만 쓰기 |

### S3 설정
- **버킷 구조**: `{bucket}/stores/{storeId}/menus/{uuid}.{ext}`
- **접근 방식**: 퍼블릭 URL 직접 접근
- **버킷 정책**: 퍼블릭 읽기 허용, 쓰기는 IAM 역할로 제한

---

## 4. 라이브러리

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Lombok | 1.18.x | 보일러플레이트 코드 감소 |
| MapStruct | 1.5.x | Entity ↔ DTO 매핑 |
| Jackson | (Spring Boot 내장) | JSON 직렬화/역직렬화 |
| AWS SDK v2 (S3) | 2.25.x | S3 이미지 업로드 |
| SLF4J + Logback | (Spring Boot 내장) | 로깅 |

---

## 5. 테스트

| 기술 | 버전 | 용도 |
|------|------|------|
| JUnit 5 | (Spring Boot 내장) | 단위 테스트 |
| Mockito | (Spring Boot 내장) | 모킹 |
| Spring Boot Test | 3.2.x | 통합 테스트 |
| H2 Database | (테스트용) | 인메모리 DB 테스트 |
| Testcontainers | 1.19.x | PostgreSQL 통합 테스트 |

---

## 6. 빌드

| 기술 | 버전 | 용도 |
|------|------|------|
| Gradle | 8.x | 빌드 도구 |
| Gradle Multi-Module | - | 모듈 분리 |

---

## 7. SSE 구현 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| 구현 방식 | Spring SseEmitter | Spring 내장, 추가 의존성 없음 |
| 연결 관리 | ConcurrentHashMap (인메모리) | 동시 1~5명 소규모, 단일 인스턴스 충분 |
| 타임아웃 | 30분 | 장시간 대시보드 유지 |
| Heartbeat | 30초 간격 | 연결 상태 확인 |
| 재연결 | 클라이언트 측 EventSource 자동 재연결 | 브라우저 내장 기능 |

---

## 8. 주문 번호 생성 전략

| 항목 | 결정 | 근거 |
|------|------|------|
| 형식 | yyyyMMdd-HHmmss-XXXX | 날짜+시간+랜덤 4자리 |
| 유니크 보장 | DB UNIQUE 제약 + 충돌 시 재생성 | 단순하고 안정적 |
| 랜덤 부분 | 영대문자 + 숫자 (36^4 = 1,679,616 조합) | 동일 초 내 충돌 확률 극히 낮음 |

---
