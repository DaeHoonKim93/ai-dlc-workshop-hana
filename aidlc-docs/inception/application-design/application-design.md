# 테이블오더 서비스 - Application Design 통합 문서

---

## 1. 아키텍처 개요

### 기술 스택
| 영역 | 기술 | 비고 |
|------|------|------|
| Backend | Java + Spring Boot (Multi-Module) | REST API 서버 |
| Frontend (고객) | React + TypeScript (customer-web) | 태블릿 주문 UI |
| Frontend (관리자) | React + TypeScript (admin-web) | 관리자 대시보드 |
| Database | PostgreSQL | 관계형 데이터베이스 |
| 이미지 저장소 | AWS S3 | 메뉴 이미지 |
| 실시간 통신 | SSE (Server-Sent Events) | 주문 실시간 알림 |
| 인증 | JWT | 토큰 기반 인증/인가 |

### 시스템 아키텍처

```
+------------------+     +------------------+
|  customer-web    |     |   admin-web      |
|  (React/TS)      |     |   (React/TS)     |
|  태블릿 주문 UI   |     |   관리자 대시보드  |
+--------+---------+     +--------+---------+
         |                        |
         |   HTTP/REST            |   HTTP/REST + SSE
         |                        |
         v                        v
+------------------------------------------------+
|           Spring Boot Application              |
|                                                |
|  +--------+  +-------+  +-------+  +--------+ |
|  |  auth  |  | store |  | table |  |  menu  | |
|  +--------+  +-------+  +-------+  +--------+ |
|  +--------+  +--------+                       |
|  | order  |  | common |                       |
|  +--------+  +--------+                       |
+---------------------+-------------------------+
                      |
          +-----------+-----------+
          |                       |
          v                       v
+------------------+     +------------------+
|   PostgreSQL     |     |     AWS S3       |
|   Database       |     |   이미지 저장소    |
+------------------+     +------------------+
```

---

## 2. Backend 모듈 구조

### 모듈 목록
| 모듈 | 책임 |
|------|------|
| **common** | 공통 예외, DTO, 유틸리티, 설정 |
| **auth** | JWT 인증/인가, 로그인, 역할 기반 접근 제어 |
| **store** | 매장 정보, 직원 계정 관리 |
| **table** | 테이블 관리, 세션 라이프사이클 |
| **menu** | 카테고리/메뉴 CRUD, S3 이미지 업로드 |
| **order** | 주문 처리, SSE 실시간 알림 |
| **app** | 애플리케이션 조립 및 실행 |

### 계층 구조 (각 모듈 내부)
```
Controller (REST API 엔드포인트)
    |
Service (비즈니스 로직)
    |
Repository (데이터 접근 - JPA)
    |
Entity (JPA 엔티티)
```

---

## 3. Frontend 프로젝트 구조

### customer-web (고객용)
- **Pages**: Login, Menu, Cart, OrderConfirm, OrderSuccess, OrderHistory
- **핵심 Hooks**: useAuth, useCart (로컬 스토리지), useMenu, useOrders
- **특징**: 태블릿 최적화, 터치 친화적 UI, 자동 로그인

### admin-web (관리자용)
- **Pages**: Login, Dashboard, OrderDetail, TableManagement, MenuManagement, StaffManagement
- **핵심 Hooks**: useAuth, useSSE, useDashboard, useTableManagement, useMenuManagement
- **특징**: 실시간 대시보드 (SSE), 역할 기반 메뉴 표시, 그리드 레이아웃

---

## 4. 주요 API 엔드포인트

### 인증 API
| Method | Path | 설명 |
|--------|------|------|
| POST | /api/auth/admin/login | 관리자 로그인 |
| POST | /api/auth/table/login | 태블릿 로그인 |
| POST | /api/auth/refresh | 토큰 갱신 |

### 메뉴 API
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/stores/{storeId}/categories | 카테고리 목록 |
| GET | /api/stores/{storeId}/menus | 메뉴 목록 |
| POST | /api/stores/{storeId}/menus | 메뉴 등록 |
| PUT | /api/stores/{storeId}/menus/{menuId} | 메뉴 수정 |
| DELETE | /api/stores/{storeId}/menus/{menuId} | 메뉴 삭제 |

### 주문 API
| Method | Path | 설명 |
|--------|------|------|
| POST | /api/stores/{storeId}/orders | 주문 생성 |
| GET | /api/stores/{storeId}/orders | 주문 목록 |
| PUT | /api/stores/{storeId}/orders/{orderId}/status | 상태 변경 |
| DELETE | /api/stores/{storeId}/orders/{orderId} | 주문 삭제 |
| GET | /api/stores/{storeId}/orders/subscribe | SSE 구독 |

### 테이블 API
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/stores/{storeId}/tables | 테이블 목록 |
| POST | /api/stores/{storeId}/tables | 테이블 등록 |
| POST | /api/stores/{storeId}/tables/{tableId}/complete | 이용 완료 |
| GET | /api/stores/{storeId}/tables/{tableId}/history | 과거 내역 |

### 직원 API
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/stores/{storeId}/staff | 직원 목록 |
| POST | /api/stores/{storeId}/staff | 직원 등록 |
| PUT | /api/stores/{storeId}/staff/{staffId} | 직원 수정 |
| DELETE | /api/stores/{storeId}/staff/{staffId} | 직원 삭제 |

---

## 5. 서비스 상호작용 핵심 플로우

### 고객 주문 플로우
고객 → OrderController → OrderService → (TableSessionService + OrderRepository + SseService) → 관리자 대시보드

### 관리자 주문 상태 변경
관리자 → OrderController → OrderService → (OrderRepository + SseService) → 관리자 대시보드 + 고객 태블릿

### 테이블 이용 완료
관리자 → TableController → TableSessionService → (OrderHistory 이동 + 주문 삭제 + 세션 종료 + SseService) → 대시보드 리셋

---

## 6. 역할 기반 접근 제어

| 기능 | MANAGER | STAFF | TABLE (고객) |
|------|:-------:|:-----:|:------------:|
| 주문 모니터링 | ✅ | ✅ | ❌ |
| 주문 상태 변경 | ✅ | ✅ | ❌ |
| 주문 삭제 | ✅ | ✅ | ❌ |
| 테이블 이용 완료 | ✅ | ✅ | ❌ |
| 과거 내역 조회 | ✅ | ✅ | ❌ |
| 테이블 초기 설정 | ✅ | ❌ | ❌ |
| 메뉴 관리 | ✅ | ❌ | ❌ |
| 직원 관리 | ✅ | ❌ | ❌ |
| 메뉴 조회 | ✅ | ❌ | ✅ |
| 장바구니/주문 | ❌ | ❌ | ✅ |
| 주문 내역 조회 | ❌ | ❌ | ✅ |

---

## 상세 문서 참조
- 컴포넌트 정의: `components.md`
- 컴포넌트 메서드: `component-methods.md`
- 서비스 레이어: `services.md`
- 의존성 관계: `component-dependency.md`

---
