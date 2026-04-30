# Unit 1: Backend-Core - 비즈니스 규칙

---

## BR-AUTH-01: 비밀번호 정책
- 최소 8자 이상
- bcrypt 해싱 (strength 10)
- 평문 비밀번호는 절대 저장/로깅하지 않음

## BR-AUTH-02: 로그인 시도 제한
- 동일 식별자(username 또는 tableNumber)로 **5회 연속 실패** 시 계정 잠금
- 잠금 시간: **15분**
- 잠금 해제 후 실패 카운트 리셋
- 로그인 성공 시 실패 카운트 즉시 리셋

## BR-AUTH-03: JWT 토큰 정책
- Access Token 만료: **16시간**
- Refresh Token 만료: **7일**
- 토큰 서명 알고리즘: HS256
- 토큰에 포함: sub(사용자ID), storeId, role, type, iat, exp
- 비밀키는 환경변수로 관리 (하드코딩 금지)

## BR-AUTH-04: 세션 관리
- 브라우저 새로고침 시 Access Token으로 세션 유지
- Access Token 만료 시 Refresh Token으로 자동 갱신
- Refresh Token 만료 시 재로그인 필요
- 로그아웃 시 클라이언트 측 토큰 삭제

## BR-AUTH-05: 역할 기반 접근 제어
- MANAGER: 모든 관리 기능 접근 가능
- STAFF: 주문 모니터링, 상태 변경, 주문 삭제, 이용 완료, 과거 내역 조회
- TABLE: 메뉴 조회, 주문 생성, 본인 테이블 주문 내역 조회
- 권한 없는 접근 시 HTTP 403 Forbidden 반환

## BR-AUTH-06: 매장 격리
- 모든 API 요청에서 JWT의 storeId와 요청 URL의 storeId 일치 검증
- TABLE 역할은 본인 테이블의 데이터만 접근 가능
- 불일치 시 HTTP 403 Forbidden 반환

## BR-STAFF-01: 직원 관리 규칙
- 직원 생성/수정/삭제는 MANAGER 역할만 가능
- 동일 매장 내 username 중복 불가
- 자기 자신의 계정 삭제 불가
- 삭제는 soft delete (isActive = false)
- 비활성화된 직원은 로그인 불가

## BR-STAFF-02: 초기 매장 설정
- 매장 생성 시 기본 MANAGER 계정 1개 자동 생성
- 기본 MANAGER 계정은 삭제 불가

---

## 검증 규칙 (Validation)

### AdminLoginRequest
| 필드 | 규칙 |
|------|------|
| storeCode | NOT NULL, 1~50자 |
| username | NOT NULL, 1~50자 |
| password | NOT NULL, 8자 이상 |

### TableLoginRequest
| 필드 | 규칙 |
|------|------|
| storeCode | NOT NULL, 1~50자 |
| tableNumber | NOT NULL, 1~20자 |
| password | NOT NULL, 8자 이상 |

### StaffCreateRequest
| 필드 | 규칙 |
|------|------|
| username | NOT NULL, 1~50자, 영문+숫자만 |
| password | NOT NULL, 8자 이상 |
| role | NOT NULL, MANAGER 또는 STAFF |

### StaffUpdateRequest
| 필드 | 규칙 |
|------|------|
| username | optional, 1~50자, 영문+숫자만 |
| password | optional, 8자 이상 |
| role | optional, MANAGER 또는 STAFF |

---
