# Integration Test Instructions - Unit 2: Backend-Domain

## 목적
모듈 간 상호작용과 실제 DB 연동을 검증합니다.

## 환경 설정

### 1. PostgreSQL 시작

```bash
docker run -d \
  --name tableorder-db-test \
  -e POSTGRES_DB=tableorder_test \
  -e POSTGRES_USER=tableorder \
  -e POSTGRES_PASSWORD=tableorder \
  -p 5433:5432 \
  postgres:15
```

### 2. 테스트 환경 변수

```bash
export DB_HOST=localhost
export DB_PORT=5433
export DB_NAME=tableorder_test
export DB_USERNAME=tableorder
export DB_PASSWORD=tableorder
```

## 통합 테스트 시나리오

### Scenario 1: 주문 생성 → SSE 알림 플로우
1. 테이블 등록 (POST /api/stores/1/tables)
2. SSE 구독 (GET /api/stores/1/orders/subscribe)
3. 카테고리/메뉴 등록
4. 주문 생성 (POST /api/stores/1/orders)
5. **검증**: SSE로 NEW_ORDER 이벤트 수신 확인
6. **검증**: 테이블 세션 자동 생성 확인

### Scenario 2: 주문 상태 변경 플로우
1. 주문 생성 (PENDING)
2. 상태 변경: PENDING → ACCEPTED
3. 상태 변경: ACCEPTED → PREPARING
4. 상태 변경: PREPARING → COMPLETED
5. **검증**: 각 단계에서 SSE ORDER_STATUS_CHANGED 이벤트 수신
6. **검증**: 잘못된 전이(PENDING → PREPARING) 시 400 에러

### Scenario 3: 테이블 이용 완료 플로우
1. 테이블 등록 + 주문 3건 생성
2. 이용 완료 (POST /api/stores/1/tables/1/complete)
3. **검증**: OrderHistory에 3건 이력 저장
4. **검증**: 현재 주문 목록 비어있음
5. **검증**: SSE TABLE_RESET 이벤트 수신
6. 새 주문 생성
7. **검증**: 새 세션으로 시작, 이전 주문 미표시

### Scenario 4: 메뉴 관리 → 주문 연동
1. 카테고리/소분류/메뉴 등록
2. 메뉴 가격 5000원으로 주문 생성
3. 메뉴 가격 6000원으로 수정
4. **검증**: 기존 주문의 단가는 5000원 유지 (스냅샷)

### Scenario 5: 대시보드 집계
1. 테이블 3개 등록, 각각 주문 생성
2. 대시보드 조회 (GET /api/stores/1/dashboard)
3. **검증**: 테이블별 총 주문액, 주문 수, 최신 주문 미리보기 정확성

## 수동 통합 테스트 (curl)

```bash
# 1. 테이블 등록
curl -X POST http://localhost:8080/api/stores/1/tables \
  -H "Content-Type: application/json" \
  -d '{"tableNumber":"A1","password":"password123"}'

# 2. 카테고리 등록
curl -X POST http://localhost:8080/api/stores/1/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"음료","displayOrder":1}'

# 3. 소분류 등록
curl -X POST http://localhost:8080/api/stores/1/categories/1/subcategories \
  -H "Content-Type: application/json" \
  -d '{"name":"커피","displayOrder":1}'

# 4. 메뉴 등록
curl -X POST http://localhost:8080/api/stores/1/menus \
  -H "Content-Type: application/json" \
  -d '{"subCategoryId":1,"name":"아메리카노","price":4500,"description":"깊고 진한 커피"}'

# 5. 주문 생성
curl -X POST http://localhost:8080/api/stores/1/orders \
  -H "Content-Type: application/json" \
  -d '{"tableId":1,"items":[{"menuItemId":1,"quantity":2}]}'

# 6. SSE 구독 (별도 터미널)
curl -N http://localhost:8080/api/stores/1/orders/subscribe

# 7. 주문 상태 변경
curl -X PUT http://localhost:8080/api/stores/1/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"ACCEPTED"}'

# 8. 대시보드 조회
curl http://localhost:8080/api/stores/1/dashboard

# 9. 이용 완료
curl -X POST http://localhost:8080/api/stores/1/tables/1/complete
```

## 정리

```bash
docker stop tableorder-db-test
docker rm tableorder-db-test
```

---
