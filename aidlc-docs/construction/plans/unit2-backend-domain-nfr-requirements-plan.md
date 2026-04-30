# NFR Requirements Plan - Unit 2: Backend-Domain

## 개요
Unit 2 (table, menu, order 모듈)의 비기능 요구사항을 구체화하고 기술 스택 세부 결정을 수행합니다.

---

## Part 1: 질문

### Question 1
SSE 동시 연결 수는 어느 정도를 예상하시나요? (관리자 대시보드 접속자 수)

A) 소규모: 1~5명 동시 접속
B) 중규모: 5~20명 동시 접속
C) 대규모: 20명 이상 동시 접속
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
주문 데이터 보관 기간은 어떻게 하시겠습니까? (OrderHistory)

A) 3개월
B) 6개월
C) 1년
D) 무기한
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

### Question 3
메뉴 이미지 S3 저장소의 접근 방식은 어떻게 하시겠습니까?

A) S3 퍼블릭 URL 직접 접근 (간단, CDN 없음)
B) CloudFront CDN을 통한 접근 (캐싱, 성능 향상)
C) Pre-signed URL 방식 (보안 강화, 시간 제한 접근)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: NFR 산출물 생성 계획

- [x] Step 1: 성능 요구사항 구체화 (분당 500건+, SSE 2초 이내)
- [x] Step 2: 보안 요구사항 구체화 (Security Extension 적용)
- [x] Step 3: 확장성/가용성 요구사항 구체화
- [x] Step 4: 기술 스택 세부 결정 (라이브러리, 버전)
- [x] Step 5: nfr-requirements.md 생성
- [x] Step 6: tech-stack-decisions.md 생성

---
