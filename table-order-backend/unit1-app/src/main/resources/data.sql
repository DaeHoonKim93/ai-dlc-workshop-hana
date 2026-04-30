-- 초기 데이터: 테스트용 매장 및 관리자 계정
-- 비밀번호: password123 (bcrypt encoded)

INSERT INTO store (store_code, store_name, created_at, updated_at)
VALUES ('STORE001', '테스트 매장', NOW(), NOW());

INSERT INTO staff (store_id, username, password, role, is_active, created_at, updated_at)
VALUES (1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MANAGER', true, NOW(), NOW());

-- 테스트용 테이블 (태블릿 로그인 테스트)
INSERT INTO store_table (store_id, table_number, password, is_active, created_at, updated_at)
VALUES (1, 'A1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true, NOW(), NOW());
