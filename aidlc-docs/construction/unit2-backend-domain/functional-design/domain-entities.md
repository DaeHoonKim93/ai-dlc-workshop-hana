# Unit 2: Backend-Domain - 도메인 엔티티

---

## Entity: StoreTable (테이블)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 테이블 고유 ID |
| storeId | Long | FK(Store), NOT NULL | 소속 매장 |
| tableNumber | String | NOT NULL, max 20 | 테이블 번호 |
| password | String | NOT NULL | bcrypt 해싱된 비밀번호 |
| isActive | Boolean | NOT NULL, default true | 활성 상태 |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |
| updatedAt | LocalDateTime | NOT NULL | 수정일시 |

**UNIQUE 제약**: (storeId, tableNumber) 복합 유니크

---

## Entity: TableSession (테이블 세션)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 세션 고유 ID |
| tableId | Long | FK(StoreTable), NOT NULL | 테이블 |
| storeId | Long | FK(Store), NOT NULL | 매장 |
| startedAt | LocalDateTime | NOT NULL | 세션 시작 시각 |
| endedAt | LocalDateTime | nullable | 세션 종료 시각 |
| isActive | Boolean | NOT NULL, default true | 활성 상태 |

---

## Entity: Category (대분류 카테고리)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 카테고리 고유 ID |
| storeId | Long | FK(Store), NOT NULL | 소속 매장 |
| name | String | NOT NULL, max 50 | 카테고리명 |
| displayOrder | Integer | NOT NULL, default 0 | 노출 순서 |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |

---

## Entity: SubCategory (소분류 카테고리)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 소분류 고유 ID |
| categoryId | Long | FK(Category), NOT NULL | 상위 카테고리 |
| storeId | Long | FK(Store), NOT NULL | 소속 매장 |
| name | String | NOT NULL, max 50 | 소분류명 |
| displayOrder | Integer | NOT NULL, default 0 | 노출 순서 |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |

---

## Entity: MenuItem (메뉴 아이템)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 메뉴 고유 ID |
| storeId | Long | FK(Store), NOT NULL | 소속 매장 |
| subCategoryId | Long | FK(SubCategory), NOT NULL | 소분류 카테고리 |
| name | String | NOT NULL, max 100 | 메뉴명 |
| price | Integer | NOT NULL, min 100 | 가격 (원) |
| description | String | nullable, max 500 | 메뉴 설명 |
| imageUrl | String | nullable, max 500 | 이미지 URL (S3) |
| displayOrder | Integer | NOT NULL, default 0 | 노출 순서 |
| isAvailable | Boolean | NOT NULL, default true | 판매 가능 여부 |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |
| updatedAt | LocalDateTime | NOT NULL | 수정일시 |

---

## Entity: Order (주문)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 주문 고유 ID |
| storeId | Long | FK(Store), NOT NULL | 매장 |
| tableId | Long | FK(StoreTable), NOT NULL | 테이블 |
| sessionId | Long | FK(TableSession), NOT NULL | 테이블 세션 |
| orderNumber | String | NOT NULL, UNIQUE | 주문 번호 (자동 생성) |
| totalAmount | Integer | NOT NULL | 총 주문 금액 |
| status | Enum | NOT NULL | 주문 상태 |
| createdAt | LocalDateTime | NOT NULL | 주문 시각 |
| updatedAt | LocalDateTime | NOT NULL | 수정일시 |

**OrderStatus Enum**: PENDING(대기중), ACCEPTED(접수), PREPARING(준비중), COMPLETED(완료)

---

## Entity: OrderItem (주문 항목)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 항목 고유 ID |
| orderId | Long | FK(Order), NOT NULL | 주문 |
| menuItemId | Long | FK(MenuItem), NOT NULL | 메뉴 아이템 |
| menuName | String | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | Integer | NOT NULL, min 1 | 수량 |
| unitPrice | Integer | NOT NULL | 주문 시점 단가 (스냅샷) |
| subtotal | Integer | NOT NULL | 소계 (quantity * unitPrice) |

---

## Entity: OrderHistory (과거 주문 이력)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 이력 고유 ID |
| storeId | Long | NOT NULL | 매장 |
| tableId | Long | NOT NULL | 테이블 |
| sessionId | Long | NOT NULL | 세션 |
| orderNumber | String | NOT NULL | 주문 번호 |
| totalAmount | Integer | NOT NULL | 총 금액 |
| status | String | NOT NULL | 최종 상태 |
| orderItems | JSON | NOT NULL | 주문 항목 (JSON 스냅샷) |
| orderedAt | LocalDateTime | NOT NULL | 주문 시각 |
| completedAt | LocalDateTime | NOT NULL | 이용 완료 시각 |

---

## Entity Relationship

```
Store (1) ----< (N) StoreTable
Store (1) ----< (N) Category
Store (1) ----< (N) Order

StoreTable (1) ----< (N) TableSession
StoreTable (1) ----< (N) Order

TableSession (1) ----< (N) Order

Category (1) ----< (N) SubCategory
SubCategory (1) ----< (N) MenuItem

Order (1) ----< (N) OrderItem
OrderItem (N) >---- (1) MenuItem
```

---
