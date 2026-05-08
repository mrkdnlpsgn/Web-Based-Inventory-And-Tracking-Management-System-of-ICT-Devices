-- ============================================================
--  ICT Inventory & Tracking Management System — Database Schema
--  San Jose Municipal Hall, Republic of the Philippines
--
--  Run this manually in MySQL Workbench or any MySQL client
--  as a reference / fresh-install script.
--  Hibernate (ddl-auto=update) also creates/updates these
--  tables automatically on every backend startup.
-- ============================================================

CREATE DATABASE IF NOT EXISTS inventory_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE inventory_db;

-- ------------------------------------------------------------
--  Users (managed by Spring Security + DataInitializer)
--  Default accounts seeded on first startup:
--    admin@sjmh.gov.ph / admin123  (role: admin)
--    ict@sjmh.gov.ph   / ict2024   (role: staff)
--  Passwords are stored as BCrypt hashes — never insert
--  plain-text passwords directly.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id       BIGINT       NOT NULL AUTO_INCREMENT,
    name     VARCHAR(150) NOT NULL,
    email    VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(20)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
);

-- ------------------------------------------------------------
--  Equipment Records  (main ICT asset entries)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment_records (
    id                 BIGINT         NOT NULL AUTO_INCREMENT,
    type               VARCHAR(100),
    equipment_type     VARCHAR(100),
    item_code          VARCHAR(100)   NOT NULL,
    article            VARCHAR(255)   NOT NULL,
    model              VARCHAR(150),
    serial_number      VARCHAR(100),
    amount_value       DECIMAL(12, 2),
    acquisition_date   DATE,
    office             VARCHAR(150),
    location           VARCHAR(150),
    description        VARCHAR(1000),
    accountable_person VARCHAR(150),
    created_at         DATETIME,
    updated_at         DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_equipment_item_code (item_code)
);

-- ------------------------------------------------------------
--  Tracking Logs  (activity/audit trail for ICT assets)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tracking_logs (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    equipment_record_id BIGINT       NOT NULL,
    action              VARCHAR(100) NOT NULL,
    performed_by        VARCHAR(150),
    location            VARCHAR(150),
    notes               VARCHAR(500),
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tracking_equipment FOREIGN KEY (equipment_record_id) REFERENCES equipment_records (id)
);

-- ------------------------------------------------------------
--  Legacy tables (retained for reference; not used by the
--  current ICT frontend modules)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_name (name)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    name           VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150),
    email          VARCHAR(150),
    phone          VARCHAR(20),
    address        VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS products (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150)   NOT NULL,
    description VARCHAR(500),
    sku         VARCHAR(50),
    price       DECIMAL(10, 2),
    category_id BIGINT,
    supplier_id BIGINT,
    PRIMARY KEY (id),
    UNIQUE KEY uk_products_sku (sku),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    product_id      BIGINT NOT NULL,
    quantity        INT    NOT NULL DEFAULT 0,
    min_stock_level INT    NOT NULL DEFAULT 0,
    location        VARCHAR(100),
    last_updated    DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_inventory_product (product_id),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS stock_transactions (
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    product_id       BIGINT      NOT NULL,
    type             VARCHAR(20) NOT NULL COMMENT 'IN | OUT | ADJUSTMENT',
    quantity         INT         NOT NULL,
    notes            VARCHAR(500),
    reference_number VARCHAR(100),
    created_at       DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_transactions_product FOREIGN KEY (product_id) REFERENCES products (id)
);
