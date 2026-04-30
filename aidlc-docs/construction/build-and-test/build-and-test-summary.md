# Build and Test Summary - Unit 2: Backend-Domain

## Build Status
- **Build Tool**: Gradle 8.x (Multi-Module)
- **Java Version**: 17
- **Spring Boot**: 3.2.5
- **Build Command**: `./gradlew clean build`

## 생성된 테스트 파일

### Unit Tests
| 모듈 | 테스트 클래스 | 테스트 수 | 검증 내용 |
|------|-------------|:---------:|-----------|
| table | TableServiceTest | 3 | 목록 조회, 등록 성공, 중복 에러 |
| menu | MenuServiceTest | 3 | 등록 성공, 소분류 미존재 에러, 삭제 성공 |
| order | OrderServiceTest | 4 | 주문 생성, 상태 변경 성공/실패, 삭제 |
| **합계** | **3개 클래스** | **10개** | |

### Integration Tests
- **방식**: 수동 통합 테스트 (curl 스크립트 제공)
- **시나리오**: 5개 (주문 플로우, 상태 변경, 이용 완료, 메뉴-주문 연동, 대시보드)

### Performance Tests
- **도구**: k6 스크립트 제공
- **목표**: 분당 500건, 평균 200ms, P95 500ms

## 테스트 실행 가이드

| 문서 | 위치 | 내용 |
|------|------|------|
| 빌드 가이드 | `build-instructions.md` | 환경 설정, 빌드, 실행 방법 |
| 단위 테스트 | `unit-test-instructions.md` | 모듈별 테스트 실행, 결과 확인 |
| 통합 테스트 | `integration-test-instructions.md` | 5개 시나리오, curl 스크립트 |
| 성능 테스트 | `performance-test-instructions.md` | k6 스크립트, 최적화 체크리스트 |

## 다음 단계
- 빌드 및 단위 테스트 실행
- 통합 테스트 시나리오 검증
- 성능 테스트 실행 및 목표 달성 확인
- Unit 1 (auth) 통합 후 인증/인가 E2E 테스트

---
