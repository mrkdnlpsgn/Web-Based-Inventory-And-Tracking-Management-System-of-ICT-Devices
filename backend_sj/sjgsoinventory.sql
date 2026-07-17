	-- =============================================================
-- San Jose GSO: Enterprise Asset Management System
-- Database Schema — MySQL DDL Script

	
-- =============================================================

CREATE DATABASE IF NOT EXISTS sjgsoinventory;
USE sjgsoinventory;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- TABLE: offices
-- Must be created before users (circular FK resolved below)
-- =============================================================
CREATE TABLE offices (
    office_id   INT             NOT NULL AUTO_INCREMENT,
    office_name VARCHAR(100)    NOT NULL,
    head_user_id INT            NULL,       -- FK added after users table
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_offices PRIMARY KEY (office_id),
    CONSTRAINT uq_offices_name UNIQUE (office_name)
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: users
-- =============================================================
CREATE TABLE users (
    user_id                     INT             NOT NULL AUTO_INCREMENT,
    username                    VARCHAR(50)     NOT NULL,
    email                       VARCHAR(255)    NULL COMMENT 'Used only for forgot-password OTP delivery, not login',
    password_hash               VARCHAR(255)    NOT NULL COMMENT 'BCrypt-hashed password',
    full_name                   VARCHAR(100)    NOT NULL,
    `role`                      ENUM(
                                    'ADMIN',
                                    'STAFF'
                                )               NOT NULL,
    office_id                   INT             NULL,
    is_active                   BOOLEAN         NOT NULL DEFAULT TRUE,
    failed_login_attempts       INT             NOT NULL DEFAULT 0,
    account_locked_until        DATETIME        NULL,
    token_version                INT            NOT NULL DEFAULT 0 COMMENT 'Bumped on password change to invalidate outstanding JWTs',
    must_change_password        BOOLEAN         NOT NULL DEFAULT TRUE COMMENT 'Forces a password change on next login — set on account creation and admin-mediated resets',
    last_password_reset_at      DATETIME        NULL,
    password_reset_otp_hash        VARCHAR(255) NULL COMMENT 'BCrypt-hashed 6-digit OTP, cleared after use/expiry',
    password_reset_otp_expires_at  DATETIME     NULL,
    password_reset_otp_attempts    INT          NOT NULL DEFAULT 0,
    privacy_acknowledged_at     DATETIME        NULL COMMENT 'Set when the user acknowledges the Data Privacy Notice; NULL means not yet acknowledged',
    created_at                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_users         PRIMARY KEY (user_id),
    CONSTRAINT uq_users_uname   UNIQUE (username),
    CONSTRAINT uq_users_email   UNIQUE (email),
    CONSTRAINT fk_users_office  FOREIGN KEY (office_id)
        REFERENCES offices (office_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- Resolve circular FK: offices.head_user_id → users
ALTER TABLE offices
    ADD CONSTRAINT fk_offices_head
    FOREIGN KEY (head_user_id)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- =============================================================
-- TABLE: categories
-- =============================================================
CREATE TABLE categories (
    category_id     INT             NOT NULL AUTO_INCREMENT,
    category_name   VARCHAR(100)    NOT NULL COMMENT 'e.g., ICT Equipment, Furniture, Appliance',
    `description`   TEXT            NULL,

    CONSTRAINT pk_categories        PRIMARY KEY (category_id),
    CONSTRAINT uq_categories_name   UNIQUE (category_name)
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: assets
-- =============================================================
CREATE TABLE assets (
    asset_id                INT             NOT NULL AUTO_INCREMENT,
    property_number         VARCHAR(50)     NOT NULL COMMENT 'Official COA-assigned property number',
    `description`           VARCHAR(255)    NOT NULL COMMENT 'Article / equipment description',
    category_id             INT             NOT NULL,
    quantity                INT             NOT NULL DEFAULT 1,
    acquisition_date        DATE            NOT NULL,
    unit_value              DECIMAL(12,2)   NOT NULL COMMENT 'Acquisition unit value in PHP',
    office_id               INT             NOT NULL COMMENT 'Currently assigned office / location',
    accountable_person      VARCHAR(150)    NULL    COMMENT 'Name of person accountable for this asset',
    physical_count          INT             NULL    COMMENT 'Actual count during physical inventory; NULL if not yet counted',
    location                VARCHAR(150)    NOT NULL COMMENT 'Physical location of the asset',
    `condition`             ENUM(
                                'SERVICEABLE',
                                'REPAIRABLE',
                                'UNSERVICEABLE'
                            )               NOT NULL,
    lifecycle_status        ENUM(
                                'REGISTERED',
                                'ASSIGNED',
                                'TRANSFERRED',
                                'UNDER_MAINTENANCE',
                                'DISPOSED',
                                'ARCHIVED'
                            )               NOT NULL,
    qr_code_path            VARCHAR(255)    NULL COMMENT 'File path or URL of QR code image (ZXing)',
    sha256_hash             VARCHAR(64)     NULL COMMENT '64-char hex hash for tamper detection',
    remarks                 TEXT            NULL,
    is_deleted              BOOLEAN         NOT NULL DEFAULT FALSE
                            COMMENT 'Soft delete flag; TRUE = record is deleted but retained in table',
    deleted_at              DATETIME        NULL
                            COMMENT 'Timestamp when the record was soft-deleted',
    deleted_by              INT             NULL
                            COMMENT 'User who performed the soft delete (ref: users)',
    delete_reason           TEXT            NULL
                            COMMENT 'Reason provided by the user when deleting the record',
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                     ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_assets            PRIMARY KEY (asset_id),
    CONSTRAINT uq_assets_prop_no    UNIQUE (property_number),
    CONSTRAINT fk_assets_category   FOREIGN KEY (category_id)
        REFERENCES categories (category_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_assets_office     FOREIGN KEY (office_id)
        REFERENCES offices (office_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_assets_deleted_by FOREIGN KEY (deleted_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: asset_history
-- =============================================================
CREATE TABLE asset_history (
    history_id      INT     NOT NULL AUTO_INCREMENT,
    asset_id        INT     NOT NULL,
    event_type      ENUM(
                        'REGISTERED',
                        'ASSIGNED',
                        'TRANSFERRED',
                        'MAINTENANCE',
                        'DISPOSAL',
                        'ARCHIVED'
                    )       NOT NULL,
    from_office_id  INT     NULL COMMENT 'Source office (transfers only)',
    to_office_id    INT     NULL COMMENT 'Destination office (transfers only)',
    performed_by    INT     NOT NULL COMMENT 'User who performed the action',
    event_date      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes           TEXT    NULL,

    CONSTRAINT pk_asset_history         PRIMARY KEY (history_id),
    CONSTRAINT fk_ah_asset              FOREIGN KEY (asset_id)
        REFERENCES assets (asset_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_ah_from_office        FOREIGN KEY (from_office_id)
        REFERENCES offices (office_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_ah_to_office          FOREIGN KEY (to_office_id)
        REFERENCES offices (office_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_ah_performed_by       FOREIGN KEY (performed_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: maintenance_ledger
-- =============================================================
CREATE TABLE maintenance_ledger (
    maintenance_id      INT             NOT NULL AUTO_INCREMENT,
    asset_id            INT             NOT NULL,
    maintenance_type    ENUM(
                            'PREVENTIVE',
                            'CORRECTIVE',
                            'REPAIR'
                        )               NOT NULL,
    findings            TEXT            NOT NULL,
    actions_taken       TEXT            NOT NULL,
    assigned_to         VARCHAR(150)    NULL COMMENT 'Name of technician or responsible person',
    maintenance_date    DATE            NOT NULL,
    cost                DECIMAL(10,2)   NULL COMMENT 'Cost in PHP; NULL if no cost incurred',
    status              ENUM(
                            'COMPLETED',
                            'ONGOING',
                            'SCHEDULED'
                        )               NOT NULL,
    recorded_by         INT             NOT NULL COMMENT 'User who logged the record',
    is_deleted          BOOLEAN         NOT NULL DEFAULT FALSE
                        COMMENT 'Soft delete flag',
    deleted_at          DATETIME        NULL,
    deleted_by          INT             NULL
                        COMMENT 'User who soft-deleted this record (ref: users)',
    delete_reason       TEXT            NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                 ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_maintenance           PRIMARY KEY (maintenance_id),
    CONSTRAINT fk_ml_asset              FOREIGN KEY (asset_id)
        REFERENCES assets (asset_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_ml_recorded_by        FOREIGN KEY (recorded_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ml_deleted_by         FOREIGN KEY (deleted_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: disposal_ledger
-- =============================================================
CREATE TABLE disposal_ledger (
    disposal_id             INT     NOT NULL AUTO_INCREMENT,
    asset_id                INT     NOT NULL,
    reason                  TEXT    NOT NULL,
    inspection_findings     TEXT    NOT NULL,
    recommended_method      ENUM(
                                'AUCTION',
                                'DONATION',
                                'TRANSFER'
                            )       NOT NULL,
    disposal_status         ENUM(
                                'PENDING',
                                'APPROVED',
                                'COMPLETED'
                            )       NOT NULL DEFAULT 'PENDING',
    inspection_date         DATE    NOT NULL,
    approved_by             VARCHAR(150) NULL COMMENT 'Name of approving authority',
    appraised_value         DECIMAL(12,2) NULL COMMENT 'Value assigned by the appraisal/inspection committee',
    or_number               VARCHAR(50) NULL COMMENT 'Official Receipt number, set once the item is actually sold',
    amount                  DECIMAL(12,2) NULL COMMENT 'Actual sale amount, set once the item is actually sold',
    recorded_by             INT     NOT NULL,
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE
                            COMMENT 'Soft delete flag',
    deleted_at              DATETIME NULL,
    deleted_by              INT     NULL
                            COMMENT 'User who soft-deleted this record (ref: users)',
    delete_reason           TEXT    NULL,
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_disposal              PRIMARY KEY (disposal_id),
    CONSTRAINT fk_dl_asset              FOREIGN KEY (asset_id)
        REFERENCES assets (asset_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_dl_recorded_by        FOREIGN KEY (recorded_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_dl_deleted_by         FOREIGN KEY (deleted_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: ai_recommendations
-- =============================================================
CREATE TABLE ai_recommendations (
    recommendation_id       INT             NOT NULL AUTO_INCREMENT,
    asset_id                INT             NOT NULL,
    asset_age_years         DECIMAL(5,2)    NOT NULL COMMENT 'Computed age of the asset in years',
    total_repair_cost       DECIMAL(12,2)   NOT NULL COMMENT 'Cumulative repair costs from maintenance ledger',
    repair_frequency        INT             NOT NULL COMMENT 'Count of REPAIR-type maintenance events',
    condition_score         INT             NOT NULL COMMENT '1=Unserviceable, 2=Repairable, 3=Serviceable',
    recommendation          ENUM(
                                'MAINTAIN',
                                'REPAIR',
                                'MONITOR',
                                'REVIEW_FOR_DISPOSAL',
                                'BUDGET_PRIORITY'
                            )               NOT NULL,
    rationale               TEXT            NOT NULL COMMENT 'Explanation based on rule evaluation',
    generated_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by_system     BOOLEAN         NOT NULL DEFAULT TRUE
                            COMMENT 'TRUE = auto-generated; FALSE = manually triggered',

    CONSTRAINT pk_ai_recommendations    PRIMARY KEY (recommendation_id),
    CONSTRAINT fk_air_asset             FOREIGN KEY (asset_id)
        REFERENCES assets (asset_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT chk_condition_score      CHECK (condition_score BETWEEN 1 AND 3)
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: audit_logs
-- =============================================================
CREATE TABLE audit_logs (
    log_id          INT             NOT NULL AUTO_INCREMENT,
    user_id         INT             NOT NULL,
    action          VARCHAR(100)    NOT NULL
                    COMMENT 'e.g., ASSET_CREATED, ASSET_TRANSFERRED, MAINTENANCE_LOGGED, USER_LOGIN',
    module          VARCHAR(50)     NOT NULL
                    COMMENT 'e.g., Inventory, Maintenance, Disposal, Users',
    target_id       INT             NULL COMMENT 'PK of the affected record',
    target_type     VARCHAR(50)     NULL COMMENT 'e.g., asset, maintenance, disposal, user',
    details         TEXT            NULL COMMENT 'Additional details or changed values',
    ip_address      VARCHAR(45)     NULL COMMENT 'IPv4 or IPv6 address of the user session',
    logged_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_audit_logs    PRIMARY KEY (log_id),
    CONSTRAINT fk_al_user       FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: deleted_assets
-- Archive table — full snapshot of an asset row at deletion time.
-- Populated via application logic (Spring Boot service) when a
-- soft-delete is confirmed. No FK constraints on snapshot fields
-- so records remain intact even if referenced offices/users are
-- later removed.
-- =============================================================
CREATE TABLE deleted_assets (
    deleted_asset_id        INT             NOT NULL AUTO_INCREMENT,

    -- Original asset identity
    asset_id                INT             NOT NULL COMMENT 'Original PK from assets table',
    property_number         VARCHAR(50)     NOT NULL,
    `description`           VARCHAR(255)    NOT NULL,
    category_id             INT             NOT NULL,
    category_name           VARCHAR(100)    NOT NULL COMMENT 'Snapshot of category name at deletion',
    quantity                INT             NOT NULL,
    acquisition_date        DATE            NOT NULL,
    unit_value              DECIMAL(12,2)   NOT NULL,
    office_id               INT             NOT NULL,
    office_name             VARCHAR(100)    NOT NULL COMMENT 'Snapshot of office name at deletion',
    accountable_person_name VARCHAR(150)    NOT NULL COMMENT 'Snapshot of accountable person name',
    location                VARCHAR(150)    NOT NULL,
    `condition`             ENUM(
                                'SERVICEABLE',
                                'REPAIRABLE',
                                'UNSERVICEABLE'
                            )               NOT NULL,
    lifecycle_status        ENUM(
                                'REGISTERED',
                                'ASSIGNED',
                                'TRANSFERRED',
                                'UNDER_MAINTENANCE',
                                'DISPOSED',
                                'ARCHIVED'
                            )               NOT NULL,
    qr_code_path            VARCHAR(255)    NULL,
    sha256_hash             VARCHAR(64)     NULL,
    remarks                 TEXT            NULL,

    -- Original timestamps
    original_created_at     DATETIME        NOT NULL COMMENT 'created_at from the assets row',
    original_updated_at     DATETIME        NOT NULL COMMENT 'updated_at from the assets row',

    -- Deletion metadata
    deleted_by_user_id      INT             NOT NULL COMMENT 'User who performed the deletion',
    deleted_by_username     VARCHAR(50)     NOT NULL COMMENT 'Snapshot of username at deletion',
    delete_reason           TEXT            NULL COMMENT 'Reason entered by the user',
    deleted_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_deleted_assets PRIMARY KEY (deleted_asset_id),
    INDEX idx_da_asset_id       (asset_id),
    INDEX idx_da_property_no    (property_number),
    INDEX idx_da_deleted_at     (deleted_at),
    INDEX idx_da_deleted_by     (deleted_by_user_id)
) ENGINE=InnoDB COMMENT='Archive of soft-deleted asset records with full snapshots';

-- =============================================================
-- TABLE: deleted_maintenance
-- Archive table — full snapshot of a maintenance_ledger row at
-- deletion time, linked back to the original asset via asset_id.
-- =============================================================
CREATE TABLE deleted_maintenance (
    deleted_maintenance_id  INT             NOT NULL AUTO_INCREMENT,

    -- Original record identity
    maintenance_id          INT             NOT NULL COMMENT 'Original PK from maintenance_ledger',
    asset_id                INT             NOT NULL COMMENT 'Original FK to assets',
    property_number         VARCHAR(50)     NOT NULL COMMENT 'Snapshot of property number',
    asset_description       VARCHAR(255)    NOT NULL COMMENT 'Snapshot of asset description',

    -- Maintenance record fields
    maintenance_type        ENUM(
                                'PREVENTIVE',
                                'CORRECTIVE',
                                'REPAIR'
                            )               NOT NULL,
    findings                TEXT            NOT NULL,
    actions_taken           TEXT            NOT NULL,
    assigned_to_user_id     INT             NULL,
    assigned_to_name        VARCHAR(100)    NULL COMMENT 'Snapshot of assigned technician name',
    maintenance_date        DATE            NOT NULL,
    cost                    DECIMAL(10,2)   NULL,
    status                  ENUM(
                                'COMPLETED',
                                'ONGOING',
                                'SCHEDULED'
                            )               NOT NULL,
    recorded_by_user_id     INT             NOT NULL,
    recorded_by_name        VARCHAR(100)    NOT NULL COMMENT 'Snapshot of recorder name',

    -- Original timestamp
    original_created_at     DATETIME        NOT NULL,

    -- Deletion metadata
    deleted_by_user_id      INT             NOT NULL,
    deleted_by_username     VARCHAR(50)     NOT NULL,
    delete_reason           TEXT            NULL,
    deleted_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_deleted_maintenance PRIMARY KEY (deleted_maintenance_id),
    INDEX idx_dm_maintenance_id (maintenance_id),
    INDEX idx_dm_asset_id       (asset_id),
    INDEX idx_dm_deleted_at     (deleted_at),
    INDEX idx_dm_deleted_by     (deleted_by_user_id)
) ENGINE=InnoDB COMMENT='Archive of soft-deleted maintenance ledger records';

-- =============================================================
-- TABLE: deleted_disposal
-- Archive table — full snapshot of a disposal_ledger row at
-- deletion time.
-- =============================================================
CREATE TABLE deleted_disposal (
    deleted_disposal_id     INT     NOT NULL AUTO_INCREMENT,

    -- Original record identity
    disposal_id             INT     NOT NULL COMMENT 'Original PK from disposal_ledger',
    asset_id                INT     NOT NULL COMMENT 'Original FK to assets',
    property_number         VARCHAR(50)     NOT NULL COMMENT 'Snapshot of property number',
    asset_description       VARCHAR(255)    NOT NULL COMMENT 'Snapshot of asset description',

    -- Disposal record fields
    reason                  TEXT    NOT NULL,
    inspection_findings     TEXT    NOT NULL,
    recommended_method      ENUM(
                                'AUCTION',
                                'DONATION',
                                'TRANSFER'
                            )       NOT NULL,
    disposal_status         ENUM(
                                'PENDING',
                                'APPROVED',
                                'COMPLETED'
                            )       NOT NULL,
    inspection_date         DATE    NOT NULL,
    approved_by_user_id     INT     NULL,
    approved_by_name        VARCHAR(100)    NULL COMMENT 'Snapshot of approver name',
    appraised_value         DECIMAL(12,2) NULL,
    or_number               VARCHAR(50) NULL,
    amount                  DECIMAL(12,2) NULL,
    recorded_by_user_id     INT     NOT NULL,
    recorded_by_name        VARCHAR(100)    NOT NULL COMMENT 'Snapshot of recorder name',

    -- Original timestamp
    original_created_at     DATETIME        NOT NULL,

    -- Deletion metadata
    deleted_by_user_id      INT             NOT NULL,
    deleted_by_username     VARCHAR(50)     NOT NULL,
    delete_reason           TEXT            NULL,
    deleted_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_deleted_disposal PRIMARY KEY (deleted_disposal_id),
    INDEX idx_dd_disposal_id    (disposal_id),
    INDEX idx_dd_asset_id       (asset_id),
    INDEX idx_dd_deleted_at     (deleted_at),
    INDEX idx_dd_deleted_by     (deleted_by_user_id)
) ENGINE=InnoDB COMMENT='Archive of soft-deleted disposal ledger records';

-- =============================================================
-- TABLE: equipment_records
-- =============================================================
CREATE TABLE equipment_records (
    equipment_id              INT           NOT NULL AUTO_INCREMENT,
    type                      VARCHAR(50)   NOT NULL COMMENT 'Hardware, Software, Peripherals, etc.',
    equipment_type            VARCHAR(100)  NOT NULL COMMENT 'Desktop Computer, Laptop, Printer, etc.',
    item_code                 VARCHAR(50)   NOT NULL COMMENT 'ICT-assigned item code',
    article                   VARCHAR(255)  NOT NULL COMMENT 'Common name / article of the equipment',
    office                    VARCHAR(255)  NOT NULL COMMENT 'Assigned office name',
    location                  VARCHAR(255)  NOT NULL COMMENT 'Physical location',
    description               TEXT          NULL,
    accountable_person        VARCHAR(150)  NOT NULL,
    accountable_person_phone  VARCHAR(50)   NULL,
    accountable_person_email  VARCHAR(150)  NULL,
    device_count              INT           NOT NULL DEFAULT 0,
    created_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                     ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_equipment PRIMARY KEY (equipment_id)
) ENGINE=InnoDB;

-- =============================================================
-- TABLE: device_records
-- =============================================================
CREATE TABLE device_records (
    device_id         INT            NOT NULL AUTO_INCREMENT,
    equipment_id      INT            NOT NULL,
    item_code         VARCHAR(50)    NULL,
    serial_number     VARCHAR(100)   NULL,
    model             VARCHAR(100)   NULL,
    amount_value      DECIMAL(12,2)  NULL COMMENT 'Acquisition unit value in PHP',
    acquisition_date  DATE           NULL,
    created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_devices           PRIMARY KEY (device_id),
    CONSTRAINT fk_devices_equipment FOREIGN KEY (equipment_id)
        REFERENCES equipment_records (equipment_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- INDEXES (for common query patterns)
-- =============================================================

-- assets: frequent filter columns
CREATE INDEX idx_assets_category       ON assets (category_id);
CREATE INDEX idx_assets_office         ON assets (office_id);
CREATE INDEX idx_assets_condition      ON assets (`condition`);
CREATE INDEX idx_assets_lifecycle      ON assets (lifecycle_status);
CREATE INDEX idx_assets_accountable    ON assets (accountable_person);
CREATE INDEX idx_assets_is_deleted     ON assets (is_deleted);      -- exclude deleted rows efficiently

-- asset_history: lookups per asset
CREATE INDEX idx_ah_asset_id           ON asset_history (asset_id);
CREATE INDEX idx_ah_event_date         ON asset_history (event_date);

-- maintenance_ledger: lookups per asset and date
CREATE INDEX idx_ml_asset_id           ON maintenance_ledger (asset_id);
CREATE INDEX idx_ml_maintenance_date   ON maintenance_ledger (maintenance_date);
CREATE INDEX idx_ml_type               ON maintenance_ledger (maintenance_type);
CREATE INDEX idx_ml_is_deleted         ON maintenance_ledger (is_deleted);

-- disposal_ledger: lookups per asset and status
CREATE INDEX idx_dl_asset_id           ON disposal_ledger (asset_id);
CREATE INDEX idx_dl_status             ON disposal_ledger (disposal_status);
CREATE INDEX idx_dl_is_deleted         ON disposal_ledger (is_deleted);

-- ai_recommendations: latest recommendation per asset
CREATE INDEX idx_air_asset_id          ON ai_recommendations (asset_id);
CREATE INDEX idx_air_generated_at      ON ai_recommendations (generated_at);

-- equipment_records: common filters
CREATE INDEX idx_eq_type               ON equipment_records (type);
CREATE INDEX idx_eq_office             ON equipment_records (office);
CREATE INDEX idx_eq_created_at         ON equipment_records (created_at);

-- device_records: lookups by parent equipment
CREATE INDEX idx_dr_equipment_id       ON device_records (equipment_id);
CREATE INDEX idx_dr_serial_number      ON device_records (serial_number);

-- audit_logs: filtering by user, module, date
CREATE INDEX idx_al_user_id            ON audit_logs (user_id);
CREATE INDEX idx_al_module             ON audit_logs (module);
CREATE INDEX idx_al_logged_at          ON audit_logs (logged_at);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- DEFAULT SEED DATA
-- =============================================================

-- Default offices
INSERT INTO offices (office_name) VALUES
  ('Office of the Mayor'),
  ('Office of the Vice Mayor'),
  ('Sangguniang Bayan Office'),
  ('Human Resource Management Office'),
  ('Budget Office'),
  ('Accounting Office'),
  ('Treasury Office'),
  ('Assessor\'s Office'),
  ('Civil Registrar\'s Office'),
  ('Municipal Engineering Office'),
  ('Municipal Planning and Development Office'),
  ('Municipal Health Office'),
  ('Municipal Social Welfare and Development Office'),
  ('Municipal Agriculture Office'),
  ('General Services Office'),
  ('Information and Communications Technology Office'),
  ('Disaster Risk Reduction and Management Office')
ON DUPLICATE KEY UPDATE office_name = VALUES(office_name);

-- Default user accounts (BCrypt cost=10 hashed passwords)
-- admin / admin123
-- ict_staff / ict2024
INSERT INTO users (username, password_hash, full_name, `role`, is_active)
VALUES
  ('admin',     '$2a$10$HX3mXMSxuwtsps2HvhHKoO3pg1P6i.otAJrRaK03mB9lSSkjIc50a', 'Administrator', 'ADMIN', TRUE),
  ('ict_staff', '$2a$10$/yz1ylkBTggXuOMJBUCsqO72r.yJ3N8gFfAei64BMRexq5huYAmWG', 'ICT Officer',   'STAFF', TRUE)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  full_name     = VALUES(full_name),
  `role`        = VALUES(`role`),
  is_active     = TRUE;

-- =============================================================
-- TABLE: idempotency_keys
-- Cross-cutting infra (not domain data), so accessed via plain JdbcTemplate SQL in
-- IdempotencyService rather than stored procedures. Guards POST create endpoints
-- against duplicate submission (double-tap, client retry after a dropped response).
-- =============================================================
CREATE TABLE idempotency_keys (
    idempotency_key   VARCHAR(255)  NOT NULL,
    request_method    VARCHAR(10)   NOT NULL,
    request_path      VARCHAR(255)  NOT NULL,
    username          VARCHAR(50)   NOT NULL,
    response_status   INT           NULL COMMENT 'NULL = claimed but still in progress',
    response_body     LONGTEXT      NULL,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at      DATETIME      NULL,

    CONSTRAINT pk_idempotency_keys PRIMARY KEY (idempotency_key, request_method, request_path)
) ENGINE=InnoDB;

-- =============================================================
-- END OF SCHEMA
-- =============================================================
