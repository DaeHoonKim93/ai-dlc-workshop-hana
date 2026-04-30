# Unit 1: Backend-Core - API 명세서

> **목적**: Unit 3 (Frontend-Customer), Unit 4 (Frontend-Admin) 개발자가 병렬로 개발할 수 있도록
> Backend API의 엔드포인트, Request/Response 스키마, 에러 코드를 정의합니다.
>
> **Base URL**: `/api`
>
> **공통 Response Wrapper**:
> ```json
> {
>   "success": true,
>   "data": { ... },
>   "error": null
> }
> ```
> 에러 시:
> ```json
> {
>   "success": false,
>   "data": null,
>   "error": {
>     "code": "ERROR_CODE",
>     "message": "에러 메시지"
>   }
> }
> ```

---

## 공통 사항

### 인증 헤더
모든 인증 필요 API는 아래 헤더를 포함해야 합니다:
```
Authorization: Bearer {accessToken}
```

### 매장 격리 (Store Isolation)
- 모든 `/api/stores/{storeId}/**` 요청에서 JWT의 `storeId`와 URL의 `storeId` 일치 여부를 검증합니다.
- 불일치 시 `403 Forbidden` 반환

### 공통 에러 코드
| HTTP Status | 에러 코드 | 설명 |
|-------------|-----------|------|
| 400 | `VALIDATION_ERROR` | 요청 데이터 검증 실패 |
| 401 | `AUTHENTICATION_FAILED` | 인증 실패 (토큰 없음/만료) |
| 403 | `ACCESS_DENIED` | 권한 없음 / 매장 격리 위반 |
| 404 | `RESOURCE_NOT_FOUND` | 리소스를 찾을 수 없음 |
| 409 | `DUPLICATE_RESOURCE` | 중복 리소스 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

### 페이지네이션 Response 구조
```json
{
  "content": [ ... ],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

# 🔐 1. 인증 API (Auth)

## 1.1 관리자 로그인

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/auth/admin/login` |
| **인증** | 불필요 |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "storeCode": "string",   // NOT NULL, 1~50자
  "username": "string",     // NOT NULL, 1~50자
  "password": "string"      // NOT NULL, 8자 이상
}
```

### Response (200 OK)
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "role": "MANAGER | STAFF",
  "storeId": 1,
  "staffId": 1
}
```

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 401 | `AUTHENTICATION_FAILED` | 매장 없음 / 직원 없음 / 비밀번호 불일치 |
| 401 | `ACCOUNT_LOCKED` | 5회 연속 실패로 계정 잠금 (15분) |
| 400 | `VALIDATION_ERROR` | 필수 필드 누락 또는 형식 오류 |

---

## 1.2 태블릿 로그인

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/auth/table/login` |
| **인증** | 불필요 |
| **사용 Unit** | **Unit 3** (Frontend-Customer) |

### Request Body
```json
{
  "storeCode": "string",     // NOT NULL, 1~50자
  "tableNumber": "string",   // NOT NULL, 1~20자
  "password": "string"        // NOT NULL, 8자 이상
}
```

### Response (200 OK)
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "role": "TABLE",
  "storeId": 1,
  "tableId": 1
}
```

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 401 | `AUTHENTICATION_FAILED` | 매장 없음 / 테이블 없음 / 비밀번호 불일치 |
| 401 | `ACCOUNT_LOCKED` | 5회 연속 실패로 계정 잠금 (15분) |
| 400 | `VALIDATION_ERROR` | 필수 필드 누락 또는 형식 오류 |

---

## 1.3 토큰 갱신

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/auth/refresh` |
| **인증** | 불필요 (refreshToken 사용) |
| **사용 Unit** | **Unit 3**, **Unit 4** |

### Request Body
```json
{
  "refreshToken": "string"
}
```

### Response (200 OK)
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 401 | `TOKEN_EXPIRED` | Refresh Token 만료 |
| 401 | `INVALID_TOKEN` | 유효하지 않은 토큰 |

---

## 1.4 로그아웃

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/auth/logout` |
| **인증** | 필요 |
| **사용 Unit** | **Unit 3**, **Unit 4** |

### Response (200 OK)
```json
{
  "message": "로그아웃 되었습니다"
}
```

---

# 👤 2. 직원 관리 API (Staff)

> **접근 권한**: MANAGER 전용

## 2.1 직원 목록 조회

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/staff` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Response (200 OK)
```json
[
  {
    "id": 1,
    "username": "string",
    "role": "MANAGER | STAFF",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00"
  }
]
```

---

## 2.2 직원 등록

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/stores/{storeId}/staff` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "username": "string",   // NOT NULL, 1~50자, 영문+숫자만
  "password": "string",   // NOT NULL, 8자 이상
  "role": "MANAGER | STAFF"  // NOT NULL
}
```

### Response (201 Created)
```json
{
  "id": 1,
  "username": "string",
  "role": "MANAGER",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00"
}
```

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 409 | `DUPLICATE_RESOURCE` | 동일 매장 내 username 중복 |
| 400 | `VALIDATION_ERROR` | 필수 필드 누락 또는 형식 오류 |

---

## 2.3 직원 수정

| 항목 | 값 |
|------|-----|
| **Method** | `PUT` |
| **Path** | `/api/stores/{storeId}/staff/{staffId}` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "username": "string",   // optional, 1~50자, 영문+숫자만
  "password": "string",   // optional, 8자 이상
  "role": "MANAGER | STAFF"  // optional
}
```

### Response (200 OK)
```json
{
  "id": 1,
  "username": "string",
  "role": "STAFF",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00"
}
```

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 404 | `RESOURCE_NOT_FOUND` | 직원을 찾을 수 없음 |
| 409 | `DUPLICATE_RESOURCE` | 변경하려는 username 중복 |

---

## 2.4 직원 삭제 (비활성화)

| 항목 | 값 |
|------|-----|
| **Method** | `DELETE` |
| **Path** | `/api/stores/{storeId}/staff/{staffId}` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Response (204 No Content)
(응답 본문 없음)

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 404 | `RESOURCE_NOT_FOUND` | 직원을 찾을 수 없음 |
| 400 | `SELF_DELETE_NOT_ALLOWED` | 자기 자신 삭제 시도 |

---

# 🪑 3. 테이블 관리 API (Table)

## 3.1 테이블 목록 조회

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/tables` |
| **인증** | 필요 (MANAGER, STAFF) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Response (200 OK)
```json
[
  {
    "id": 1,
    "tableNumber": "A1",
    "isActive": true,
    "hasActiveSession": true,
    "currentSessionId": 10,
    "createdAt": "2025-01-01T00:00:00"
  }
]
```

---

## 3.2 테이블 등록 (초기 설정)

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/stores/{storeId}/tables` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "tableNumber": "string",  // NOT NULL, 1~20자
  "password": "string"       // NOT NULL, 8자 이상
}
```

### Response (201 Created)
```json
{
  "id": 1,
  "tableNumber": "A1",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00"
}
```

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 409 | `DUPLICATE_RESOURCE` | 동일 매장 내 테이블 번호 중복 |
| 400 | `VALIDATION_ERROR` | 필수 필드 누락 또는 형식 오류 |

---

## 3.3 이용 완료 처리

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/stores/{storeId}/tables/{tableId}/complete` |
| **인증** | 필요 (MANAGER, STAFF) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Response (200 OK)
```json
{
  "message": "이용 완료 처리되었습니다"
}
```

### 처리 내용
1. 현재 활성 세션의 모든 주문 → OrderHistory로 이동
2. 현재 세션의 Order + OrderItem 삭제
3. TableSession 종료 (isActive = false)
4. SSE 알림 전송 (TABLE_RESET)

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 404 | `RESOURCE_NOT_FOUND` | 테이블을 찾을 수 없음 |
| 400 | `NO_ACTIVE_SESSION` | 활성 세션이 없음 |

---

## 3.4 과거 주문 내역 조회

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/tables/{tableId}/history` |
| **인증** | 필요 (MANAGER, STAFF) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| startDate | String (yyyy-MM-dd) | N | 조회 시작일 |
| endDate | String (yyyy-MM-dd) | N | 조회 종료일 |
| page | Integer | N | 페이지 번호 (default: 0) |
| size | Integer | N | 페이지 크기 (default: 20) |

### Response (200 OK)
```json
{
  "content": [
    {
      "id": 1,
      "orderNumber": "20250101-143022-A1B2",
      "totalAmount": 35000,
      "status": "COMPLETED",
      "orderItems": [
        {
          "menuName": "김치찌개",
          "quantity": 2,
          "unitPrice": 9000,
          "subtotal": 18000
        },
        {
          "menuName": "공기밥",
          "quantity": 2,
          "unitPrice": 1000,
          "subtotal": 2000
        }
      ],
      "orderedAt": "2025-01-01T14:30:22",
      "completedAt": "2025-01-01T16:00:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 50,
  "totalPages": 3,
  "first": true,
  "last": false
}
```

---

# 📂 4. 카테고리 API (Category)

## 4.1 카테고리 목록 조회 (대분류 + 소분류)

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/categories` |
| **인증** | 필요 (MANAGER, TABLE) |
| **사용 Unit** | **Unit 3** (메뉴 탐색), **Unit 4** (메뉴 관리) |

### Response (200 OK)
```json
[
  {
    "id": 1,
    "name": "메인 메뉴",
    "displayOrder": 1,
    "subCategories": [
      {
        "id": 10,
        "name": "찌개류",
        "displayOrder": 1
      },
      {
        "id": 11,
        "name": "볶음류",
        "displayOrder": 2
      }
    ]
  }
]
```

---

## 4.2 대분류 카테고리 생성

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/stores/{storeId}/categories` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "name": "string",         // NOT NULL, 1~50자
  "displayOrder": 0          // optional, default: 마지막+1
}
```

### Response (201 Created)
```json
{
  "id": 1,
  "name": "메인 메뉴",
  "displayOrder": 1,
  "subCategories": []
}
```

---

## 4.3 소분류 카테고리 생성

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/stores/{storeId}/categories/{categoryId}/subcategories` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "name": "string",         // NOT NULL, 1~50자
  "displayOrder": 0          // optional, default: 마지막+1
}
```

### Response (201 Created)
```json
{
  "id": 10,
  "name": "찌개류",
  "displayOrder": 1
}
```

---

## 4.4 카테고리 수정

| 항목 | 값 |
|------|-----|
| **Method** | `PUT` |
| **Path** | `/api/stores/{storeId}/categories/{categoryId}` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "name": "string",         // optional, 1~50자
  "displayOrder": 0          // optional
}
```

### Response (200 OK)
```json
{
  "id": 1,
  "name": "수정된 카테고리명",
  "displayOrder": 2,
  "subCategories": [ ... ]
}
```

---

## 4.5 카테고리 삭제

| 항목 | 값 |
|------|-----|
| **Method** | `DELETE` |
| **Path** | `/api/stores/{storeId}/categories/{categoryId}` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Response (204 No Content)
(응답 본문 없음)

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 400 | `HAS_CHILDREN` | 하위 소분류가 존재하여 삭제 불가 |
| 404 | `RESOURCE_NOT_FOUND` | 카테고리를 찾을 수 없음 |

---

# 🍽️ 5. 메뉴 API (Menu)

## 5.1 메뉴 목록 조회

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/menus` |
| **인증** | 필요 (MANAGER, TABLE) |
| **사용 Unit** | **Unit 3** (메뉴 조회), **Unit 4** (메뉴 관리) |

### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| subCategoryId | Long | N | 소분류 카테고리 ID로 필터 |

### Response (200 OK)
```json
[
  {
    "id": 1,
    "subCategoryId": 10,
    "name": "김치찌개",
    "price": 9000,
    "description": "돼지고기 김치찌개",
    "imageUrl": "https://s3.../stores/1/menus/abc123.jpg",
    "displayOrder": 1,
    "isAvailable": true,
    "createdAt": "2025-01-01T00:00:00"
  }
]
```

---

## 5.2 메뉴 상세 조회

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/menus/{menuId}` |
| **인증** | 필요 (MANAGER, TABLE) |
| **사용 Unit** | **Unit 3** (메뉴 상세), **Unit 4** (메뉴 수정) |

### Response (200 OK)
```json
{
  "id": 1,
  "subCategoryId": 10,
  "name": "김치찌개",
  "price": 9000,
  "description": "돼지고기 김치찌개",
  "imageUrl": "https://s3.../stores/1/menus/abc123.jpg",
  "displayOrder": 1,
  "isAvailable": true,
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

---

## 5.3 메뉴 등록

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/stores/{storeId}/menus` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "subCategoryId": 10,       // NOT NULL
  "name": "string",          // NOT NULL, 1~100자
  "price": 9000,             // NOT NULL, 100 이상 (정수)
  "description": "string"    // optional, 최대 500자
}
```

### Response (201 Created)
```json
{
  "id": 1,
  "subCategoryId": 10,
  "name": "김치찌개",
  "price": 9000,
  "description": "돼지고기 김치찌개",
  "imageUrl": null,
  "displayOrder": 1,
  "isAvailable": true,
  "createdAt": "2025-01-01T00:00:00"
}
```

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 404 | `RESOURCE_NOT_FOUND` | 소분류 카테고리를 찾을 수 없음 |
| 400 | `VALIDATION_ERROR` | 가격 100원 미만 / 필수 필드 누락 |

---

## 5.4 메뉴 수정

| 항목 | 값 |
|------|-----|
| **Method** | `PUT` |
| **Path** | `/api/stores/{storeId}/menus/{menuId}` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "subCategoryId": 10,       // optional
  "name": "string",          // optional, 1~100자
  "price": 10000,            // optional, 100 이상
  "description": "string",   // optional, 최대 500자
  "isAvailable": true         // optional
}
```

### Response (200 OK)
```json
{
  "id": 1,
  "subCategoryId": 10,
  "name": "김치찌개 (매운맛)",
  "price": 10000,
  "description": "매운 돼지고기 김치찌개",
  "imageUrl": "https://s3.../stores/1/menus/abc123.jpg",
  "displayOrder": 1,
  "isAvailable": true,
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-20T14:00:00"
}
```

---

## 5.5 메뉴 삭제

| 항목 | 값 |
|------|-----|
| **Method** | `DELETE` |
| **Path** | `/api/stores/{storeId}/menus/{menuId}` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Response (204 No Content)
(응답 본문 없음)

---

## 5.6 메뉴 노출 순서 변경

| 항목 | 값 |
|------|-----|
| **Method** | `PUT` |
| **Path** | `/api/stores/{storeId}/menus/order` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
[
  { "menuId": 1, "displayOrder": 1 },
  { "menuId": 2, "displayOrder": 2 },
  { "menuId": 3, "displayOrder": 3 }
]
```

### Response (200 OK)
```json
{
  "message": "순서가 변경되었습니다"
}
```

---

## 5.7 메뉴 이미지 업로드

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/stores/{storeId}/menus/{menuId}/image` |
| **Content-Type** | `multipart/form-data` |
| **인증** | 필요 (MANAGER) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| file | MultipartFile | 이미지 파일 (jpg, jpeg, png, gif, webp / 최대 5MB) |

### Response (200 OK)
```json
{
  "imageUrl": "https://s3.../stores/1/menus/uuid123.jpg"
}
```

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 400 | `INVALID_FILE_TYPE` | 허용되지 않는 파일 형식 |
| 400 | `FILE_TOO_LARGE` | 파일 크기 5MB 초과 |
| 404 | `RESOURCE_NOT_FOUND` | 메뉴를 찾을 수 없음 |

---

# 📋 6. 주문 API (Order)

## 6.1 주문 생성

| 항목 | 값 |
|------|-----|
| **Method** | `POST` |
| **Path** | `/api/stores/{storeId}/orders` |
| **인증** | 필요 (TABLE) |
| **사용 Unit** | **Unit 3** (Frontend-Customer) |

### Request Body
```json
{
  "tableId": 1,                    // NOT NULL
  "items": [                       // NOT NULL, 최소 1개
    {
      "menuItemId": 1,             // NOT NULL
      "quantity": 2                // NOT NULL, 1 이상
    },
    {
      "menuItemId": 3,
      "quantity": 1
    }
  ]
}
```

### Response (201 Created)
```json
{
  "id": 1,
  "orderNumber": "20250101-143022-A1B2",
  "tableId": 1,
  "sessionId": 10,
  "items": [
    {
      "id": 1,
      "menuItemId": 1,
      "menuName": "김치찌개",
      "quantity": 2,
      "unitPrice": 9000,
      "subtotal": 18000
    },
    {
      "id": 2,
      "menuItemId": 3,
      "menuName": "공기밥",
      "quantity": 1,
      "unitPrice": 1000,
      "subtotal": 1000
    }
  ],
  "totalAmount": 19000,
  "status": "PENDING",
  "createdAt": "2025-01-01T14:30:22"
}
```

### 처리 내용
1. 활성 세션이 없으면 자동으로 새 세션 생성 (첫 주문)
2. 메뉴명, 단가를 스냅샷으로 저장 (이후 가격 변경 영향 없음)
3. totalAmount는 서버에서 재계산
4. SSE 알림 전송 (NEW_ORDER)

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 404 | `RESOURCE_NOT_FOUND` | 테이블 또는 메뉴 아이템을 찾을 수 없음 |
| 400 | `MENU_NOT_AVAILABLE` | 판매 불가 메뉴 포함 |
| 400 | `VALIDATION_ERROR` | 빈 주문 / 수량 0 이하 |

---

## 6.2 주문 목록 조회

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/orders` |
| **인증** | 필요 (MANAGER, STAFF, TABLE) |
| **사용 Unit** | **Unit 3** (주문 내역), **Unit 4** (주문 모니터링) |

### Query Parameters
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| tableId | Long | N | 테이블 ID로 필터 |
| sessionId | Long | N | 세션 ID로 필터 |
| status | String | N | 주문 상태로 필터 (PENDING, ACCEPTED, PREPARING, COMPLETED) |

### Response (200 OK)
```json
[
  {
    "id": 1,
    "orderNumber": "20250101-143022-A1B2",
    "tableId": 1,
    "tableNumber": "A1",
    "sessionId": 10,
    "items": [
      {
        "id": 1,
        "menuItemId": 1,
        "menuName": "김치찌개",
        "quantity": 2,
        "unitPrice": 9000,
        "subtotal": 18000
      }
    ],
    "totalAmount": 18000,
    "status": "PENDING",
    "createdAt": "2025-01-01T14:30:22",
    "updatedAt": "2025-01-01T14:30:22"
  }
]
```

### 접근 제어 참고
- **TABLE** 역할: 본인 테이블의 현재 세션 주문만 조회 가능
- **MANAGER/STAFF** 역할: 매장 전체 주문 조회 가능

---

## 6.3 주문 상세 조회

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/orders/{orderId}` |
| **인증** | 필요 (MANAGER, STAFF, TABLE) |
| **사용 Unit** | **Unit 3**, **Unit 4** |

### Response (200 OK)
```json
{
  "id": 1,
  "orderNumber": "20250101-143022-A1B2",
  "tableId": 1,
  "tableNumber": "A1",
  "sessionId": 10,
  "items": [
    {
      "id": 1,
      "menuItemId": 1,
      "menuName": "김치찌개",
      "quantity": 2,
      "unitPrice": 9000,
      "subtotal": 18000
    }
  ],
  "totalAmount": 18000,
  "status": "PENDING",
  "createdAt": "2025-01-01T14:30:22",
  "updatedAt": "2025-01-01T14:30:22"
}
```

---

## 6.4 주문 상태 변경

| 항목 | 값 |
|------|-----|
| **Method** | `PUT` |
| **Path** | `/api/stores/{storeId}/orders/{orderId}/status` |
| **인증** | 필요 (MANAGER, STAFF) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Request Body
```json
{
  "status": "ACCEPTED"   // NOT NULL: ACCEPTED, PREPARING, COMPLETED 중 하나
}
```

### Response (200 OK)
```json
{
  "id": 1,
  "orderNumber": "20250101-143022-A1B2",
  "tableId": 1,
  "tableNumber": "A1",
  "sessionId": 10,
  "items": [ ... ],
  "totalAmount": 18000,
  "status": "ACCEPTED",
  "createdAt": "2025-01-01T14:30:22",
  "updatedAt": "2025-01-01T14:35:00"
}
```

### 상태 전이 규칙
```
PENDING → ACCEPTED → PREPARING → COMPLETED (순방향만)
```
- 역방향 전이 불가
- 단계 건너뛰기 불가 (예: PENDING → PREPARING 불가)
- COMPLETED 상태에서 추가 변경 불가

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 404 | `RESOURCE_NOT_FOUND` | 주문을 찾을 수 없음 |
| 400 | `INVALID_STATUS_TRANSITION` | 유효하지 않은 상태 전이 |

---

## 6.5 주문 삭제

| 항목 | 값 |
|------|-----|
| **Method** | `DELETE` |
| **Path** | `/api/stores/{storeId}/orders/{orderId}` |
| **인증** | 필요 (MANAGER, STAFF) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Response (204 No Content)
(응답 본문 없음)

### 처리 내용
- Order + OrderItem 함께 삭제 (CASCADE)
- 모든 상태의 주문 삭제 가능 (관리자 직권)
- SSE 알림 전송 (ORDER_DELETED)

### 에러 케이스
| HTTP Status | 에러 코드 | 조건 |
|-------------|-----------|------|
| 404 | `RESOURCE_NOT_FOUND` | 주문을 찾을 수 없음 |

---

# 📡 7. SSE 실시간 알림 API

## 7.1 SSE 구독

| 항목 | 값 |
|------|-----|
| **Method** | `GET` |
| **Path** | `/api/stores/{storeId}/orders/subscribe` |
| **Content-Type** | `text/event-stream` |
| **인증** | 필요 (MANAGER, STAFF) |
| **사용 Unit** | **Unit 4** (Frontend-Admin) |

### Response
SSE 스트림 연결 (SseEmitter, timeout: 30분)

### 이벤트 타입 및 데이터 형식

#### NEW_ORDER
```
event: NEW_ORDER
data: {
  "id": 1,
  "orderNumber": "20250101-143022-A1B2",
  "tableId": 1,
  "tableNumber": "A1",
  "items": [...],
  "totalAmount": 18000,
  "status": "PENDING",
  "createdAt": "2025-01-01T14:30:22"
}
```

#### ORDER_STATUS_CHANGED
```
event: ORDER_STATUS_CHANGED
data: {
  "id": 1,
  "orderNumber": "20250101-143022-A1B2",
  "tableId": 1,
  "tableNumber": "A1",
  "items": [...],
  "totalAmount": 18000,
  "status": "ACCEPTED",
  "createdAt": "2025-01-01T14:30:22",
  "updatedAt": "2025-01-01T14:35:00"
}
```

#### ORDER_DELETED
```
event: ORDER_DELETED
data: {
  "orderId": 1,
  "tableId": 1
}
```

#### TABLE_RESET
```
event: TABLE_RESET
data: {
  "tableId": 1
}
```

### 연결 관리
- 타임아웃: 30분
- 타임아웃 후 클라이언트 측 자동 재연결 필요
- 연결 끊김 시 서버에서 구독자 목록 자동 제거

---

---
---

# 📌 Unit별 API 사용 매핑

> 아래는 Unit 3 (Frontend-Customer)과 Unit 4 (Frontend-Admin) 개발자가 각각 연동해야 하는 API를 정리한 것입니다.

---

## Unit 3: Frontend-Customer (고객 태블릿) 사용 API

고객 태블릿에서 사용하는 API 목록입니다. 인증 후 `role=TABLE`로 동작합니다.

| # | API | Method | Path | 설명 |
|---|-----|--------|------|------|
| 1 | 태블릿 로그인 | POST | `/api/auth/table/login` | 매장코드 + 테이블번호 + 비밀번호 |
| 2 | 토큰 갱신 | POST | `/api/auth/refresh` | Access Token 만료 시 갱신 |
| 3 | 로그아웃 | POST | `/api/auth/logout` | 로그아웃 |
| 4 | 카테고리 목록 조회 | GET | `/api/stores/{storeId}/categories` | 대분류 + 소분류 계층 조회 |
| 5 | 메뉴 목록 조회 | GET | `/api/stores/{storeId}/menus?subCategoryId=X` | 소분류별 메뉴 목록 |
| 6 | 메뉴 상세 조회 | GET | `/api/stores/{storeId}/menus/{menuId}` | 메뉴 상세 정보 |
| 7 | 주문 생성 | POST | `/api/stores/{storeId}/orders` | 장바구니 → 주문 전환 |
| 8 | 주문 목록 조회 | GET | `/api/stores/{storeId}/orders?tableId=X&sessionId=Y` | 현재 세션 주문 내역 |

### Unit 3 주요 플로우
```
[로그인] → 토큰 저장 → [카테고리 조회] → [메뉴 조회] → 장바구니(로컬) → [주문 생성] → [주문 내역 조회]
```

### Unit 3 참고사항
- TABLE 역할은 본인 테이블의 현재 세션 주문만 조회 가능
- 장바구니는 클라이언트 로컬 스토리지에서 관리 (서버 API 없음)
- 주문 생성 시 활성 세션이 없으면 서버에서 자동 생성
- Access Token 만료 시 Refresh Token으로 자동 갱신 로직 필요

---

## Unit 4: Frontend-Admin (관리자 웹) 사용 API

관리자 웹에서 사용하는 API 목록입니다. `role=MANAGER` 또는 `role=STAFF`로 동작합니다.

| # | API | Method | Path | 권한 | 설명 |
|---|-----|--------|------|------|------|
| **인증** | | | | | |
| 1 | 관리자 로그인 | POST | `/api/auth/admin/login` | ALL | 매장코드 + 사용자명 + 비밀번호 |
| 2 | 토큰 갱신 | POST | `/api/auth/refresh` | ALL | Access Token 갱신 |
| 3 | 로그아웃 | POST | `/api/auth/logout` | ALL | 로그아웃 |
| **주문 관리** | | | | | |
| 4 | 주문 목록 조회 | GET | `/api/stores/{storeId}/orders` | M, S | 전체 주문 목록 |
| 5 | 주문 상세 조회 | GET | `/api/stores/{storeId}/orders/{orderId}` | M, S | 주문 상세 |
| 6 | 주문 상태 변경 | PUT | `/api/stores/{storeId}/orders/{orderId}/status` | M, S | PENDING→ACCEPTED→PREPARING→COMPLETED |
| 7 | 주문 삭제 | DELETE | `/api/stores/{storeId}/orders/{orderId}` | M, S | 주문 직권 삭제 |
| 8 | SSE 구독 | GET | `/api/stores/{storeId}/orders/subscribe` | M, S | 실시간 주문 알림 |
| **테이블 관리** | | | | | |
| 9 | 테이블 목록 조회 | GET | `/api/stores/{storeId}/tables` | M, S | 테이블 목록 |
| 10 | 테이블 등록 | POST | `/api/stores/{storeId}/tables` | M | 테이블 초기 설정 |
| 11 | 이용 완료 | POST | `/api/stores/{storeId}/tables/{tableId}/complete` | M, S | 세션 종료 + 이력 이동 |
| 12 | 과거 내역 조회 | GET | `/api/stores/{storeId}/tables/{tableId}/history` | M, S | 과거 주문 이력 |
| **메뉴 관리** | | | | | |
| 13 | 카테고리 목록 조회 | GET | `/api/stores/{storeId}/categories` | M | 카테고리 계층 조회 |
| 14 | 대분류 생성 | POST | `/api/stores/{storeId}/categories` | M | 대분류 카테고리 생성 |
| 15 | 소분류 생성 | POST | `/api/stores/{storeId}/categories/{id}/subcategories` | M | 소분류 카테고리 생성 |
| 16 | 카테고리 수정 | PUT | `/api/stores/{storeId}/categories/{id}` | M | 카테고리 수정 |
| 17 | 카테고리 삭제 | DELETE | `/api/stores/{storeId}/categories/{id}` | M | 카테고리 삭제 |
| 18 | 메뉴 목록 조회 | GET | `/api/stores/{storeId}/menus` | M | 메뉴 목록 |
| 19 | 메뉴 상세 조회 | GET | `/api/stores/{storeId}/menus/{menuId}` | M | 메뉴 상세 |
| 20 | 메뉴 등록 | POST | `/api/stores/{storeId}/menus` | M | 메뉴 등록 |
| 21 | 메뉴 수정 | PUT | `/api/stores/{storeId}/menus/{menuId}` | M | 메뉴 수정 |
| 22 | 메뉴 삭제 | DELETE | `/api/stores/{storeId}/menus/{menuId}` | M | 메뉴 삭제 |
| 23 | 순서 변경 | PUT | `/api/stores/{storeId}/menus/order` | M | 메뉴 노출 순서 |
| 24 | 이미지 업로드 | POST | `/api/stores/{storeId}/menus/{menuId}/image` | M | 메뉴 이미지 S3 업로드 |
| **직원 관리** | | | | | |
| 25 | 직원 목록 조회 | GET | `/api/stores/{storeId}/staff` | M | 직원 목록 |
| 26 | 직원 등록 | POST | `/api/stores/{storeId}/staff` | M | 직원 등록 |
| 27 | 직원 수정 | PUT | `/api/stores/{storeId}/staff/{staffId}` | M | 직원 수정 |
| 28 | 직원 삭제 | DELETE | `/api/stores/{storeId}/staff/{staffId}` | M | 직원 비활성화 |

> **M** = MANAGER, **S** = STAFF

### Unit 4 주요 플로우
```
[관리자 로그인] → [SSE 구독] → [대시보드: 주문 목록 조회 + 실시간 업데이트]
                              → [주문 상태 변경 / 삭제]
                              → [테이블 관리: 등록, 이용 완료, 과거 내역]
                              → [메뉴 관리: CRUD + 이미지 업로드]
                              → [직원 관리: CRUD] (MANAGER 전용)
```

### Unit 4 역할별 UI 분기
- **MANAGER**: 모든 기능 접근 가능
- **STAFF**: 주문 모니터링, 상태 변경, 주문 삭제, 테이블 이용 완료, 과거 내역 조회만 가능
- 메뉴 관리, 직원 관리, 테이블 등록은 MANAGER 전용 → STAFF에게는 메뉴/네비게이션 숨김 처리

---

# 📎 부록: JWT Token 구조

### Access Token Payload
```json
{
  "sub": "1",                    // staffId 또는 tableId
  "storeId": 1,
  "role": "MANAGER | STAFF | TABLE",
  "type": "ACCESS",
  "iat": 1704067200,
  "exp": 1704124800              // 16시간 후
}
```

### Refresh Token Payload
```json
{
  "sub": "1",
  "storeId": 1,
  "role": "MANAGER | STAFF | TABLE",
  "type": "REFRESH",
  "iat": 1704067200,
  "exp": 1704672000              // 7일 후
}
```

### 토큰 정책
- Access Token 만료: **16시간**
- Refresh Token 만료: **7일**
- 서명 알고리즘: **HS256**
- 비밀키: 환경변수 관리 (하드코딩 금지)
