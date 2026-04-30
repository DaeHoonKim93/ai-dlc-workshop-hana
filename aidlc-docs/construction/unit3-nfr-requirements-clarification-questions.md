# Unit 3: NFR Requirements - 명확화 질문

답변 분석 중 1건의 잠재적 충돌이 발견되었습니다. 아래 질문에 답변해주세요.

---

## Clarification 1: Tailwind CSS + Ant Design 조합

Q4에서 Tailwind CSS를, Q5에서 Ant Design을 선택하셨습니다.
Ant Design은 자체 디자인 시스템(CSS-in-JS 기반)을 가지고 있어 Tailwind CSS와 함께 사용 시 다음 이슈가 발생할 수 있습니다:
- 스타일 우선순위 충돌 (Tailwind의 유틸리티 클래스 vs Ant Design의 내장 스타일)
- 번들 크기 증가 (두 스타일 시스템 동시 로드)
- 커스터마이징 복잡도 증가

어떤 방식으로 진행하시겠습니까?

A) Ant Design 메인 + Tailwind CSS 보조 (Ant Design 컴포넌트 우선 사용, 레이아웃/간격 등 보조적으로 Tailwind 활용, antd의 ConfigProvider로 테마 커스터마이징)
B) Tailwind CSS 메인 + Ant Design 부분 사용 (Tailwind로 대부분 스타일링, 복잡한 컴포넌트만 Ant Design 사용)
C) Ant Design만 사용 (Tailwind CSS 제거, Ant Design의 내장 스타일 시스템으로 통일)
D) Tailwind CSS만 사용 (Ant Design 제거, 커스텀 컴포넌트 직접 구현)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

---
