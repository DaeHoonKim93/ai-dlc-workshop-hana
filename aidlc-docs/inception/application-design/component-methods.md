# 테이블오더 서비스 - 컴포넌트 메서드 정의

> **Note**: 상세 비즈니스 규칙은 Functional Design (CONSTRUCTION) 단계에서 정의됩니다.
> 여기서는 메서드 시그니처와 고수준 목적만 정의합니다.

---

## 1. Auth 모듈

### AuthController
| 메서드 | HTTP | 경로 | 목적 |
|--------|------|------|------|
| adminLogin | POST | /api/auth/admin/login | 관리자 로그인 |
| tableLogin | POST | /api/auth/table/login | 태블릿 로그인 |
| refreshToken | POST | /api/auth/refresh | 토큰 갱신 |
| logout | POST | /api/auth/logout | 로그아웃 |

### AuthService
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| authenticateAdmin | AdminLoginRequest | TokenResponse | 관리자 인증 처리 |
| authenticateTable | TableLoginRequest | TokenResponse | 태블릿 인증 처리 |
| refreshToken | String refreshToken | TokenResponse | 토큰 갱신 |
| validateToken | String token | TokenClaims | 토큰 유효성 검증 |

### JwtTokenProvider
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| generateAccessToken | UserDetails | String | Access 토큰 생성 |
| generateRefreshToken | UserDetails | String | Refresh 토큰 생성 |
| validateToken | String token | boolean | 토큰 유효성 검증 |
| getClaims | String token | Claims | 토큰 클레임 추출 |

---

## 2. Store 모듈

### StoreController
| 메서드 | HTTP | 경로 | 목적 |
|--------|------|------|------|
| getStoreInfo | GET | /api/stores/{storeId} | 매장 정보 조회 |

### StaffController
| 메서드 | HTTP | 경로 | 목적 |
|--------|------|------|------|
| getStaffList | GET | /api/stores/{storeId}/staff | 직원 목록 조회 |
| createStaff | POST | /api/stores/{storeId}/staff | 직원 등록 |
| updateStaff | PUT | /api/stores/{storeId}/staff/{staffId} | 직원 수정 |
| deleteStaff | DELETE | /api/stores/{storeId}/staff/{staffId} | 직원 삭제 |

### StaffService
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| getStaffList | Long storeId | List of StaffResponse | 직원 목록 조회 |
| createStaff | StaffCreateRequest | StaffResponse | 직원 등록 |
| updateStaff | Long staffId, StaffUpdateRequest | StaffResponse | 직원 수정 |
| deleteStaff | Long staffId | void | 직원 삭제 |

---

## 3. Table 모듈

### TableController
| 메서드 | HTTP | 경로 | 목적 |
|--------|------|------|------|
| getTables | GET | /api/stores/{storeId}/tables | 테이블 목록 조회 |
| createTable | POST | /api/stores/{storeId}/tables | 테이블 등록 (초기 설정) |
| completeTable | POST | /api/stores/{storeId}/tables/{tableId}/complete | 이용 완료 처리 |
| getTableHistory | GET | /api/stores/{storeId}/tables/{tableId}/history | 과거 내역 조회 |

### TableService
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| getTables | Long storeId | List of TableResponse | 테이블 목록 조회 |
| createTable | TableCreateRequest | TableResponse | 테이블 등록 |
| completeTableSession | Long tableId | void | 이용 완료 (세션 종료, 이력 이동, 리셋) |
| getTableHistory | Long tableId, HistoryFilter | Page of OrderHistoryResponse | 과거 내역 조회 |

### TableSessionService
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| startSession | Long tableId | TableSession | 세션 시작 (첫 주문 시) |
| endSession | Long tableId | void | 세션 종료 |
| getCurrentSession | Long tableId | TableSession | 현재 활성 세션 조회 |

### TableRepository
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| findByStoreId | Long storeId | List of Table | 매장별 테이블 조회 |
| findByStoreIdAndTableNumber | Long storeId, String tableNumber | Optional of Table | 테이블 번호로 조회 |

---

## 4. Menu 모듈

### CategoryController
| 메서드 | HTTP | 경로 | 목적 |
|--------|------|------|------|
| getCategories | GET | /api/stores/{storeId}/categories | 카테고리 목록 조회 (대분류+소분류) |
| createCategory | POST | /api/stores/{storeId}/categories | 대분류 카테고리 생성 |
| createSubCategory | POST | /api/stores/{storeId}/categories/{categoryId}/subcategories | 소분류 카테고리 생성 |
| updateCategory | PUT | /api/stores/{storeId}/categories/{categoryId} | 카테고리 수정 |
| deleteCategory | DELETE | /api/stores/{storeId}/categories/{categoryId} | 카테고리 삭제 |

### MenuController
| 메서드 | HTTP | 경로 | 목적 |
|--------|------|------|------|
| getMenuItems | GET | /api/stores/{storeId}/menus | 메뉴 목록 조회 (카테고리별 필터) |
| getMenuItem | GET | /api/stores/{storeId}/menus/{menuId} | 메뉴 상세 조회 |
| createMenuItem | POST | /api/stores/{storeId}/menus | 메뉴 등록 |
| updateMenuItem | PUT | /api/stores/{storeId}/menus/{menuId} | 메뉴 수정 |
| deleteMenuItem | DELETE | /api/stores/{storeId}/menus/{menuId} | 메뉴 삭제 |
| updateMenuOrder | PUT | /api/stores/{storeId}/menus/order | 메뉴 노출 순서 변경 |
| uploadMenuImage | POST | /api/stores/{storeId}/menus/{menuId}/image | 메뉴 이미지 업로드 |

### MenuService
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| getMenuItems | Long storeId, MenuFilter | List of MenuItemResponse | 메뉴 목록 조회 |
| getMenuItem | Long menuId | MenuItemResponse | 메뉴 상세 조회 |
| createMenuItem | MenuCreateRequest | MenuItemResponse | 메뉴 등록 |
| updateMenuItem | Long menuId, MenuUpdateRequest | MenuItemResponse | 메뉴 수정 |
| deleteMenuItem | Long menuId | void | 메뉴 삭제 |
| updateMenuOrder | List of MenuOrderRequest | void | 순서 변경 |

### ImageService
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| uploadImage | MultipartFile | String (URL) | S3 이미지 업로드 |
| deleteImage | String imageUrl | void | S3 이미지 삭제 |

---

## 5. Order 모듈

### OrderController
| 메서드 | HTTP | 경로 | 목적 |
|--------|------|------|------|
| createOrder | POST | /api/stores/{storeId}/orders | 주문 생성 |
| getOrders | GET | /api/stores/{storeId}/orders | 주문 목록 조회 (필터: 테이블, 세션) |
| getOrder | GET | /api/stores/{storeId}/orders/{orderId} | 주문 상세 조회 |
| updateOrderStatus | PUT | /api/stores/{storeId}/orders/{orderId}/status | 주문 상태 변경 |
| deleteOrder | DELETE | /api/stores/{storeId}/orders/{orderId} | 주문 삭제 |

### SseController
| 메서드 | HTTP | 경로 | 목적 |
|--------|------|------|------|
| subscribe | GET | /api/stores/{storeId}/orders/subscribe | SSE 구독 (실시간 주문 알림) |

### OrderService
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| createOrder | OrderCreateRequest | OrderResponse | 주문 생성 |
| getOrders | Long storeId, OrderFilter | Page of OrderResponse | 주문 목록 조회 |
| getOrder | Long orderId | OrderResponse | 주문 상세 조회 |
| updateOrderStatus | Long orderId, OrderStatus | OrderResponse | 주문 상태 변경 |
| deleteOrder | Long orderId | void | 주문 삭제 |
| getOrdersByTableSession | Long tableId, Long sessionId | List of OrderResponse | 세션별 주문 조회 |

### SseService
| 메서드 | 입력 | 출력 | 목적 |
|--------|------|------|------|
| subscribe | Long storeId | SseEmitter | SSE 구독 등록 |
| notifyNewOrder | Long storeId, OrderResponse | void | 신규 주문 알림 전송 |
| notifyOrderStatusChange | Long storeId, OrderResponse | void | 주문 상태 변경 알림 |
| notifyOrderDeleted | Long storeId, Long orderId | void | 주문 삭제 알림 |

---
