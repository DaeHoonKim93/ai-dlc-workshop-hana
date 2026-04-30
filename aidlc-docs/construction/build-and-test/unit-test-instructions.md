# Unit Test Execution - Unit 2: Backend-Domain

## 테스트 실행

### 1. 전체 단위 테스트 실행

```bash
cd table-order-backend
./gradlew test
```

### 2. 모듈별 테스트 실행

```bash
# Table 모듈 테스트
./gradlew :table:test

# Menu 모듈 테스트
./gradlew :menu:test

# Order 모듈 테스트
./gradlew :order:test
```

### 3. 특정 테스트 클래스 실행

```bash
./gradlew :order:test --tests "com.tableorder.order.service.OrderServiceTest"
./gradlew :table:test --tests "com.tableorder.table.service.TableServiceTest"
./gradlew :menu:test --tests "com.tableorder.menu.service.MenuServiceTest"
```

## 테스트 목록

### Table 모듈
| 테스트 클래스 | 테스트 케이스 | 검증 내용 |
|--------------|-------------|-----------|
| TableServiceTest | getTables_success | 테이블 목록 조회 |
| TableServiceTest | createTable_success | 테이블 등록 성공 |
| TableServiceTest | createTable_duplicateTableNumber | 중복 테이블 번호 에러 |

### Menu 모듈
| 테스트 클래스 | 테스트 케이스 | 검증 내용 |
|--------------|-------------|-----------|
| MenuServiceTest | createMenuItem_success | 메뉴 등록 성공 |
| MenuServiceTest | createMenuItem_subCategoryNotFound | 존재하지 않는 소분류 에러 |
| MenuServiceTest | deleteMenuItem_success | 메뉴 삭제 성공 |

### Order 모듈
| 테스트 클래스 | 테스트 케이스 | 검증 내용 |
|--------------|-------------|-----------|
| OrderServiceTest | createOrder_success | 주문 생성 성공 (금액 계산, 스냅샷) |
| OrderServiceTest | updateOrderStatus_success | 상태 변경 PENDING→ACCEPTED |
| OrderServiceTest | updateOrderStatus_invalidTransition | 잘못된 상태 전이 에러 |
| OrderServiceTest | deleteOrder_success | 주문 삭제 성공 |

## 테스트 결과 확인

```bash
# HTML 리포트 확인
open table/build/reports/tests/test/index.html
open menu/build/reports/tests/test/index.html
open order/build/reports/tests/test/index.html
```

## 테스트 실패 시

1. 테스트 리포트에서 실패 원인 확인
2. 해당 Service/Controller 코드 수정
3. `./gradlew test` 재실행
4. 모든 테스트 통과 확인

---
