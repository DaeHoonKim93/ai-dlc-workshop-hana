# 테이블오더 서비스 - 서비스 레이어 설계

---

## 1. 서비스 정의

### 1.1 AuthService
**책임**: 인증/인가 처리 전담
- 관리자 로그인 처리 (매장 식별자 + 사용자명 + 비밀번호)
- 태블릿 로그인 처리 (매장 식별자 + 테이블 번호 + 비밀번호)
- JWT 토큰 생성/검증/갱신
- 로그인 시도 제한 관리
- 비밀번호 해싱 및 검증

**의존**: StaffRepository, TableRepository, JwtTokenProvider

### 1.2 StaffService
**책임**: 직원 계정 관리
- 직원 CRUD
- 역할 할당 (MANAGER, STAFF)

**의존**: StaffRepository, AuthService (비밀번호 해싱)

### 1.3 TableService
**책임**: 테이블 정보 관리
- 테이블 CRUD (초기 설정 포함)
- 테이블 목록 조회

**의존**: TableRepository

### 1.4 TableSessionService
**책임**: 테이블 세션 라이프사이클 관리
- 세션 시작 (첫 주문 시 자동)
- 세션 종료 (이용 완료)
- 이용 완료 시 주문 이력 이동 및 테이블 리셋
- 과거 주문 내역 조회

**의존**: TableSessionRepository, OrderRepository, OrderHistoryRepository

### 1.5 CategoryService
**책임**: 메뉴 카테고리 관리
- 대분류/소분류 카테고리 CRUD
- 카테고리 계층 구조 조회

**의존**: CategoryRepository, SubCategoryRepository

### 1.6 MenuService
**책임**: 메뉴 아이템 관리
- 메뉴 CRUD
- 메뉴 노출 순서 관리
- 카테고리별 메뉴 조회

**의존**: MenuItemRepository, CategoryService

### 1.7 ImageService
**책임**: 이미지 업로드/삭제
- S3 이미지 업로드
- S3 이미지 삭제
- 파일 형식/크기 검증

**의존**: S3Client

### 1.8 OrderService
**책임**: 주문 처리
- 주문 생성 (장바구니 → 주문 변환)
- 주문 상태 변경
- 주문 삭제
- 주문 조회 (테이블별, 세션별)
- 주문 생성 시 세션 자동 시작 트리거

**의존**: OrderRepository, OrderItemRepository, TableSessionService, SseService

### 1.9 SseService
**책임**: 실시간 알림 관리
- SSE 구독 관리 (연결/해제)
- 신규 주문 알림 전송
- 주문 상태 변경 알림 전송
- 주문 삭제 알림 전송
- 연결 상태 관리 (타임아웃, 재연결)

**의존**: SseEmitter 관리 (인메모리)

---

## 2. 서비스 상호작용 패턴

### 2.1 고객 주문 플로우
```
고객 태블릿
    |
    v
OrderController.createOrder()
    |
    v
OrderService.createOrder()
    |-- TableSessionService.getCurrentSession() / startSession()
    |-- OrderRepository.save()
    |-- SseService.notifyNewOrder()  --> 관리자 대시보드 실시간 업데이트
    |
    v
OrderResponse (주문 번호 포함)
```

### 2.2 관리자 주문 상태 변경 플로우
```
관리자 브라우저
    |
    v
OrderController.updateOrderStatus()
    |
    v
OrderService.updateOrderStatus()
    |-- OrderRepository.save()
    |-- SseService.notifyOrderStatusChange()  --> 관리자 대시보드 + 고객 태블릿
    |
    v
OrderResponse (변경된 상태)
```

### 2.3 테이블 이용 완료 플로우
```
관리자 브라우저
    |
    v
TableController.completeTable()
    |
    v
TableSessionService.endSession()
    |-- OrderRepository.findByTableSession()
    |-- OrderHistoryRepository.saveAll()  (이력 이동)
    |-- OrderRepository.deleteByTableSession()  (현재 주문 삭제)
    |-- TableSession.close()
    |-- SseService.notifyTableReset()  --> 관리자 대시보드
    |
    v
성공 응답
```

### 2.4 SSE 실시간 통신 패턴
```
관리자 브라우저
    |
    v
SseController.subscribe(storeId)
    |
    v
SseService.subscribe()
    |-- SseEmitter 생성 (타임아웃 설정)
    |-- 매장별 구독자 목록에 추가
    |
    v
SseEmitter (연결 유지)
    |
    [이벤트 발생 시]
    |
SseService.notifyXxx()
    |-- 매장별 구독자 목록 순회
    |-- 각 SseEmitter에 이벤트 전송
    |-- 실패한 연결 제거
```

---

## 3. 트랜잭션 경계

| 서비스 메서드 | 트랜잭션 | 비고 |
|---------------|----------|------|
| OrderService.createOrder | @Transactional | 주문 + 주문항목 + 세션 시작 |
| OrderService.updateOrderStatus | @Transactional | 상태 변경 |
| OrderService.deleteOrder | @Transactional | 주문 + 주문항목 삭제 |
| TableSessionService.endSession | @Transactional | 이력 이동 + 주문 삭제 + 세션 종료 |
| MenuService.createMenuItem | @Transactional | 메뉴 생성 |
| StaffService.createStaff | @Transactional | 직원 생성 + 비밀번호 해싱 |

---
