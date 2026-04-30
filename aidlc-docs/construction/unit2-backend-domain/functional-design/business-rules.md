# Unit 2: Backend-Domain - 비즈니스 규칙

---

## 테이블 규칙

### BR-TABLE-01: 테이블 번호 유니크
- 동일 매장 내 테이블 번호 중복 불가

### BR-TABLE-02: 테이블 비밀번호
- bcrypt 해싱 저장
- 최소 8자 이상

### BR-TABLE-03: 테이블 세션
- 테이블당 활성 세션은 최대 1개
- 세션 시작: 첫 주문 생성 시 자동
- 세션 종료: 이용 완료 처리 시 수동

---

## 카테고리/메뉴 규칙

### BR-MENU-01: 카테고리 구조
- 2단계: Category(대분류) > SubCategory(소분류) > MenuItem
- 카테고리 삭제 시 하위 소분류가 있으면 삭제 불가
- 소분류 삭제 시 하위 메뉴가 있으면 삭제 불가

### BR-MENU-02: 메뉴 가격
- 최소 100원 이상
- 정수만 허용 (소수점 불가)

### BR-MENU-03: 메뉴 이미지
- 허용 형식: jpg, jpeg, png, gif, webp
- 최대 크기: 5MB
- S3 저장 경로: stores/{storeId}/menus/{uuid}.{ext}

### BR-MENU-04: 메뉴 노출 순서
- 소분류 내에서 displayOrder 기준 오름차순 정렬
- displayOrder 값이 같으면 createdAt 오름차순

### BR-MENU-05: 메뉴 필수 필드
- 메뉴명: NOT NULL, 1~100자
- 가격: NOT NULL, 100원 이상
- 소분류 카테고리: NOT NULL
- 설명: optional, 최대 500자
- 이미지: optional

---

## 주문 규칙

### BR-ORDER-01: 주문 번호 형식
- 형식: yyyyMMdd-HHmmss-XXXX (XXXX: 4자리 랜덤 영숫자)
- 매장 내 유니크 보장

### BR-ORDER-02: 주문 항목 스냅샷
- 주문 시점의 메뉴명과 단가를 OrderItem에 스냅샷으로 저장
- 이후 메뉴 가격이 변경되어도 기존 주문에 영향 없음

### BR-ORDER-03: 주문 상태 전이
- PENDING → ACCEPTED → PREPARING → COMPLETED (순방향만)
- 역방향 전이 불가
- 단계 건너뛰기 불가
- COMPLETED 상태에서 추가 변경 불가

### BR-ORDER-04: 주문 최소 항목
- 주문 생성 시 최소 1개 이상의 OrderItem 필요
- 빈 주문 생성 불가

### BR-ORDER-05: 주문 금액 계산
- totalAmount = sum(각 OrderItem의 quantity * unitPrice)
- 서버에서 재계산 (클라이언트 전송 금액 무시)

### BR-ORDER-06: 주문 삭제
- 모든 상태의 주문 삭제 가능 (관리자 직권)
- 삭제 시 OrderItem도 함께 삭제 (CASCADE)

---

## 세션/이력 규칙

### BR-SESSION-01: 이용 완료 처리
- 활성 세션이 있는 테이블만 이용 완료 가능
- 이용 완료 시: 주문 → OrderHistory 이동, 주문 삭제, 세션 종료

### BR-SESSION-02: 주문 이력 보존
- OrderHistory에 주문 항목을 JSON으로 스냅샷 저장
- 원본 Order/OrderItem은 삭제

### BR-SESSION-03: 현재 세션 주문만 표시
- 고객 태블릿에서는 현재 활성 세션의 주문만 조회
- 이전 세션 주문은 표시하지 않음

---

## SSE 규칙

### BR-SSE-01: 연결 관리
- SseEmitter 타임아웃: 30분
- 타임아웃 후 자동 재연결 (클라이언트 측)
- 연결 끊김 시 구독자 목록에서 자동 제거

### BR-SSE-02: 알림 범위
- 매장 단위로 구독/알림 (storeId 기준)
- 해당 매장의 모든 관리자에게 동일 알림 전송

### BR-SSE-03: 알림 지연
- 주문 이벤트 발생 후 2초 이내 알림 전달 목표

---

## 검증 규칙 (Validation)

### TableCreateRequest
| 필드 | 규칙 |
|------|------|
| tableNumber | NOT NULL, 1~20자 |
| password | NOT NULL, 8자 이상 |

### MenuCreateRequest
| 필드 | 규칙 |
|------|------|
| subCategoryId | NOT NULL |
| name | NOT NULL, 1~100자 |
| price | NOT NULL, 100 이상 |
| description | optional, 최대 500자 |

### OrderCreateRequest
| 필드 | 규칙 |
|------|------|
| tableId | NOT NULL |
| items | NOT NULL, 최소 1개 |
| items[].menuItemId | NOT NULL |
| items[].quantity | NOT NULL, 1 이상 |

### OrderStatusUpdateRequest
| 필드 | 규칙 |
|------|------|
| status | NOT NULL, ACCEPTED/PREPARING/COMPLETED 중 하나 |

---
