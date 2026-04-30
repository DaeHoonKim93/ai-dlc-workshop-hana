-- H2용 store_table 테이블 (태블릿 로그인 시 JDBC 직접 조회용)
-- JPA Entity로 관리하지 않으므로 수동 DDL

CREATE TABLE IF NOT EXISTS store_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (store_id, table_number)
);
