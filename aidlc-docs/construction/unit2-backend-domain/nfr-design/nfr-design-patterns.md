# Unit 2: Backend-Domain - NFR Design Patterns

---

## 1. 성능 패턴

### 1.1 DB 커넥션 풀 최적화 (HikariCP)
**적용 대상**: 모든 DB 접근

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20      # 분당 500건 처리 기준
      minimum-idle: 5
      idle-timeout: 300000       # 5분
      max-lifetime: 600000       # 10분
      connection-timeout: 30000  # 30초
```

**근거**: 분당 500건 = 초당 ~8.3건. 평균 쿼리 시간 50ms 가정 시 동시 필요 커넥션 ~1개. 피크 대비 여유분 포함 20개.

### 1.2 JPA 쿼리 최적화
**적용 대상**: 메뉴 조회, 주문 조회, 대시보드

**패턴 1: Fetch Join (N+1 방지)**
```java
// 카테고리 + 소분류 한 번에 조회
@Query("SELECT c FROM Category c LEFT JOIN FETCH c.subCategories WHERE c.storeId = :storeId ORDER BY c.displayOrder")
List<Category> findByStoreIdWithSubCategories(@Param("storeId") Long storeId);

// 주문 + 주문항목 한 번에 조회
@Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :orderId")
Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);
```

**패턴 2: DTO Projection (불필요한 필드 제외)**
```java
// 대시보드용 테이블 집계 (엔티티 전체 로딩 대신 필요한 필드만)
@Query("SELECT new com.tableorder.order.dto.TableDashboardDto(o.tableId, t.tableNumber, SUM(o.totalAmount), COUNT(o)) " +
       "FROM Order o JOIN StoreTable t ON o.tableId = t.id " +
       "WHERE o.storeId = :storeId AND o.sessionId IN (SELECT ts.id FROM TableSession ts WHERE ts.isActive = true) " +
       "GROUP BY o.tableId, t.tableNumber")
List<TableDashboardDto> findDashboardData(@Param("storeId") Long storeId);
```

### 1.3 인덱스 전략
**적용 대상**: 자주 조회되는 쿼리

```sql
-- 테이블 조회
CREATE INDEX idx_store_table_store_id ON store_table(store_id);
CREATE UNIQUE INDEX idx_store_table_number ON store_table(store_id, table_number);

-- 세션 조회
CREATE INDEX idx_table_session_active ON table_session(table_id, is_active);

-- 카테고리/메뉴 정렬 조회
CREATE INDEX idx_category_order ON category(store_id, display_order);
CREATE INDEX idx_sub_category_order ON sub_category(category_id, display_order);
CREATE INDEX idx_menu_item_order ON menu_item(sub_category_id, display_order);
CREATE INDEX idx_menu_item_available ON menu_item(store_id, is_available);

-- 주문 조회
CREATE INDEX idx_order_store_status ON orders(store_id, status);
CREATE INDEX idx_order_table_session ON orders(table_id, session_id);
CREATE INDEX idx_order_item_order ON order_item(order_id);

-- 과거 내역 조회
CREATE INDEX idx_order_history_table ON order_history(table_id, ordered_at DESC);
CREATE INDEX idx_order_history_date ON order_history(store_id, completed_at DESC);
```

---

## 2. 실시간 통신 패턴 (SSE)

### 2.1 SseEmitter 관리 패턴
**적용 대상**: 실시간 주문 알림

```java
@Service
public class SseService {
    // 매장별 구독자 관리 (소규모 1~5명)
    private final ConcurrentHashMap<Long, List<SseEmitter>> storeSubscribers = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long storeId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30분 타임아웃

        storeSubscribers.computeIfAbsent(storeId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(storeId, emitter));
        emitter.onTimeout(() -> removeEmitter(storeId, emitter));
        emitter.onError(e -> removeEmitter(storeId, emitter));

        // 초기 연결 확인 이벤트
        sendEvent(emitter, "CONNECTED", Map.of("timestamp", LocalDateTime.now()));

        return emitter;
    }

    public void notify(Long storeId, String eventType, Object data) {
        List<SseEmitter> emitters = storeSubscribers.getOrDefault(storeId, Collections.emptyList());
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                sendEvent(emitter, eventType, data);
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }
}
```

### 2.2 Heartbeat 패턴
```java
@Scheduled(fixedRate = 30000) // 30초마다
public void sendHeartbeat() {
    storeSubscribers.forEach((storeId, emitters) -> {
        notify(storeId, "HEARTBEAT", Map.of("timestamp", LocalDateTime.now()));
    });
}
```

---

## 3. 보안 패턴

### 3.1 매장 격리 패턴 (Store Isolation)
**적용 대상**: 모든 API 엔드포인트

```java
@Component
public class StoreIsolationAspect {
    @Before("@annotation(StoreScoped)")
    public void validateStoreAccess(JoinPoint joinPoint) {
        Long requestStoreId = extractStoreIdFromPath();
        Long tokenStoreId = SecurityContextHolder.getContext().getAuthentication().getStoreId();

        if (!requestStoreId.equals(tokenStoreId)) {
            throw new AuthorizationException("접근 권한이 없습니다");
        }
    }
}
```

### 3.2 입력값 검증 패턴
**적용 대상**: 모든 Request DTO

```java
// Bean Validation + Custom Validator 조합
public class OrderCreateRequest {
    @NotNull(message = "테이블 ID는 필수입니다")
    private Long tableId;

    @NotEmpty(message = "주문 항목이 비어있습니다")
    @Size(max = 50, message = "주문 항목은 최대 50개까지 가능합니다")
    @Valid
    private List<OrderItemRequest> items;
}

public class OrderItemRequest {
    @NotNull(message = "메뉴 ID는 필수입니다")
    private Long menuItemId;

    @NotNull(message = "수량은 필수입니다")
    @Min(value = 1, message = "수량은 1 이상이어야 합니다")
    @Max(value = 99, message = "수량은 99 이하여야 합니다")
    private Integer quantity;
}
```

### 3.3 역할 기반 접근 제어 패턴
**적용 대상**: Controller 메서드

```java
// 매니저 전용
@PreAuthorize("hasRole('MANAGER')")
@PostMapping("/tables")
public ResponseEntity<ApiResponse<TableResponse>> createTable(...) { }

// 매니저 + 직원
@PreAuthorize("hasAnyRole('MANAGER', 'STAFF')")
@PutMapping("/orders/{orderId}/status")
public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(...) { }

// 고객 (태블릿)
@PreAuthorize("hasRole('TABLE')")
@PostMapping("/orders")
public ResponseEntity<ApiResponse<OrderResponse>> createOrder(...) { }
```

---

## 4. 예외 처리 패턴

### 4.1 계층별 예외 전략
```
Controller → @Valid 검증 실패 → MethodArgumentNotValidException
Service → 비즈니스 규칙 위반 → BusinessException
Repository → DB 제약 위반 → DataIntegrityViolationException
External (S3) → 외부 서비스 실패 → ExternalServiceException
```

### 4.2 GlobalExceptionHandler 패턴
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e) {
        return ResponseEntity.status(e.getStatus())
            .body(ApiResponse.error(e.getMessage(), e.getErrorCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(message, "VALIDATION_ERROR"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity.internalServerError()
            .body(ApiResponse.error("서버 내부 오류가 발생했습니다", "INTERNAL_ERROR"));
    }
}
```

---

## 5. 트랜잭션 패턴

### 5.1 트랜잭션 경계 설계
```java
// 주문 생성: 세션 시작 + 주문 저장 + SSE 알림
@Transactional
public OrderResponse createOrder(OrderCreateRequest request) {
    // 1. 세션 확인/생성 (DB)
    // 2. 메뉴 유효성 검증 (DB)
    // 3. 주문 + 주문항목 저장 (DB)
    // 트랜잭션 커밋 후 SSE 알림 (비동기)
}

// SSE 알림은 트랜잭션 밖에서 실행
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void handleOrderCreated(OrderCreatedEvent event) {
    sseService.notifyNewOrder(event.getStoreId(), event.getOrderResponse());
}
```

### 5.2 이용 완료: 복합 트랜잭션
```java
@Transactional
public void completeTableSession(Long tableId) {
    // 1. 활성 세션 조회
    // 2. 주문 → OrderHistory 변환/저장
    // 3. OrderItem 삭제
    // 4. Order 삭제
    // 5. 세션 종료
    // 트랜잭션 커밋 후 SSE 알림
}
```

---

## 6. 로깅 패턴

### 6.1 구조화된 로깅
```java
// MDC를 활용한 요청 추적
@Component
public class RequestIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("requestId", requestId);
        MDC.put("storeId", extractStoreId(request));
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

### 6.2 로그 포맷
```
logback-spring.xml:
%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%X{requestId}] [store:%X{storeId}] %-5level %logger{36} - %msg%n
```

---
