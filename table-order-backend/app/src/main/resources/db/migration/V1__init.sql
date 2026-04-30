-- V1__init.sql: 테이블오더 서비스 초기 스키마

-- Store (매장) - Unit 1에서 관리하지만 FK 참조를 위해 여기서 생성
CREATE TABLE IF NOT EXISTS store (
    id BIGSERIAL PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL UNIQUE,
    store_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Staff (직원/관리자) - Unit 1에서 관리
CREATE TABLE IF NOT EXISTS staff (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES store(id),
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (store_id, username)
);

-- Login Attempt (로그인 시도) - Unit 1에서 관리
CREATE TABLE IF NOT EXISTS login_attempt (
    id BIGSERIAL PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL,
    store_code VARCHAR(50) NOT NULL,
    attempt_type VARCHAR(20) NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMP NOT NULL DEFAULT NOW(),
    locked_until TIMESTAMP,
    UNIQUE (store_code, identifier, attempt_type)
);

-- Store Table (테이블)
CREATE TABLE store_table (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES store(id),
    table_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (store_id, table_number)
);

-- Table Session (테이블 세션)
CREATE TABLE table_session (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL REFERENCES store_table(id),
    store_id BIGINT NOT NULL REFERENCES store(id),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Category (대분류 카테고리)
CREATE TABLE category (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES store(id),
    name VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sub Category (소분류 카테고리)
CREATE TABLE sub_category (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES category(id),
    store_id BIGINT NOT NULL REFERENCES store(id),
    name VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Menu Item (메뉴 아이템)
CREATE TABLE menu_item (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES store(id),
    sub_category_id BIGINT NOT NULL REFERENCES sub_category(id),
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 100),
    description VARCHAR(500),
    image_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Orders (주문)
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES store(id),
    table_id BIGINT NOT NULL REFERENCES store_table(id),
    session_id BIGINT NOT NULL REFERENCES table_session(id),
    order_number VARCHAR(30) NOT NULL UNIQUE,
    total_amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Order Item (주문 항목)
CREATE TABLE order_item (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL REFERENCES menu_item(id),
    menu_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL
);

-- Order History (과거 주문 이력)
CREATE TABLE order_history (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    table_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    order_number VARCHAR(30) NOT NULL,
    total_amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    order_items TEXT NOT NULL,
    ordered_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL
);

-- ==================== INDEXES ====================

-- Store Table
CREATE INDEX idx_store_table_store_id ON store_table(store_id);

-- Table Session
CREATE INDEX idx_table_session_active ON table_session(table_id, is_active);

-- Category
CREATE INDEX idx_category_order ON category(store_id, display_order);

-- Sub Category
CREATE INDEX idx_sub_category_order ON sub_category(category_id, display_order);

-- Menu Item
CREATE INDEX idx_menu_item_order ON menu_item(sub_category_id, display_order);
CREATE INDEX idx_menu_item_available ON menu_item(store_id, is_available);

-- Orders
CREATE INDEX idx_order_store_status ON orders(store_id, status);
CREATE INDEX idx_order_table_session ON orders(table_id, session_id);

-- Order Item
CREATE INDEX idx_order_item_order ON order_item(order_id);

-- Order History
CREATE INDEX idx_order_history_table ON order_history(table_id, ordered_at DESC);
CREATE INDEX idx_order_history_date ON order_history(store_id, completed_at DESC);
