# Unit 2: Backend-Domain - Logical Components

---

## 1. 컴포넌트 아키텍처

```
+------------------------------------------------------------------+
|                    Spring Boot Application                        |
|                                                                  |
|  +------------------+  +------------------+  +-----------------+ |
|  |  Table Module    |  |  Menu Module     |  |  Order Module   | |
|  |                  |  |                  |  |                 | |
|  | TableController  |  | CategoryCtrl     |  | OrderController | |
|  | TableService     |  | MenuController   |  | SseController   | |
|  | SessionService   |  | CategoryService  |  | OrderService    | |
|  | TableRepository  |  | MenuService      |  | SseService      | |
|  | SessionRepo      |  | ImageService     |  | OrderRepository | |
|  | HistoryRepo      |  | CategoryRepo     |  | OrderItemRepo   | |
|  |                  |  | SubCategoryRepo  |  |                 | |
|  |                  |  | MenuItemRepo     |  |                 | |
|  +------------------+  +------------------+  +-----------------+ |
|                                                                  |
|  +----------------------------------------------------------+   |
|  |                    Common Module                          |   |
|  |  ApiResponse | GlobalExceptionHandler | RequestIdFilter   |   |
|  |  BusinessException | StoreIsolationAspect                 |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  +----------------------------------------------------------+   |
|  |                    Auth Module (Unit 1)                    |   |
|  |  JwtAuthFilter | SecurityConfig | @PreAuthorize            |   |
|  +----------------------------------------------------------+   |
+------------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+------------------+  +------------------+  +------------------+
|   PostgreSQL     |  |     AWS S3       |  |  SSE Clients     |
|   Database       |  |  (이미지 저장)    |  |  (관리자 브라우저) |
+------------------+  +------------------+  +------------------+
```

---

## 2. 모듈별 Logical Components

### 2.1 Table Module

| 컴포넌트 | 타입 | 책임 |
|----------|------|------|
| TableController | REST Controller | 테이블 API 엔드포인트 |
| TableService | Service | 테이블 CRUD 비즈니스 로직 |
| TableSessionService | Service | 세션 라이프사이클 관리 |
| TableRepository | JPA Repository | StoreTable 엔티티 접근 |
| TableSessionRepository | JPA Repository | TableSession 엔티티 접근 |
| OrderHistoryRepository | JPA Repository | OrderHistory 엔티티 접근 |

### 2.2 Menu Module

| 컴포넌트 | 타입 | 책임 |
|----------|------|------|
| CategoryController | REST Controller | 카테고리 API 엔드포인트 |
| MenuController | REST Controller | 메뉴 API 엔드포인트 |
| CategoryService | Service | 카테고리 CRUD |
| MenuService | Service | 메뉴 CRUD + 순서 관리 |
| ImageService | Service | S3 이미지 업로드/삭제 |
| CategoryRepository | JPA Repository | Category 엔티티 접근 |
| SubCategoryRepository | JPA Repository | SubCategory 엔티티 접근 |
| MenuItemRepository | JPA Repository | MenuItem 엔티티 접근 |

### 2.3 Order Module

| 컴포넌트 | 타입 | 책임 |
|----------|------|------|
| OrderController | REST Controller | 주문 API 엔드포인트 |
| SseController | REST Controller | SSE 구독 엔드포인트 |
| DashboardController | REST Controller | 대시보드 집계 엔드포인트 |
| OrderService | Service | 주문 CRUD + 상태 관리 |
| SseService | Service | SSE 구독/알림 관리 |
| OrderRepository | JPA Repository | Order 엔티티 접근 |
| OrderItemRepository | JPA Repository | OrderItem 엔티티 접근 |

---

## 3. Cross-Cutting Components

| 컴포넌트 | 타입 | 책임 |
|----------|------|------|
| GlobalExceptionHandler | @ControllerAdvice | 전역 예외 처리 |
| RequestIdFilter | Filter | 요청 ID 생성 + MDC 설정 |
| StoreIsolationAspect | AOP Aspect | 매장 격리 검증 |
| ApiResponse<T> | DTO | 공통 응답 래퍼 |
| PageResponse<T> | DTO | 페이지네이션 응답 래퍼 |
| BusinessException | Exception | 비즈니스 예외 (errorCode 포함) |

---

## 4. 외부 연동 Components

### 4.1 AWS S3 Client
```java
@Configuration
public class S3Config {
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
            .region(Region.of(region))
            .build();
    }
}
```

**설정값** (application.yml):
```yaml
aws:
  s3:
    bucket: table-order-images
    region: ap-northeast-2
    base-url: https://{bucket}.s3.{region}.amazonaws.com
```

### 4.2 SSE Emitter Manager
- **저장소**: ConcurrentHashMap<Long, List<SseEmitter>> (인메모리)
- **타임아웃**: 30분
- **Heartbeat**: 30초 간격 (@Scheduled)
- **정리**: onCompletion/onTimeout/onError 콜백으로 자동 제거

---

## 5. 이벤트 흐름

### 5.1 주문 생성 이벤트
```
OrderService.createOrder()
    |-- @Transactional (DB 저장)
    |-- ApplicationEventPublisher.publishEvent(OrderCreatedEvent)
    |
    v
@TransactionalEventListener(AFTER_COMMIT)
OrderEventHandler.handleOrderCreated()
    |-- SseService.notify(storeId, "NEW_ORDER", orderResponse)
    |
    v
SseEmitter → 관리자 브라우저
```

### 5.2 주문 상태 변경 이벤트
```
OrderService.updateOrderStatus()
    |-- @Transactional (DB 업데이트)
    |-- ApplicationEventPublisher.publishEvent(OrderStatusChangedEvent)
    |
    v
@TransactionalEventListener(AFTER_COMMIT)
OrderEventHandler.handleStatusChanged()
    |-- SseService.notify(storeId, "ORDER_STATUS_CHANGED", orderResponse)
```

### 5.3 테이블 리셋 이벤트
```
TableSessionService.endSession()
    |-- @Transactional (이력 이동 + 삭제 + 세션 종료)
    |-- ApplicationEventPublisher.publishEvent(TableResetEvent)
    |
    v
@TransactionalEventListener(AFTER_COMMIT)
TableEventHandler.handleTableReset()
    |-- SseService.notify(storeId, "TABLE_RESET", tableResetData)
```

---

## 6. 패키지 구조

```
com.tableorder/
+-- table/
|   +-- controller/
|   |   +-- TableController.java
|   +-- service/
|   |   +-- TableService.java
|   |   +-- TableSessionService.java
|   +-- repository/
|   |   +-- TableRepository.java
|   |   +-- TableSessionRepository.java
|   |   +-- OrderHistoryRepository.java
|   +-- entity/
|   |   +-- StoreTable.java
|   |   +-- TableSession.java
|   |   +-- OrderHistory.java
|   +-- dto/
|   |   +-- TableCreateRequest.java
|   |   +-- TableResponse.java
|   |   +-- OrderHistoryResponse.java
|   +-- mapper/
|       +-- TableMapper.java
+-- menu/
|   +-- controller/
|   |   +-- CategoryController.java
|   |   +-- MenuController.java
|   +-- service/
|   |   +-- CategoryService.java
|   |   +-- MenuService.java
|   |   +-- ImageService.java
|   +-- repository/
|   |   +-- CategoryRepository.java
|   |   +-- SubCategoryRepository.java
|   |   +-- MenuItemRepository.java
|   +-- entity/
|   |   +-- Category.java
|   |   +-- SubCategory.java
|   |   +-- MenuItem.java
|   +-- dto/
|   |   +-- CategoryCreateRequest.java
|   |   +-- CategoryResponse.java
|   |   +-- MenuCreateRequest.java
|   |   +-- MenuUpdateRequest.java
|   |   +-- MenuItemResponse.java
|   |   +-- MenuOrderRequest.java
|   +-- mapper/
|       +-- CategoryMapper.java
|       +-- MenuMapper.java
+-- order/
    +-- controller/
    |   +-- OrderController.java
    |   +-- SseController.java
    |   +-- DashboardController.java
    +-- service/
    |   +-- OrderService.java
    |   +-- SseService.java
    +-- repository/
    |   +-- OrderRepository.java
    |   +-- OrderItemRepository.java
    +-- entity/
    |   +-- Order.java
    |   +-- OrderItem.java
    |   +-- OrderStatus.java (Enum)
    +-- dto/
    |   +-- OrderCreateRequest.java
    |   +-- OrderItemRequest.java
    |   +-- OrderResponse.java
    |   +-- OrderItemResponse.java
    |   +-- OrderStatusUpdateRequest.java
    |   +-- TableDashboardDto.java
    +-- event/
    |   +-- OrderCreatedEvent.java
    |   +-- OrderStatusChangedEvent.java
    |   +-- OrderDeletedEvent.java
    |   +-- TableResetEvent.java
    |   +-- OrderEventHandler.java
    |   +-- TableEventHandler.java
    +-- mapper/
        +-- OrderMapper.java
```

---
