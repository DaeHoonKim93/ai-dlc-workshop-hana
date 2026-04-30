# Unit 2: Backend-Domain - API 상세 설계서

## 공통 사항

### Base URL
```
/api/stores/{storeId}
```

### 공통 응답 래퍼
```json
// 성공 응답
{
  "success": true,
  "data": { ... },
  "message": null
}

// 에러 응답
{
  "success": false,
  "data": null,
  "message": "에러 메시지",
  "errorCode": "ERROR_CODE"
}

// 페이지네이션 응답
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "last": false
  },
  "message": null
}
```

### 공통 에러 코드
| HTTP Status | errorCode | 설명 |
|-------------|-----------|------|
| 400 | VALIDATION_ERROR | 입력값 검증 실패 |
| 401 | UNAUTHORIZED | 인증 실패 / 토큰 만료 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | CONFLICT | 중복 / 충돌 |
| 500 | INTERNAL_ERROR | 서버 내부 오류 |

### 인증 헤더
```
Authorization: Bearer {accessToken}
```

---

# 1. Table API

## 1.1 테이블 목록 조회

```
GET /api/stores/{storeId}/tables
```

**권한**: MANAGER, STAFF

**Query Parameters**: 없음

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tableNumber": "A1",
      "isActive": true,
      "currentSession": {
        "sessionId": 10,
        "startedAt": "2026-04-30T12:00:00",
        "totalOrderAmount": 45000,
        "orderCount": 3
      },
      "createdAt": "2026-04-01T09:00:00"
    },
    {
      "id": 2,
      "tableNumber": "A2",
      "isActive": true,
      "currentSession": null,
      "createdAt": "2026-04-01T09:00:00"
    }
  ],
  "message": null
}
```

---

## 1.2 테이블 등록 (초기 설정)

```
POST /api/stores/{storeId}/tables
```

**권한**: MANAGER

**Request Body**:
```json
{
  "tableNumber": "A1",
  "password": "table1234"
}
```

| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| tableNumber | String | ✅ | 1~20자 |
| password | String | ✅ | 8자 이상 |

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tableNumber": "A1",
    "isActive": true,
    "createdAt": "2026-04-30T09:00:00"
  },
  "message": null
}
```

**Error 409**:
```json
{
  "success": false,
  "data": null,
  "message": "이미 등록된 테이블 번호입니다",
  "errorCode": "CONFLICT"
}
```

---

## 1.3 테이블 이용 완료

```
POST /api/stores/{storeId}/tables/{tableId}/complete
```

**권한**: MANAGER, STAFF

**Request Body**: 없음

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tableId": 1,
    "tableNumber": "A1",
    "completedSessionId": 10,
    "archivedOrderCount": 3,
    "archivedTotalAmount": 45000,
    "completedAt": "2026-04-30T14:30:00"
  },
  "message": null
}
```

**Error 400**:
```json
{
  "success": false,
  "data": null,
  "message": "활성 세션이 없습니다",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 1.4 과거 주문 내역 조회

```
GET /api/stores/{storeId}/tables/{tableId}/history
```

**권한**: MANAGER, STAFF

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|:----:|--------|------|
| startDate | String (yyyy-MM-dd) | ❌ | - | 시작 날짜 |
| endDate | String (yyyy-MM-dd) | ❌ | - | 종료 날짜 |
| page | Integer | ❌ | 0 | 페이지 번호 |
| size | Integer | ❌ | 20 | 페이지 크기 |

**Response 200**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "orderNumber": "20260430-143000-A1B2",
        "totalAmount": 25000,
        "status": "COMPLETED",
        "orderItems": [
          {
            "menuName": "아메리카노",
            "quantity": 2,
            "unitPrice": 4500,
            "subtotal": 9000
          },
          {
            "menuName": "카페라떼",
            "quantity": 1,
            "unitPrice": 5000,
            "subtotal": 5000
          }
        ],
        "orderedAt": "2026-04-30T12:30:00",
        "completedAt": "2026-04-30T14:30:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 15,
    "totalPages": 1,
    "last": true
  },
  "message": null
}
```

---

# 2. Category API

## 2.1 카테고리 목록 조회 (대분류 + 소분류)

```
GET /api/stores/{storeId}/categories
```

**권한**: MANAGER, TABLE (고객)

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "음료",
      "displayOrder": 1,
      "subCategories": [
        {
          "id": 10,
          "name": "커피",
          "displayOrder": 1
        },
        {
          "id": 11,
          "name": "주스",
          "displayOrder": 2
        }
      ]
    },
    {
      "id": 2,
      "name": "식사",
      "displayOrder": 2,
      "subCategories": [
        {
          "id": 20,
          "name": "한식",
          "displayOrder": 1
        }
      ]
    }
  ],
  "message": null
}
```

---

## 2.2 대분류 카테고리 생성

```
POST /api/stores/{storeId}/categories
```

**권한**: MANAGER

**Request Body**:
```json
{
  "name": "음료",
  "displayOrder": 1
}
```

| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| name | String | ✅ | 1~50자 |
| displayOrder | Integer | ❌ | 기본값 0, 0 이상 |

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "음료",
    "displayOrder": 1,
    "subCategories": [],
    "createdAt": "2026-04-30T09:00:00"
  },
  "message": null
}
```

---

## 2.3 소분류 카테고리 생성

```
POST /api/stores/{storeId}/categories/{categoryId}/subcategories
```

**권한**: MANAGER

**Request Body**:
```json
{
  "name": "커피",
  "displayOrder": 1
}
```

| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| name | String | ✅ | 1~50자 |
| displayOrder | Integer | ❌ | 기본값 0, 0 이상 |

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "categoryId": 1,
    "name": "커피",
    "displayOrder": 1,
    "createdAt": "2026-04-30T09:00:00"
  },
  "message": null
}
```

---

## 2.4 카테고리 수정

```
PUT /api/stores/{storeId}/categories/{categoryId}
```

**권한**: MANAGER

**Request Body**:
```json
{
  "name": "음료수",
  "displayOrder": 2
}
```

**Response 200**: 수정된 카테고리 (2.2 Response와 동일 구조)

---

## 2.5 카테고리 삭제

```
DELETE /api/stores/{storeId}/categories/{categoryId}
```

**권한**: MANAGER

**Response 204**: No Content

**Error 409**:
```json
{
  "success": false,
  "data": null,
  "message": "하위 소분류가 존재하여 삭제할 수 없습니다",
  "errorCode": "CONFLICT"
}
```

---


# 3. Menu API

## 3.1 메뉴 목록 조회

```
GET /api/stores/{storeId}/menus
```

**권한**: MANAGER, TABLE (고객)

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|:----:|--------|------|
| subCategoryId | Long | ❌ | - | 소분류 카테고리 필터 |
| categoryId | Long | ❌ | - | 대분류 카테고리 필터 |

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노",
      "price": 4500,
      "description": "깊고 진한 에스프레소에 물을 더한 클래식 커피",
      "imageUrl": "https://s3.amazonaws.com/bucket/stores/1/menus/abc123.jpg",
      "subCategoryId": 10,
      "subCategoryName": "커피",
      "categoryId": 1,
      "categoryName": "음료",
      "displayOrder": 1,
      "isAvailable": true
    },
    {
      "id": 2,
      "name": "카페라떼",
      "price": 5000,
      "description": "부드러운 우유와 에스프레소의 조화",
      "imageUrl": "https://s3.amazonaws.com/bucket/stores/1/menus/def456.jpg",
      "subCategoryId": 10,
      "subCategoryName": "커피",
      "categoryId": 1,
      "categoryName": "음료",
      "displayOrder": 2,
      "isAvailable": true
    }
  ],
  "message": null
}
```

---

## 3.2 메뉴 상세 조회

```
GET /api/stores/{storeId}/menus/{menuId}
```

**권한**: MANAGER, TABLE (고객)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "아메리카노",
    "price": 4500,
    "description": "깊고 진한 에스프레소에 물을 더한 클래식 커피",
    "imageUrl": "https://s3.amazonaws.com/bucket/stores/1/menus/abc123.jpg",
    "subCategoryId": 10,
    "subCategoryName": "커피",
    "categoryId": 1,
    "categoryName": "음료",
    "displayOrder": 1,
    "isAvailable": true,
    "createdAt": "2026-04-01T09:00:00",
    "updatedAt": "2026-04-15T10:30:00"
  },
  "message": null
}
```

**Error 404**:
```json
{
  "success": false,
  "data": null,
  "message": "메뉴를 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 3.3 메뉴 등록

```
POST /api/stores/{storeId}/menus
```

**권한**: MANAGER

**Request Body**:
```json
{
  "subCategoryId": 10,
  "name": "아메리카노",
  "price": 4500,
  "description": "깊고 진한 에스프레소에 물을 더한 클래식 커피"
}
```

| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| subCategoryId | Long | ✅ | 존재하는 소분류 ID |
| name | String | ✅ | 1~100자 |
| price | Integer | ✅ | 100 이상 |
| description | String | ❌ | 최대 500자 |

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "아메리카노",
    "price": 4500,
    "description": "깊고 진한 에스프레소에 물을 더한 클래식 커피",
    "imageUrl": null,
    "subCategoryId": 10,
    "subCategoryName": "커피",
    "categoryId": 1,
    "categoryName": "음료",
    "displayOrder": 1,
    "isAvailable": true,
    "createdAt": "2026-04-30T09:00:00",
    "updatedAt": "2026-04-30T09:00:00"
  },
  "message": null
}
```

**Error 400** (검증 실패):
```json
{
  "success": false,
  "data": null,
  "message": "유효한 가격을 입력해주세요 (100원 이상)",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 3.4 메뉴 수정

```
PUT /api/stores/{storeId}/menus/{menuId}
```

**권한**: MANAGER

**Request Body**:
```json
{
  "subCategoryId": 10,
  "name": "아메리카노 (HOT)",
  "price": 4800,
  "description": "깊고 진한 에스프레소에 뜨거운 물을 더한 클래식 커피",
  "isAvailable": true
}
```

| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| subCategoryId | Long | ❌ | 존재하는 소분류 ID |
| name | String | ❌ | 1~100자 |
| price | Integer | ❌ | 100 이상 |
| description | String | ❌ | 최대 500자 |
| isAvailable | Boolean | ❌ | - |

**Response 200**: 수정된 메뉴 (3.3 Response와 동일 구조)

---

## 3.5 메뉴 삭제

```
DELETE /api/stores/{storeId}/menus/{menuId}
```

**권한**: MANAGER

**Response 204**: No Content

---

## 3.6 메뉴 노출 순서 변경

```
PUT /api/stores/{storeId}/menus/order
```

**권한**: MANAGER

**Request Body**:
```json
{
  "menuOrders": [
    { "menuId": 1, "displayOrder": 1 },
    { "menuId": 2, "displayOrder": 2 },
    { "menuId": 3, "displayOrder": 3 }
  ]
}
```

| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| menuOrders | Array | ✅ | 최소 1개 |
| menuOrders[].menuId | Long | ✅ | 존재하는 메뉴 ID |
| menuOrders[].displayOrder | Integer | ✅ | 0 이상 |

**Response 200**:
```json
{
  "success": true,
  "data": null,
  "message": "메뉴 순서가 변경되었습니다"
}
```

---

## 3.7 메뉴 이미지 업로드

```
POST /api/stores/{storeId}/menus/{menuId}/image
```

**권한**: MANAGER

**Content-Type**: multipart/form-data

**Request**:
| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| image | File | ✅ | jpg/jpeg/png/gif/webp, 최대 5MB |

**Response 200**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://s3.amazonaws.com/bucket/stores/1/menus/abc123.jpg"
  },
  "message": null
}
```

**Error 400** (파일 형식):
```json
{
  "success": false,
  "data": null,
  "message": "지원하지 않는 파일 형식입니다 (jpg, jpeg, png, gif, webp만 허용)",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error 400** (파일 크기):
```json
{
  "success": false,
  "data": null,
  "message": "파일 크기가 5MB를 초과합니다",
  "errorCode": "VALIDATION_ERROR"
}
```

---


# 4. Order API

## 4.1 주문 생성

```
POST /api/stores/{storeId}/orders
```

**권한**: TABLE (고객)

**Request Body**:
```json
{
  "tableId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2
    },
    {
      "menuItemId": 3,
      "quantity": 1
    }
  ]
}
```

| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| tableId | Long | ✅ | 존재하는 테이블 ID |
| items | Array | ✅ | 최소 1개 |
| items[].menuItemId | Long | ✅ | 존재하고 판매 가능한 메뉴 ID |
| items[].quantity | Integer | ✅ | 1 이상 |

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "orderNumber": "20260430-123045-X7K2",
    "tableId": 1,
    "tableNumber": "A1",
    "sessionId": 10,
    "status": "PENDING",
    "items": [
      {
        "id": 1001,
        "menuItemId": 1,
        "menuName": "아메리카노",
        "quantity": 2,
        "unitPrice": 4500,
        "subtotal": 9000
      },
      {
        "id": 1002,
        "menuItemId": 3,
        "menuName": "오렌지주스",
        "quantity": 1,
        "unitPrice": 6000,
        "subtotal": 6000
      }
    ],
    "totalAmount": 15000,
    "createdAt": "2026-04-30T12:30:45"
  },
  "message": null
}
```

**Error 400** (빈 주문):
```json
{
  "success": false,
  "data": null,
  "message": "주문 항목이 비어있습니다",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error 400** (판매 불가 메뉴):
```json
{
  "success": false,
  "data": null,
  "message": "판매 중지된 메뉴가 포함되어 있습니다: 아메리카노",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 4.2 주문 목록 조회

```
GET /api/stores/{storeId}/orders
```

**권한**: MANAGER, STAFF, TABLE (고객)

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|:----:|--------|------|
| tableId | Long | ❌ | - | 테이블 필터 |
| sessionId | Long | ❌ | - | 세션 필터 (고객용) |
| status | String | ❌ | - | 상태 필터 (PENDING/ACCEPTED/PREPARING/COMPLETED) |
| page | Integer | ❌ | 0 | 페이지 번호 |
| size | Integer | ❌ | 20 | 페이지 크기 |

**참고**: TABLE 역할은 자동으로 본인 tableId + 현재 sessionId로 필터링됨

**Response 200**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 100,
        "orderNumber": "20260430-123045-X7K2",
        "tableId": 1,
        "tableNumber": "A1",
        "sessionId": 10,
        "status": "PENDING",
        "items": [
          {
            "id": 1001,
            "menuItemId": 1,
            "menuName": "아메리카노",
            "quantity": 2,
            "unitPrice": 4500,
            "subtotal": 9000
          }
        ],
        "totalAmount": 15000,
        "createdAt": "2026-04-30T12:30:45"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1,
    "last": true
  },
  "message": null
}
```

---

## 4.3 주문 상세 조회

```
GET /api/stores/{storeId}/orders/{orderId}
```

**권한**: MANAGER, STAFF, TABLE (고객 — 본인 테이블만)

**Response 200**: 4.1 Response의 data와 동일 구조

**Error 404**:
```json
{
  "success": false,
  "data": null,
  "message": "주문을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

## 4.4 주문 상태 변경

```
PUT /api/stores/{storeId}/orders/{orderId}/status
```

**권한**: MANAGER, STAFF

**Request Body**:
```json
{
  "status": "ACCEPTED"
}
```

| 필드 | 타입 | 필수 | 검증 |
|------|------|:----:|------|
| status | String | ✅ | ACCEPTED, PREPARING, COMPLETED 중 하나 |

**상태 전이 규칙**:
| 현재 상태 | 허용되는 다음 상태 |
|-----------|-------------------|
| PENDING | ACCEPTED |
| ACCEPTED | PREPARING |
| PREPARING | COMPLETED |
| COMPLETED | (변경 불가) |

**Response 200**: 변경된 주문 (4.1 Response의 data와 동일 구조, status 변경됨)

**Error 400** (잘못된 상태 전이):
```json
{
  "success": false,
  "data": null,
  "message": "유효하지 않은 상태 변경입니다 (PENDING → PREPARING 불가, ACCEPTED를 거쳐야 합니다)",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 4.5 주문 삭제

```
DELETE /api/stores/{storeId}/orders/{orderId}
```

**권한**: MANAGER, STAFF

**Response 204**: No Content

**Error 404**:
```json
{
  "success": false,
  "data": null,
  "message": "주문을 찾을 수 없습니다",
  "errorCode": "NOT_FOUND"
}
```

---

# 5. SSE API

## 5.1 실시간 주문 알림 구독

```
GET /api/stores/{storeId}/orders/subscribe
```

**권한**: MANAGER, STAFF

**Content-Type**: text/event-stream

**SSE 이벤트 형식**:

### NEW_ORDER (신규 주문)
```
event: NEW_ORDER
data: {
  "id": 100,
  "orderNumber": "20260430-123045-X7K2",
  "tableId": 1,
  "tableNumber": "A1",
  "sessionId": 10,
  "status": "PENDING",
  "items": [
    {
      "id": 1001,
      "menuItemId": 1,
      "menuName": "아메리카노",
      "quantity": 2,
      "unitPrice": 4500,
      "subtotal": 9000
    }
  ],
  "totalAmount": 15000,
  "createdAt": "2026-04-30T12:30:45"
}
```

### ORDER_STATUS_CHANGED (상태 변경)
```
event: ORDER_STATUS_CHANGED
data: {
  "id": 100,
  "orderNumber": "20260430-123045-X7K2",
  "tableId": 1,
  "tableNumber": "A1",
  "status": "ACCEPTED",
  "previousStatus": "PENDING",
  "updatedAt": "2026-04-30T12:32:00"
}
```

### ORDER_DELETED (주문 삭제)
```
event: ORDER_DELETED
data: {
  "orderId": 100,
  "tableId": 1,
  "tableNumber": "A1",
  "deletedAt": "2026-04-30T12:35:00"
}
```

### TABLE_RESET (이용 완료)
```
event: TABLE_RESET
data: {
  "tableId": 1,
  "tableNumber": "A1",
  "completedAt": "2026-04-30T14:30:00"
}
```

### HEARTBEAT (연결 유지)
```
event: HEARTBEAT
data: {"timestamp": "2026-04-30T12:30:00"}
```
- 30초마다 전송
- 클라이언트 연결 상태 확인용

**연결 관리**:
- 타임아웃: 30분
- 타임아웃 후 클라이언트에서 자동 재연결
- 연결 끊김 시 서버에서 구독자 목록 자동 정리

---

# 6. Dashboard 집계 API

## 6.1 대시보드 데이터 조회

```
GET /api/stores/{storeId}/dashboard
```

**권한**: MANAGER, STAFF

**Response 200**:
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "tableId": 1,
        "tableNumber": "A1",
        "hasActiveSession": true,
        "totalOrderAmount": 45000,
        "orderCount": 3,
        "latestOrders": [
          {
            "id": 102,
            "orderNumber": "20260430-133000-Y8L3",
            "status": "PENDING",
            "totalAmount": 15000,
            "itemSummary": "아메리카노 x2, 카페라떼 x1",
            "createdAt": "2026-04-30T13:30:00"
          },
          {
            "id": 101,
            "orderNumber": "20260430-123045-X7K2",
            "status": "PREPARING",
            "totalAmount": 20000,
            "itemSummary": "비빔밥 x1, 된장찌개 x1",
            "createdAt": "2026-04-30T12:30:45"
          }
        ]
      },
      {
        "tableId": 2,
        "tableNumber": "A2",
        "hasActiveSession": false,
        "totalOrderAmount": 0,
        "orderCount": 0,
        "latestOrders": []
      }
    ]
  },
  "message": null
}
```

**참고**: `latestOrders`는 최신 3개까지만 포함. `itemSummary`는 "메뉴명 x수량" 형식의 축약 문자열.

---
