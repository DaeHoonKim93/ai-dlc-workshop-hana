# Performance Test Instructions - Unit 2: Backend-Domain

## 성능 목표
| 항목 | 목표 |
|------|------|
| 주문 생성 처리량 | 분당 500건 이상 |
| API 평균 응답 시간 | 200ms 이내 |
| API P95 응답 시간 | 500ms 이내 |
| SSE 알림 지연 | 2초 이내 |
| 대시보드 로딩 (100개 테이블) | 500ms 이내 |

## 도구
- **k6** (권장) 또는 **Apache JMeter**

## k6 테스트 스크립트 예시

### 주문 생성 부하 테스트

```javascript
// order-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // ramp up
    { duration: '2m', target: 50 },    // sustained load (분당 ~500건)
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'avg<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const payload = JSON.stringify({
    tableId: Math.floor(Math.random() * 100) + 1,
    items: [
      { menuItemId: Math.floor(Math.random() * 50) + 1, quantity: Math.floor(Math.random() * 3) + 1 }
    ]
  });

  const res = http.post('http://localhost:8080/api/stores/1/orders', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.1);
}
```

### 실행

```bash
# k6 설치 (macOS)
brew install k6

# 테스트 실행
k6 run order-load-test.js
```

## 성능 최적화 체크리스트

성능 목표 미달 시 확인:
- [ ] HikariCP 커넥션 풀 사이즈 (기본 20)
- [ ] JPA N+1 쿼리 발생 여부 (Hibernate SQL 로그 확인)
- [ ] DB 인덱스 적용 여부 (EXPLAIN ANALYZE)
- [ ] SSE Emitter 메모리 사용량
- [ ] GC 로그 확인 (JVM 힙 사이즈)

---
