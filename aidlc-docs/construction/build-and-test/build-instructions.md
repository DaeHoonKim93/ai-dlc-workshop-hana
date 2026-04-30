# Build Instructions - Unit 2: Backend-Domain

## Prerequisites
- **Java**: JDK 17+
- **Gradle**: 8.x (Gradle Wrapper 포함)
- **PostgreSQL**: 15.x (로컬 또는 Docker)
- **AWS CLI**: S3 접근용 (선택사항, 이미지 업로드 테스트 시)

## 환경 변수

```bash
# 필수
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=tableorder
export DB_USERNAME=tableorder
export DB_PASSWORD=tableorder

# S3 (선택사항)
export AWS_S3_BUCKET=table-order-images
export AWS_REGION=ap-northeast-2
```

## Build Steps

### 1. PostgreSQL 설정 (Docker 사용 시)

```bash
docker run -d \
  --name tableorder-db \
  -e POSTGRES_DB=tableorder \
  -e POSTGRES_USER=tableorder \
  -e POSTGRES_PASSWORD=tableorder \
  -p 5432:5432 \
  postgres:15
```

### 2. 프로젝트 빌드

```bash
cd table-order-backend
./gradlew clean build
```

### 3. 테스트 제외 빌드 (빠른 빌드)

```bash
./gradlew clean build -x test
```

### 4. 애플리케이션 실행

```bash
./gradlew :app:bootRun
```

서버가 `http://localhost:8080`에서 시작됩니다.

### 5. 빌드 성공 확인

- **Expected Output**: `BUILD SUCCESSFUL`
- **Build Artifacts**: `app/build/libs/app-0.0.1-SNAPSHOT.jar`
- **Flyway**: 애플리케이션 시작 시 자동으로 DB 마이그레이션 실행

## Troubleshooting

### PostgreSQL 연결 실패
- Docker 컨테이너가 실행 중인지 확인: `docker ps`
- 포트 충돌 확인: `lsof -i :5432`
- 환경 변수 확인: `echo $DB_HOST`

### Gradle 빌드 실패
- Java 버전 확인: `java -version` (17 이상)
- Gradle 캐시 정리: `./gradlew clean --refresh-dependencies`

---
