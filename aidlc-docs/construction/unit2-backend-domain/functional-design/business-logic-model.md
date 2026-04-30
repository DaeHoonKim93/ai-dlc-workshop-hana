# Unit 2: Backend-Domain - 비즈니스 로직 모델

---

## 1. 주문 생성 플로우

```
입력: storeId, tableId, items[{menuItemId, quantity}]
    |
    v
[1] 테이블 존재 및 매장 소속 확인
[2] 각 menuItemId 유효성 확인 (존재, 판매 가능, 동일 매장)
[3] 현재 활성 세션 조회
    |-- 활성 세션 없음 → 새 세션 자동 생성 (첫 주문)
[4] 주문 번호 생성 (yyyyMMdd-HHmmss-XXXX 형식)
[5] OrderItem 생성 (메뉴명, 단가 스냅샷 저장)
[6] totalAmount 계산 (sum of subtotals)
[7] Order 저장 (status = PENDING)
[8] SSE 알림 전송 (notifyNewOrder)
    |
    v
출력: OrderResponse { orderId, orderNumber, items, totalAmount, status, createdAt }
```

---

## 2. 주문 상태 변경 플로우

```
입력: orderId, newStatus
    |
    v
[1] 주문 존재 확인
[2] 상태 전이 유효성 검증
    |-- PENDING → ACCEPTED (✅)
    |-- ACCEPTED → PREPARING (✅)
    |-- PREPARING → COMPLETED (✅)
    |-- 그 외 전이 → BusinessException("유효하지 않은 상태 변경입니다")
[3] 상태 업데이트
[4] SSE 알림 전송 (notifyOrderStatusChange)
    |
    v
출력: OrderResponse (변경된 상태)
```

### 상태 전이 다이어그램
```
PENDING --> ACCEPTED --> PREPARING --> COMPLETED
(대기중)    (접수)       (준비중)      (완료)
```
- 역방향 전이 불가
- 단계 건너뛰기 불가 (PENDING → PREPARING 불가)
- COMPLETED 상태에서 추가 변경 불가

---

## 3. 주문 삭제 플로우

```
입력: orderId
    |
    v
[1] 주문 존재 확인
[2] Order + OrderItem 삭제
[3] SSE 알림 전송 (notifyOrderDeleted)
    |
    v
출력: void
```

---

## 4. 테이블 세션 라이프사이클

### 세션 시작 (자동)
```
트리거: 첫 주문 생성 시 (활성 세션 없는 경우)
    |
    v
[1] 새 TableSession 생성 (isActive = true, startedAt = now)
    |
    v
출력: TableSession
```

### 이용 완료 (수동)
```
입력: tableId
    |
    v
[1] 현재 활성 세션 조회
    |-- 활성 세션 없음 → BusinessException("활성 세션이 없습니다")
[2] 해당 세션의 모든 주문 조회
[3] 각 주문을 OrderHistory로 변환 (JSON 스냅샷 포함)
[4] OrderHistory 일괄 저장
[5] 해당 세션의 OrderItem 일괄 삭제
[6] 해당 세션의 Order 일괄 삭제
[7] TableSession 종료 (isActive = false, endedAt = now)
[8] SSE 알림 전송 (notifyTableReset)
    |
    v
출력: void
```

---

## 5. SSE 실시간 알림

### 이벤트 타입
| 이벤트 | 데이터 | 트리거 |
|--------|--------|--------|
| NEW_ORDER | OrderResponse | 주문 생성 시 |
| ORDER_STATUS_CHANGED | OrderResponse | 상태 변경 시 |
| ORDER_DELETED | { orderId, tableId } | 주문 삭제 시 |
| TABLE_RESET | { tableId } | 이용 완료 시 |

### 구독 관리
```
구독: GET /api/stores/{storeId}/orders/subscribe
    |
    v
[1] SseEmitter 생성 (timeout: 30분)
[2] 매장별 구독자 ConcurrentHashMap에 추가
[3] onCompletion/onTimeout/onError 콜백으로 자동 제거
    |
    v
출력: SseEmitter (연결 유지)
```

### 알림 전송
```
이벤트 발생 시:
    |
    v
[1] 매장별 구독자 목록 조회
[2] 각 SseEmitter에 이벤트 전송
[3] 전송 실패한 Emitter 제거 (연결 끊김)
```

---

## 6. 메뉴 관리 플로우

### 메뉴 등록
```
입력: storeId, subCategoryId, name, price, description, imageUrl
    |
    v
[1] subCategoryId 유효성 확인 (존재, 동일 매장)
[2] 가격 범위 검증 (100원 이상)
[3] displayOrder 자동 할당 (해당 소분류 내 마지막 + 1)
[4] MenuItem 저장
    |
    v
출력: MenuItemResponse
```

### 이미지 업로드
```
입력: menuId, MultipartFile
    |
    v
[1] 파일 형식 검증 (jpg, jpeg, png, gif, webp)
[2] 파일 크기 검증 (최대 5MB)
[3] S3 업로드 (경로: stores/{storeId}/menus/{uuid}.{ext})
[4] 기존 이미지 있으면 S3에서 삭제
[5] MenuItem.imageUrl 업데이트
    |
    v
출력: { imageUrl: "https://s3.../..." }
```

---

## 7. 과거 주문 내역 조회

```
입력: tableId, startDate(optional), endDate(optional), page, size
    |
    v
[1] OrderHistory에서 tableId로 조회
[2] 날짜 필터 적용 (있는 경우)
[3] completedAt 역순 정렬
[4] 페이지네이션 적용
    |
    v
출력: Page<OrderHistoryResponse>
```

---
