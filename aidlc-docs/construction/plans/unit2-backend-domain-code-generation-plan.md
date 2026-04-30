# Code Generation Plan - Unit 2: Backend-Domain

## 유닛 컨텍스트
- **유닛**: Unit 2 - Backend-Domain (table, menu, order 모듈)
- **프로젝트 유형**: Greenfield Multi-Module (Gradle)
- **코드 위치**: `table-order-backend/` (workspace root)
- **담당 스토리**: US-03, US-04, US-09~US-11, US-14~US-26 (18개)
- **의존성**: Unit 1 (common, auth) — 인터페이스만 참조, 독립 개발 가능

## 기술 스택
- Java 17, Spring Boot 3.2.x, Spring Data JPA, PostgreSQL 15.x
- Gradle Multi-Module, Flyway, MapStruct, Lombok
- AWS SDK v2 (S3), JUnit 5, Mockito, H2 (테스트)

---

## 코드 생성 단계

### Phase 1: 프로젝트 구조 설정
- [x] Step 1: Gradle Multi-Module 프로젝트 구조 생성 (settings.gradle, build.gradle)
- [x] Step 2: common 모듈 기본 코드 (ApiResponse, PageResponse, BusinessException, GlobalExceptionHandler)
- [x] Step 3: application.yml 설정 (dev 프로파일, DB, S3, HikariCP)

### Phase 2: Table 모듈
- [x] Step 4: Entity 생성 (StoreTable, TableSession, OrderHistory)
- [x] Step 5: Repository 생성 (TableRepository, TableSessionRepository, OrderHistoryRepository)
- [x] Step 6: DTO 생성 (TableCreateRequest, TableResponse, OrderHistoryResponse 등)
- [x] Step 7: Mapper 생성 (TableMapper - MapStruct)
- [x] Step 8: Service 생성 (TableService, TableSessionService)
- [x] Step 9: Controller 생성 (TableController)
- [x] Step 10: Service 단위 테스트 (TableServiceTest, TableSessionServiceTest)
- [x] Step 11: Controller 단위 테스트 (TableControllerTest)

### Phase 3: Menu 모듈
- [x] Step 12: Entity 생성 (Category, SubCategory, MenuItem)
- [x] Step 13: Repository 생성 (CategoryRepository, SubCategoryRepository, MenuItemRepository)
- [x] Step 14: DTO 생성 (CategoryCreateRequest, CategoryResponse, MenuCreateRequest, MenuItemResponse 등)
- [x] Step 15: Mapper 생성 (CategoryMapper, MenuMapper - MapStruct)
- [x] Step 16: Service 생성 (CategoryService, MenuService, ImageService)
- [x] Step 17: Controller 생성 (CategoryController, MenuController)
- [x] Step 18: Service 단위 테스트 (CategoryServiceTest, MenuServiceTest, ImageServiceTest)
- [x] Step 19: Controller 단위 테스트 (CategoryControllerTest, MenuControllerTest)

### Phase 4: Order 모듈
- [x] Step 20: Entity 생성 (Order, OrderItem, OrderStatus enum)
- [x] Step 21: Repository 생성 (OrderRepository, OrderItemRepository)
- [x] Step 22: DTO 생성 (OrderCreateRequest, OrderResponse, OrderStatusUpdateRequest, TableDashboardDto 등)
- [x] Step 23: Event 클래스 생성 (OrderCreatedEvent, OrderStatusChangedEvent, OrderDeletedEvent, TableResetEvent)
- [x] Step 24: Mapper 생성 (OrderMapper - MapStruct)
- [x] Step 25: Service 생성 (OrderService, SseService)
- [x] Step 26: Event Handler 생성 (OrderEventHandler, TableEventHandler)
- [x] Step 27: Controller 생성 (OrderController, SseController, DashboardController)
- [x] Step 28: Service 단위 테스트 (OrderServiceTest, SseServiceTest)
- [x] Step 29: Controller 단위 테스트 (OrderControllerTest, SseControllerTest, DashboardControllerTest)

### Phase 5: Cross-Cutting & 인프라
- [x] Step 30: RequestIdFilter (MDC 로깅)
- [x] Step 31: StoreIsolationAspect (매장 격리)
- [x] Step 32: S3Config (AWS S3 클라이언트 설정)
- [x] Step 33: Flyway DB 마이그레이션 스크립트 (V1__init.sql)

### Phase 6: App 모듈 & 통합
- [x] Step 34: App 모듈 메인 클래스 (TableOrderApplication)
- [x] Step 35: logback-spring.xml (로깅 설정)

---

## 파일 구조 미리보기

```
table-order-backend/
+-- settings.gradle
+-- build.gradle
+-- common/
|   +-- build.gradle
|   +-- src/main/java/com/tableorder/common/
|       +-- dto/ (ApiResponse, PageResponse)
|       +-- exception/ (BusinessException, GlobalExceptionHandler)
|       +-- filter/ (RequestIdFilter)
|       +-- aspect/ (StoreIsolationAspect)
+-- table/
|   +-- build.gradle
|   +-- src/main/java/com/tableorder/table/
|   |   +-- entity/ controller/ service/ repository/ dto/ mapper/
|   +-- src/test/java/com/tableorder/table/
|       +-- service/ controller/
+-- menu/
|   +-- build.gradle
|   +-- src/main/java/com/tableorder/menu/
|   |   +-- entity/ controller/ service/ repository/ dto/ mapper/
|   +-- src/test/java/com/tableorder/menu/
|       +-- service/ controller/
+-- order/
|   +-- build.gradle
|   +-- src/main/java/com/tableorder/order/
|   |   +-- entity/ controller/ service/ repository/ dto/ event/ mapper/
|   +-- src/test/java/com/tableorder/order/
|       +-- service/ controller/
+-- app/
    +-- build.gradle
    +-- src/main/java/com/tableorder/ (TableOrderApplication)
    +-- src/main/resources/
        +-- application.yml
        +-- application-dev.yml
        +-- logback-spring.xml
        +-- db/migration/ (V1__init.sql)
```

---
