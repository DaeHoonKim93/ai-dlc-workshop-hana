# Unit 1: Backend-Core - 도메인 엔티티

---

## Entity: Store (매장)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 매장 고유 ID |
| storeCode | String | UNIQUE, NOT NULL, max 50 | 매장 식별 코드 |
| storeName | String | NOT NULL, max 100 | 매장명 |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |
| updatedAt | LocalDateTime | NOT NULL | 수정일시 |

---

## Entity: Staff (직원/관리자)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 직원 고유 ID |
| storeId | Long | FK(Store), NOT NULL | 소속 매장 |
| username | String | NOT NULL, max 50 | 사용자명 |
| password | String | NOT NULL | bcrypt 해싱된 비밀번호 |
| role | Enum(MANAGER, STAFF) | NOT NULL | 역할 |
| isActive | Boolean | NOT NULL, default true | 활성 상태 |
| createdAt | LocalDateTime | NOT NULL | 생성일시 |
| updatedAt | LocalDateTime | NOT NULL | 수정일시 |

**UNIQUE 제약**: (storeId, username) 복합 유니크

---

## Entity: LoginAttempt (로그인 시도 기록)

| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | Long | PK, Auto Increment | 기록 고유 ID |
| identifier | String | NOT NULL, max 100 | 로그인 식별자 (username 또는 tableNumber) |
| storeCode | String | NOT NULL | 매장 코드 |
| attemptType | Enum(ADMIN, TABLE) | NOT NULL | 시도 유형 |
| attemptCount | Integer | NOT NULL, default 0 | 연속 실패 횟수 |
| lastAttemptAt | LocalDateTime | NOT NULL | 마지막 시도 시각 |
| lockedUntil | LocalDateTime | nullable | 잠금 해제 시각 |

**UNIQUE 제약**: (storeCode, identifier, attemptType) 복합 유니크

---

## Entity Relationship

```
Store (1) ----< (N) Staff
Store (1) ----< (N) LoginAttempt
```

---
