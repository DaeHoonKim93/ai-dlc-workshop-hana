# Unit 1: Backend-Core - 비즈니스 로직 모델

---

## 1. 관리자 로그인 플로우

```
입력: storeCode, username, password
    |
    v
[1] storeCode로 매장 조회
    |-- 매장 없음 → AuthenticationException("매장을 찾을 수 없습니다")
    |
    v
[2] 로그인 시도 제한 확인
    |-- 잠금 상태 → AuthenticationException("계정이 잠겨있습니다. N분 후 재시도")
    |
    v
[3] storeId + username으로 직원 조회
    |-- 직원 없음 → 실패 카운트 증가 → AuthenticationException("인증 정보가 올바르지 않습니다")
    |
    v
[4] 비밀번호 검증 (bcrypt)
    |-- 불일치 → 실패 카운트 증가 → AuthenticationException("인증 정보가 올바르지 않습니다")
    |
    v
[5] 인증 성공
    |-- 실패 카운트 리셋
    |-- JWT Access Token 생성 (16시간 만료)
    |-- JWT Refresh Token 생성
    |
    v
출력: TokenResponse { accessToken, refreshToken, role, storeId, staffId }
```

---

## 2. 태블릿 로그인 플로우

```
입력: storeCode, tableNumber, password
    |
    v
[1] storeCode로 매장 조회
    |-- 매장 없음 → AuthenticationException
    |
    v
[2] 로그인 시도 제한 확인
    |-- 잠금 상태 → AuthenticationException
    |
    v
[3] storeId + tableNumber로 테이블 조회
    |-- 테이블 없음 → 실패 카운트 증가 → AuthenticationException
    |
    v
[4] 비밀번호 검증 (bcrypt)
    |-- 불일치 → 실패 카운트 증가 → AuthenticationException
    |
    v
[5] 인증 성공
    |-- 실패 카운트 리셋
    |-- JWT Access Token 생성 (16시간 만료, role=TABLE)
    |
    v
출력: TokenResponse { accessToken, refreshToken, role=TABLE, storeId, tableId }
```

---

## 3. JWT 토큰 관리

### Access Token 구조
```json
{
  "sub": "staffId 또는 tableId",
  "storeId": 1,
  "role": "MANAGER | STAFF | TABLE",
  "type": "ACCESS",
  "iat": 1234567890,
  "exp": 1234625490
}
```

### Token 갱신 플로우
```
입력: refreshToken
    |
    v
[1] Refresh Token 유효성 검증
    |-- 만료/무효 → AuthenticationException("토큰이 만료되었습니다")
    |
    v
[2] 새 Access Token 생성
    |
    v
출력: TokenResponse { accessToken, refreshToken }
```

---

## 4. 역할 기반 접근 제어

### 역할 계층
```
MANAGER > STAFF > TABLE
```

### 엔드포인트별 접근 권한
| 엔드포인트 패턴 | MANAGER | STAFF | TABLE |
|----------------|:-------:|:-----:|:-----:|
| /api/auth/** | ALL | ALL | ALL |
| /api/stores/{storeId}/staff/** | ✅ | ❌ | ❌ |
| /api/stores/{storeId}/menus (GET) | ✅ | ❌ | ✅ |
| /api/stores/{storeId}/menus (CUD) | ✅ | ❌ | ❌ |
| /api/stores/{storeId}/categories/** | ✅ | ❌ | ❌ |
| /api/stores/{storeId}/orders (POST) | ❌ | ❌ | ✅ |
| /api/stores/{storeId}/orders (GET) | ✅ | ✅ | ✅ |
| /api/stores/{storeId}/orders/*/status | ✅ | ✅ | ❌ |
| /api/stores/{storeId}/orders/* (DELETE) | ✅ | ✅ | ❌ |
| /api/stores/{storeId}/orders/subscribe | ✅ | ✅ | ❌ |
| /api/stores/{storeId}/tables (GET) | ✅ | ✅ | ❌ |
| /api/stores/{storeId}/tables (POST) | ✅ | ❌ | ❌ |
| /api/stores/{storeId}/tables/*/complete | ✅ | ✅ | ❌ |
| /api/stores/{storeId}/tables/*/history | ✅ | ✅ | ❌ |

### 매장 격리 (Store Isolation)
- 모든 API 요청에서 JWT의 storeId와 URL의 storeId 일치 여부 검증
- 불일치 시 AuthorizationException("접근 권한이 없습니다")

---

## 5. 직원 관리 플로우

### 직원 생성
```
입력: storeId, username, password, role
    |
    v
[1] 요청자 권한 확인 (MANAGER만 가능)
[2] 동일 매장 내 username 중복 확인
    |-- 중복 → BusinessException("이미 존재하는 사용자명입니다")
[3] 비밀번호 bcrypt 해싱
[4] Staff 엔티티 저장
    |
    v
출력: StaffResponse { id, username, role, isActive }
```

### 직원 삭제
```
입력: storeId, staffId
    |
    v
[1] 요청자 권한 확인 (MANAGER만 가능)
[2] 자기 자신 삭제 방지
    |-- 자기 자신 → BusinessException("자신의 계정은 삭제할 수 없습니다")
[3] Staff 엔티티 비활성화 (soft delete: isActive = false)
    |
    v
출력: void
```

---
