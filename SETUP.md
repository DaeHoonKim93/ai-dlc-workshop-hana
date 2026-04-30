# 개발 환경 설치 가이드

## 1. Node.js 설치 (필수)

macOS + Homebrew 기준:

```bash
# Node.js LTS 설치
brew install node@20

# 설치 확인
node --version   # v20.x.x
npm --version    # 10.x.x
```

## 2. 프로젝트 의존성 설치

```bash
# 워크스페이스 루트에서 전체 설치
cd /Users/hongjin-won/Desktop/kiro
npm install
```

이 명령 하나로 admin-web, customer-web 의존성이 모두 설치됩니다 (npm workspaces).

## 3. 개발 서버 실행

```bash
# 두 앱을 동시에 하나의 포트(3000)에서 실행
npm run dev
```

- `http://localhost:3000/` → customer-web (고객 태블릿)
- `http://localhost:3000/admin` → admin-web (관리자)
- `/api/*` → 백엔드 프록시 (http://localhost:8080)

## 4. 개별 빌드

```bash
# customer-web만 빌드
npm run build:customer

# admin-web만 빌드
npm run build:admin

# 전체 빌드
npm run build
```

## 5. 프로덕션 프리뷰

```bash
npm run preview
```
