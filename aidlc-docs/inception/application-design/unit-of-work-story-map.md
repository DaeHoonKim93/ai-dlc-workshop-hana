# 테이블오더 서비스 - Unit of Work ↔ Story 매핑

---

## Unit 1: Backend-Core (BE 개발자 1)

| Story ID | 스토리명 | Epic |
|----------|----------|------|
| US-01 | 태블릿 초기 설정 (Backend) | Epic 1: 태블릿 자동 로그인 |
| US-02 | 태블릿 자동 로그인 (Backend) | Epic 1: 태블릿 자동 로그인 |
| US-12 | 관리자 로그인 | Epic 6: 관리자 인증 |
| US-13 | 역할 기반 접근 제어 | Epic 6: 관리자 인증 |

**스토리 수**: 4개

---

## Unit 2: Backend-Domain (BE 개발자 2)

| Story ID | 스토리명 | Epic |
|----------|----------|------|
| US-03 | 카테고리별 메뉴 탐색 (Backend) | Epic 2: 메뉴 조회/탐색 |
| US-04 | 메뉴 상세 정보 확인 (Backend) | Epic 2: 메뉴 조회/탐색 |
| US-09 | 주문 확정 및 성공 처리 (Backend) | Epic 4: 주문 생성 |
| US-10 | 주문 실패 처리 (Backend) | Epic 4: 주문 생성 |
| US-11 | 현재 세션 주문 내역 조회 (Backend) | Epic 5: 주문 내역 조회 |
| US-14 | 실시간 주문 대시보드 (Backend SSE) | Epic 7: 실시간 주문 모니터링 |
| US-15 | 주문 상세 보기 (Backend) | Epic 7: 실시간 주문 모니터링 |
| US-16 | 주문 상태 변경 (Backend) | Epic 7: 실시간 주문 모니터링 |
| US-17 | 테이블별 필터링 (Backend) | Epic 7: 실시간 주문 모니터링 |
| US-18 | 테이블 태블릿 초기 설정 (Backend) | Epic 8: 테이블 관리 |
| US-19 | 주문 삭제 (Backend) | Epic 8: 테이블 관리 |
| US-20 | 테이블 이용 완료 처리 (Backend) | Epic 8: 테이블 관리 |
| US-21 | 과거 주문 내역 조회 (Backend) | Epic 8: 테이블 관리 |
| US-22 | 메뉴 등록 (Backend) | Epic 9: 메뉴 관리 |
| US-23 | 메뉴 수정 (Backend) | Epic 9: 메뉴 관리 |
| US-24 | 메뉴 삭제 (Backend) | Epic 9: 메뉴 관리 |
| US-25 | 메뉴 노출 순서 조정 (Backend) | Epic 9: 메뉴 관리 |
| US-26 | 메뉴 조회 - 관리자 (Backend) | Epic 9: 메뉴 관리 |

**스토리 수**: 18개

---

## Unit 3: Frontend-Customer (FE 개발자 1)

| Story ID | 스토리명 | Epic |
|----------|----------|------|
| US-01 | 태블릿 초기 설정 (Frontend) | Epic 1: 태블릿 자동 로그인 |
| US-02 | 태블릿 자동 로그인 (Frontend) | Epic 1: 태블릿 자동 로그인 |
| US-03 | 카테고리별 메뉴 탐색 (Frontend) | Epic 2: 메뉴 조회/탐색 |
| US-04 | 메뉴 상세 정보 확인 (Frontend) | Epic 2: 메뉴 조회/탐색 |
| US-05 | 메뉴를 장바구니에 추가 | Epic 3: 장바구니 관리 |
| US-06 | 장바구니 수량 조절 | Epic 3: 장바구니 관리 |
| US-07 | 장바구니 비우기 및 삭제 | Epic 3: 장바구니 관리 |
| US-08 | 주문 내역 최종 확인 | Epic 4: 주문 생성 |
| US-09 | 주문 확정 및 성공 처리 (Frontend) | Epic 4: 주문 생성 |
| US-10 | 주문 실패 처리 (Frontend) | Epic 4: 주문 생성 |
| US-11 | 현재 세션 주문 내역 조회 (Frontend) | Epic 5: 주문 내역 조회 |

**스토리 수**: 11개

---

## Unit 4: Frontend-Admin (FE 개발자 2)

| Story ID | 스토리명 | Epic |
|----------|----------|------|
| US-12 | 관리자 로그인 (Frontend) | Epic 6: 관리자 인증 |
| US-13 | 역할 기반 접근 제어 (Frontend) | Epic 6: 관리자 인증 |
| US-14 | 실시간 주문 대시보드 (Frontend) | Epic 7: 실시간 주문 모니터링 |
| US-15 | 주문 상세 보기 (Frontend) | Epic 7: 실시간 주문 모니터링 |
| US-16 | 주문 상태 변경 (Frontend) | Epic 7: 실시간 주문 모니터링 |
| US-17 | 테이블별 필터링 (Frontend) | Epic 7: 실시간 주문 모니터링 |
| US-18 | 테이블 태블릿 초기 설정 (Frontend) | Epic 8: 테이블 관리 |
| US-19 | 주문 삭제 (Frontend) | Epic 8: 테이블 관리 |
| US-20 | 테이블 이용 완료 처리 (Frontend) | Epic 8: 테이블 관리 |
| US-21 | 과거 주문 내역 조회 (Frontend) | Epic 8: 테이블 관리 |
| US-22 | 메뉴 등록 (Frontend) | Epic 9: 메뉴 관리 |
| US-23 | 메뉴 수정 (Frontend) | Epic 9: 메뉴 관리 |
| US-24 | 메뉴 삭제 (Frontend) | Epic 9: 메뉴 관리 |
| US-25 | 메뉴 노출 순서 조정 (Frontend) | Epic 9: 메뉴 관리 |
| US-26 | 메뉴 조회 - 관리자 (Frontend) | Epic 9: 메뉴 관리 |

**스토리 수**: 15개

---

## 스토리 커버리지 요약

| 유닛 | 스토리 수 | 우선순위 분포 |
|------|-----------|---------------|
| Unit 1: BE-Core | 4 | High: 4 |
| Unit 2: BE-Domain | 18 | High: 15, Medium: 2, Low: 1 |
| Unit 3: FE-Customer | 11 | High: 9, Medium: 2 |
| Unit 4: FE-Admin | 15 | High: 12, Medium: 2, Low: 1 |

**전체 스토리 26개 모두 유닛에 할당 완료** (일부 스토리는 BE+FE 양쪽에 매핑)

---
