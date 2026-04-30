# 테이블오더 서비스 - 컴포넌트 의존성

---

## 1. Backend 모듈 의존성 매트릭스

```
             common  auth  store  table  menu  order  app
common         -      -      -      -      -      -     -
auth          YES     -      -     YES     -      -     -
store         YES    YES     -      -      -      -     -
table         YES     -      -      -      -      -     -
menu          YES     -      -      -      -      -     -
order         YES     -      -     YES     -      -     -
app           YES    YES    YES    YES    YES    YES    -
```

**의존성 방향**: 위 → 아래 (행이 열에 의존)

### 상세 의존성

| 모듈 | 의존 대상 | 의존 이유 |
|------|-----------|-----------|
| auth → common | 공통 예외, DTO, 유틸리티 |
| auth → table | 태블릿 로그인 시 테이블 정보 조회 |
| store → common | 공통 예외, DTO |
| store → auth | 비밀번호 해싱 (직원 계정 생성 시) |
| table → common | 공통 예외, DTO |
| menu → common | 공통 예외, DTO |
| order → common | 공통 예외, DTO |
| order → table | 주문 생성 시 테이블 세션 관리 |
| app → all | 모든 모듈 조립 |

---

## 2. Backend 계층 의존성 (각 모듈 내부)

```
Controller (REST API)
    |
    v
Service (비즈니스 로직)
    |
    v
Repository (데이터 접근)
    |
    v
Entity (JPA 엔티티)
```

**규칙**:
- Controller → Service만 호출 (Repository 직접 호출 금지)
- Service → Repository 호출
- Service → 다른 모듈의 Service 호출 가능 (모듈 간 통신)
- Repository → Entity 매핑

---

## 3. Frontend 의존성

### 3.1 customer-web 데이터 흐름

```
Pages
  |-- useAuth (인증 상태)
  |-- useMenu (메뉴 데이터)
  |-- useCart (장바구니 - 로컬)
  |-- useOrders (주문 내역)
       |
       v
  Services (API 호출)
       |
       v
  Backend REST API
```

### 3.2 admin-web 데이터 흐름

```
Pages
  |-- useAuth (인증 상태)
  |-- useDashboard (대시보드 데이터)
  |-- useSSE (실시간 연결)
  |-- useTableManagement (테이블 관리)
  |-- useMenuManagement (메뉴 관리)
  |-- useOrderManagement (주문 관리)
       |
       v
  Services (API 호출 + SSE)
       |
       v
  Backend REST API + SSE Endpoint
```

---

## 4. 외부 서비스 의존성

```
+-------------------+     +-------------------+
|  Spring Boot App  |---->|   PostgreSQL DB   |
+-------------------+     +-------------------+
         |
         |--------------->+-------------------+
                          |     AWS S3        |
                          | (이미지 저장소)     |
                          +-------------------+

+-------------------+     +-------------------+
|  customer-web     |---->|  Spring Boot App  |
|  (React)          |     |  (REST API)       |
+-------------------+     +-------------------+

+-------------------+     +-------------------+
|  admin-web        |---->|  Spring Boot App  |
|  (React)          |     |  (REST API + SSE) |
+-------------------+     +-------------------+
```

---

## 5. 통신 패턴

| 통신 | 프로토콜 | 방향 | 용도 |
|------|----------|------|------|
| customer-web → Backend | HTTP/REST | 요청-응답 | 메뉴 조회, 주문 생성, 주문 내역 |
| admin-web → Backend | HTTP/REST | 요청-응답 | 관리 기능 (CRUD) |
| Backend → admin-web | SSE | 서버→클라이언트 | 실시간 주문 알림 |
| Backend → PostgreSQL | JDBC | 양방향 | 데이터 영속화 |
| Backend → S3 | AWS SDK | 요청-응답 | 이미지 업로드/삭제 |

---
