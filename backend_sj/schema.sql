-- ============================================================
--  ICT Inventory & Tracking Management System — Database Schema
--  San Jose Municipal Hall, Republic of the Philippines
--
--  Run this file once in MySQL Workbench or CLI before starting
--  the backend for the first time (or after dropping the DB).
--
--  Usage:
--    mysql -u root -p < schema.sql
--  Or paste into MySQL Workbench and execute.
-- ============================================================

CREATE DATABASE IF NOT EXISTS inventory_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE inventory_db;

CREATE TABLE IF NOT EXISTS users (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    name                  VARCHAR(150) NOT NULL,
    email                 VARCHAR(150) NOT NULL,
    password              VARCHAR(255) NOT NULL,
    role                  VARCHAR(20)  NOT NULL,
    failed_login_attempts INT          NOT NULL DEFAULT 0,
    account_locked_until  DATETIME     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
);

CREATE TABLE IF NOT EXISTS equipment_records (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    type               VARCHAR(100),
    equipment_type     VARCHAR(100),
    item_code          VARCHAR(100)  NOT NULL,
    article            VARCHAR(255)  NOT NULL,
    office             VARCHAR(150),
    location           VARCHAR(150),
    description        VARCHAR(1000),
    accountable_person VARCHAR(150),
    created_at         DATETIME,
    updated_at         DATETIME,
    device_count       INT,
    PRIMARY KEY (id),
    UNIQUE KEY uk_equipment_item_code (item_code)
);

CREATE TABLE IF NOT EXISTS device_records (
    id                  BIGINT         NOT NULL AUTO_INCREMENT,
    equipment_record_id BIGINT         NOT NULL,
    model               VARCHAR(150),
    serial_number       VARCHAR(100),
    amount_value        DECIMAL(12, 2),
    acquisition_date    DATE,
    PRIMARY KEY (id),
    CONSTRAINT fk_device_equipment
        FOREIGN KEY (equipment_record_id) REFERENCES equipment_records (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tracking_logs (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    equipment_record_id BIGINT       NOT NULL,
    action              VARCHAR(100) NOT NULL,
    performed_by        VARCHAR(150),
    location            VARCHAR(150),
    notes               VARCHAR(500),
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tracking_equipment
        FOREIGN KEY (equipment_record_id) REFERENCES equipment_records (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    action       VARCHAR(50),
    module       VARCHAR(50),
    description  VARCHAR(500),
    performed_by VARCHAR(150),
    created_at   DATETIME,
    PRIMARY KEY (id)
);
