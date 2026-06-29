-- =============================================================
-- GSO Inventory Management System — Stored Procedures
-- Import into gso_eam database AFTER running sjgsoinventory.sql
-- =============================================================

DELIMITER $$

-- =============================================================
-- AUTH
-- =============================================================

DROP PROCEDURE IF EXISTS sp_auth_get_user_for_login $$
CREATE PROCEDURE sp_auth_get_user_for_login(IN p_username VARCHAR(50))
BEGIN
    SELECT u.user_id AS id, u.username, u.password_hash AS password,
           u.full_name AS fullName, u.`role`, u.is_active AS isActive,
           u.failed_login_attempts AS failedLoginAttempts,
           u.account_locked_until AS accountLockedUntil
    FROM users u
    WHERE LOWER(u.username) = LOWER(p_username);
END $$

DROP PROCEDURE IF EXISTS sp_auth_login_success $$
CREATE PROCEDURE sp_auth_login_success(IN p_user_id INT)
BEGIN
    UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL
    WHERE user_id = p_user_id;
END $$

DROP PROCEDURE IF EXISTS sp_auth_login_failure $$
CREATE PROCEDURE sp_auth_login_failure(IN p_user_id INT, IN p_max_attempts INT, IN p_lockout_minutes INT)
BEGIN
    UPDATE users
    SET failed_login_attempts = failed_login_attempts + 1,
        account_locked_until = CASE
            WHEN failed_login_attempts + 1 >= p_max_attempts
                THEN DATE_ADD(NOW(), INTERVAL p_lockout_minutes MINUTE)
            ELSE account_locked_until
        END
    WHERE user_id = p_user_id;
END $$

-- =============================================================
-- OFFICES
-- =============================================================

DROP PROCEDURE IF EXISTS sp_offices_get_all $$
CREATE PROCEDURE sp_offices_get_all()
BEGIN
    SELECT o.office_id AS id, o.office_name AS officeName, o.created_at AS createdAt,
           u.user_id AS hu_id, u.username AS hu_username, u.full_name AS hu_fullName
    FROM offices o
    LEFT JOIN users u ON o.head_user_id = u.user_id
    ORDER BY o.office_name;
END $$

DROP PROCEDURE IF EXISTS sp_offices_search $$
CREATE PROCEDURE sp_offices_search(IN p_search VARCHAR(255))
BEGIN
    SET p_search = TRIM(p_search);
    SELECT o.office_id AS id, o.office_name AS officeName, o.created_at AS createdAt,
           u.user_id AS hu_id, u.username AS hu_username, u.full_name AS hu_fullName
    FROM offices o
    LEFT JOIN users u ON o.head_user_id = u.user_id
    WHERE o.office_name LIKE CONCAT('%', p_search, '%')
    ORDER BY o.office_name;
END $$

DROP PROCEDURE IF EXISTS sp_offices_get_by_id $$
CREATE PROCEDURE sp_offices_get_by_id(IN p_id INT)
BEGIN
    SELECT o.office_id AS id, o.office_name AS officeName, o.created_at AS createdAt,
           u.user_id AS hu_id, u.username AS hu_username, u.full_name AS hu_fullName
    FROM offices o
    LEFT JOIN users u ON o.head_user_id = u.user_id
    WHERE o.office_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_offices_create $$
CREATE PROCEDURE sp_offices_create(IN p_name VARCHAR(100), IN p_head_user_id INT, OUT p_id INT)
BEGIN
    INSERT INTO offices(office_name, head_user_id, created_at)
    VALUES(p_name, NULLIF(p_head_user_id, 0), NOW());
    SET p_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_offices_update $$
CREATE PROCEDURE sp_offices_update(IN p_id INT, IN p_name VARCHAR(100), IN p_head_user_id INT)
BEGIN
    UPDATE offices
    SET office_name = p_name, head_user_id = NULLIF(p_head_user_id, 0)
    WHERE office_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_offices_delete $$
CREATE PROCEDURE sp_offices_delete(IN p_id INT)
BEGIN
    DELETE FROM offices WHERE office_id = p_id;
END $$

-- =============================================================
-- CATEGORIES
-- =============================================================

DROP PROCEDURE IF EXISTS sp_categories_get_all $$
CREATE PROCEDURE sp_categories_get_all()
BEGIN
    SELECT category_id AS id, category_name AS categoryName, `description`
    FROM categories ORDER BY category_name;
END $$

DROP PROCEDURE IF EXISTS sp_categories_search $$
CREATE PROCEDURE sp_categories_search(IN p_search VARCHAR(255))
BEGIN
    SET p_search = TRIM(p_search);
    SELECT category_id AS id, category_name AS categoryName, `description`
    FROM categories
    WHERE category_name LIKE CONCAT('%', p_search, '%')
       OR `description` LIKE CONCAT('%', p_search, '%')
    ORDER BY category_name;
END $$

DROP PROCEDURE IF EXISTS sp_categories_get_by_id $$
CREATE PROCEDURE sp_categories_get_by_id(IN p_id INT)
BEGIN
    SELECT category_id AS id, category_name AS categoryName, `description`
    FROM categories WHERE category_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_categories_name_exists $$
CREATE PROCEDURE sp_categories_name_exists(IN p_name VARCHAR(100), OUT p_exists BOOLEAN)
BEGIN
    SELECT COUNT(*) > 0 INTO p_exists FROM categories
    WHERE LOWER(category_name) = LOWER(p_name);
END $$

DROP PROCEDURE IF EXISTS sp_categories_create $$
CREATE PROCEDURE sp_categories_create(IN p_name VARCHAR(100), IN p_description TEXT, OUT p_id INT)
BEGIN
    INSERT INTO categories(category_name, `description`) VALUES(p_name, p_description);
    SET p_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_categories_update $$
CREATE PROCEDURE sp_categories_update(IN p_id INT, IN p_name VARCHAR(100), IN p_description TEXT)
BEGIN
    UPDATE categories SET category_name = p_name, `description` = p_description
    WHERE category_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_categories_delete $$
CREATE PROCEDURE sp_categories_delete(IN p_id INT)
BEGIN
    DELETE FROM categories WHERE category_id = p_id;
END $$

-- =============================================================
-- USERS
-- =============================================================

DROP PROCEDURE IF EXISTS sp_users_get_all $$
CREATE PROCEDURE sp_users_get_all()
BEGIN
    SELECT u.user_id AS id, u.username, u.full_name AS fullName, u.`role`,
           u.is_active AS isActive, u.created_at AS createdAt,
           o.office_id AS office_id, o.office_name AS office_officeName
    FROM users u
    LEFT JOIN offices o ON u.office_id = o.office_id
    ORDER BY u.full_name;
END $$

DROP PROCEDURE IF EXISTS sp_users_search $$
CREATE PROCEDURE sp_users_search(IN p_search VARCHAR(255))
BEGIN
    SET p_search = TRIM(p_search);
    SELECT u.user_id AS id, u.username, u.full_name AS fullName, u.`role`,
           u.is_active AS isActive, u.created_at AS createdAt,
           o.office_id AS office_id, o.office_name AS office_officeName
    FROM users u
    LEFT JOIN offices o ON u.office_id = o.office_id
    WHERE u.username LIKE CONCAT('%', p_search, '%')
       OR u.full_name LIKE CONCAT('%', p_search, '%')
       OR u.`role` LIKE CONCAT('%', p_search, '%')
       OR o.office_name LIKE CONCAT('%', p_search, '%')
    ORDER BY u.full_name;
END $$

DROP PROCEDURE IF EXISTS sp_users_get_by_id $$
CREATE PROCEDURE sp_users_get_by_id(IN p_id INT)
BEGIN
    SELECT u.user_id AS id, u.username, u.full_name AS fullName, u.`role`,
           u.is_active AS isActive, u.created_at AS createdAt,
           o.office_id AS office_id, o.office_name AS office_officeName
    FROM users u
    LEFT JOIN offices o ON u.office_id = o.office_id
    WHERE u.user_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_users_get_by_username $$
CREATE PROCEDURE sp_users_get_by_username(IN p_username VARCHAR(50))
BEGIN
    SELECT u.user_id AS id, u.username, u.password_hash AS password,
           u.full_name AS fullName, u.`role`, u.is_active AS isActive,
           u.failed_login_attempts AS failedLoginAttempts,
           u.account_locked_until AS accountLockedUntil,
           u.created_at AS createdAt,
           o.office_id AS office_id, o.office_name AS office_officeName
    FROM users u
    LEFT JOIN offices o ON u.office_id = o.office_id
    WHERE LOWER(u.username) = LOWER(p_username);
END $$

DROP PROCEDURE IF EXISTS sp_users_username_exists $$
CREATE PROCEDURE sp_users_username_exists(IN p_username VARCHAR(50), OUT p_exists BOOLEAN)
BEGIN
    SELECT COUNT(*) > 0 INTO p_exists FROM users
    WHERE LOWER(username) = LOWER(p_username);
END $$

DROP PROCEDURE IF EXISTS sp_users_create $$
CREATE PROCEDURE sp_users_create(
    IN p_username VARCHAR(50), IN p_password_hash VARCHAR(255),
    IN p_full_name VARCHAR(100), IN p_role VARCHAR(20),
    IN p_office_id INT, IN p_is_active BOOLEAN,
    OUT p_id INT
)
BEGIN
    INSERT INTO users(username, password_hash, full_name, `role`, office_id, is_active, created_at)
    VALUES(p_username, p_password_hash, p_full_name, p_role, NULLIF(p_office_id, 0), p_is_active, NOW());
    SET p_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_users_update $$
CREATE PROCEDURE sp_users_update(
    IN p_id INT, IN p_full_name VARCHAR(100), IN p_role VARCHAR(20),
    IN p_office_id INT, IN p_is_active BOOLEAN, IN p_password_hash VARCHAR(255)
)
BEGIN
    UPDATE users
    SET full_name = p_full_name,
        `role` = p_role,
        office_id = NULLIF(p_office_id, 0),
        is_active = p_is_active,
        password_hash = IF(p_password_hash IS NULL OR p_password_hash = '', password_hash, p_password_hash)
    WHERE user_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_users_change_password $$
CREATE PROCEDURE sp_users_change_password(IN p_id INT, IN p_password_hash VARCHAR(255))
BEGIN
    UPDATE users SET password_hash = p_password_hash WHERE user_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_users_delete $$
CREATE PROCEDURE sp_users_delete(IN p_id INT)
BEGIN
    DELETE FROM users WHERE user_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_users_reset_lockout $$
CREATE PROCEDURE sp_users_reset_lockout(
    IN p_id INT, IN p_password_hash VARCHAR(255),
    IN p_full_name VARCHAR(100), IN p_role VARCHAR(20)
)
BEGIN
    UPDATE users
    SET password_hash = p_password_hash, full_name = p_full_name, `role` = p_role,
        failed_login_attempts = 0, account_locked_until = NULL, is_active = TRUE
    WHERE user_id = p_id;
END $$

-- =============================================================
-- ASSETS
-- =============================================================

DROP PROCEDURE IF EXISTS sp_assets_get_all $$
CREATE PROCEDURE sp_assets_get_all()
BEGIN
    SELECT a.asset_id AS id, a.property_number AS propertyNumber, a.`description`,
           a.quantity, a.acquisition_date AS acquisitionDate, a.unit_value AS unitValue,
           a.location, a.`condition`, a.lifecycle_status AS lifecycleStatus,
           a.accountable_person AS accountablePerson, a.physical_count AS physicalCount,
           a.qr_code_path AS qrCodePath, a.sha256_hash AS sha256Hash,
           a.remarks, a.created_at AS createdAt, a.updated_at AS updatedAt,
           c.category_id, c.category_name AS categoryName,
           o.office_id, o.office_name AS officeName
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.category_id
    LEFT JOIN offices o ON a.office_id = o.office_id
    WHERE a.is_deleted = FALSE
    ORDER BY a.created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_assets_search $$
CREATE PROCEDURE sp_assets_search(IN p_search VARCHAR(255))
BEGIN
    SET p_search = TRIM(p_search);
    SELECT a.asset_id AS id, a.property_number AS propertyNumber, a.`description`,
           a.quantity, a.acquisition_date AS acquisitionDate, a.unit_value AS unitValue,
           a.location, a.`condition`, a.lifecycle_status AS lifecycleStatus,
           a.accountable_person AS accountablePerson, a.physical_count AS physicalCount,
           a.qr_code_path AS qrCodePath, a.sha256_hash AS sha256Hash,
           a.remarks, a.created_at AS createdAt, a.updated_at AS updatedAt,
           c.category_id, c.category_name AS categoryName,
           o.office_id, o.office_name AS officeName
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.category_id
    LEFT JOIN offices o ON a.office_id = o.office_id
    WHERE a.is_deleted = FALSE
      AND (
        a.property_number    LIKE CONCAT('%', p_search, '%')
        OR a.`description`   LIKE CONCAT('%', p_search, '%')
        OR a.accountable_person LIKE CONCAT('%', p_search, '%')
        OR a.location        LIKE CONCAT('%', p_search, '%')
        OR a.`condition`     LIKE CONCAT('%', p_search, '%')
        OR a.lifecycle_status LIKE CONCAT('%', p_search, '%')
        OR c.category_name   LIKE CONCAT('%', p_search, '%')
        OR o.office_name     LIKE CONCAT('%', p_search, '%')
      )
    ORDER BY a.created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_assets_get_by_id $$
CREATE PROCEDURE sp_assets_get_by_id(IN p_id INT)
BEGIN
    SELECT a.asset_id AS id, a.property_number AS propertyNumber, a.`description`,
           a.quantity, a.acquisition_date AS acquisitionDate, a.unit_value AS unitValue,
           a.location, a.`condition`, a.lifecycle_status AS lifecycleStatus,
           a.accountable_person AS accountablePerson, a.physical_count AS physicalCount,
           a.qr_code_path AS qrCodePath, a.sha256_hash AS sha256Hash,
           a.remarks, a.created_at AS createdAt, a.updated_at AS updatedAt,
           c.category_id, c.category_name AS categoryName,
           o.office_id, o.office_name AS officeName
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.category_id
    LEFT JOIN offices o ON a.office_id = o.office_id
    WHERE a.asset_id = p_id AND a.is_deleted = FALSE;
END $$

DROP PROCEDURE IF EXISTS sp_assets_create $$
CREATE PROCEDURE sp_assets_create(
    IN p_property_number VARCHAR(50), IN p_description VARCHAR(255),
    IN p_category_id INT, IN p_quantity INT, IN p_acquisition_date DATE,
    IN p_unit_value DECIMAL(12,2), IN p_office_id INT,
    IN p_accountable_person VARCHAR(150), IN p_physical_count INT, IN p_location VARCHAR(150),
    IN p_condition VARCHAR(20), IN p_lifecycle_status VARCHAR(30),
    IN p_qr_code_path VARCHAR(255), IN p_sha256_hash VARCHAR(64), IN p_remarks TEXT,
    OUT p_id INT
)
BEGIN
    INSERT INTO assets(
        property_number, `description`, category_id, quantity, acquisition_date,
        unit_value, office_id, accountable_person, physical_count, location, `condition`,
        lifecycle_status, qr_code_path, sha256_hash, remarks,
        is_deleted, created_at, updated_at
    ) VALUES (
        p_property_number, p_description, p_category_id, p_quantity, p_acquisition_date,
        p_unit_value, p_office_id, p_accountable_person, p_physical_count, p_location, p_condition,
        p_lifecycle_status, NULLIF(p_qr_code_path, ''), NULLIF(p_sha256_hash, ''), NULLIF(p_remarks, ''),
        FALSE, NOW(), NOW()
    );
    SET p_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_assets_update $$
CREATE PROCEDURE sp_assets_update(
    IN p_id INT, IN p_property_number VARCHAR(50), IN p_description VARCHAR(255),
    IN p_category_id INT, IN p_quantity INT, IN p_acquisition_date DATE,
    IN p_unit_value DECIMAL(12,2), IN p_office_id INT,
    IN p_accountable_person VARCHAR(150), IN p_physical_count INT, IN p_location VARCHAR(150),
    IN p_condition VARCHAR(20), IN p_lifecycle_status VARCHAR(30),
    IN p_qr_code_path VARCHAR(255), IN p_sha256_hash VARCHAR(64), IN p_remarks TEXT
)
BEGIN
    UPDATE assets SET
        property_number = p_property_number, `description` = p_description,
        category_id = p_category_id, quantity = p_quantity,
        acquisition_date = p_acquisition_date, unit_value = p_unit_value,
        office_id = p_office_id, accountable_person = p_accountable_person,
        physical_count = p_physical_count,
        location = p_location, `condition` = p_condition,
        lifecycle_status = p_lifecycle_status,
        qr_code_path = NULLIF(p_qr_code_path, ''), sha256_hash = NULLIF(p_sha256_hash, ''),
        remarks = NULLIF(p_remarks, ''), updated_at = NOW()
    WHERE asset_id = p_id AND is_deleted = FALSE;
END $$

DROP PROCEDURE IF EXISTS sp_assets_update_lifecycle $$
CREATE PROCEDURE sp_assets_update_lifecycle(IN p_id INT, IN p_lifecycle_status VARCHAR(30))
BEGIN
    UPDATE assets SET lifecycle_status = p_lifecycle_status, updated_at = NOW()
    WHERE asset_id = p_id AND is_deleted = FALSE;
END $$

DROP PROCEDURE IF EXISTS sp_assets_soft_delete $$
CREATE PROCEDURE sp_assets_soft_delete(
    IN p_id INT, IN p_deleted_by INT, IN p_deleted_by_username VARCHAR(50), IN p_reason TEXT
)
BEGIN
    INSERT INTO deleted_assets(
        asset_id, property_number, `description`, category_id, category_name,
        quantity, acquisition_date, unit_value, office_id, office_name,
        accountable_person_name, location, `condition`, lifecycle_status,
        qr_code_path, sha256_hash, remarks,
        original_created_at, original_updated_at,
        deleted_by_user_id, deleted_by_username, delete_reason, deleted_at
    )
    SELECT a.asset_id, a.property_number, a.`description`, a.category_id, c.category_name,
           a.quantity, a.acquisition_date, a.unit_value, a.office_id, o.office_name,
           a.accountable_person, a.location, a.`condition`, a.lifecycle_status,
           a.qr_code_path, a.sha256_hash, a.remarks,
           a.created_at, a.updated_at,
           p_deleted_by, p_deleted_by_username, p_reason, NOW()
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.category_id
    LEFT JOIN offices o ON a.office_id = o.office_id
    WHERE a.asset_id = p_id;

    UPDATE assets
    SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = p_deleted_by, delete_reason = p_reason
    WHERE asset_id = p_id;
END $$

-- =============================================================
-- ASSET HISTORY
-- =============================================================

DROP PROCEDURE IF EXISTS sp_asset_history_get_all $$
CREATE PROCEDURE sp_asset_history_get_all()
BEGIN
    SELECT h.history_id AS id, h.event_type AS eventType, h.event_date AS eventDate, h.notes,
           a.asset_id AS asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           u.user_id AS pb_id, u.username AS pb_username, u.full_name AS pb_fullName,
           fo.office_id AS fo_id, fo.office_name AS fo_officeName,
           too.office_id AS too_id, too.office_name AS too_officeName
    FROM asset_history h
    LEFT JOIN assets a ON h.asset_id = a.asset_id
    LEFT JOIN users u ON h.performed_by = u.user_id
    LEFT JOIN offices fo ON h.from_office_id = fo.office_id
    LEFT JOIN offices too ON h.to_office_id = too.office_id
    ORDER BY h.event_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_asset_history_search $$
CREATE PROCEDURE sp_asset_history_search(IN p_search VARCHAR(255))
BEGIN
    SET p_search = TRIM(p_search);
    SELECT h.history_id AS id, h.event_type AS eventType, h.event_date AS eventDate, h.notes,
           a.asset_id AS asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           u.user_id AS pb_id, u.username AS pb_username, u.full_name AS pb_fullName,
           fo.office_id AS fo_id, fo.office_name AS fo_officeName,
           too.office_id AS too_id, too.office_name AS too_officeName
    FROM asset_history h
    LEFT JOIN assets a ON h.asset_id = a.asset_id
    LEFT JOIN users u ON h.performed_by = u.user_id
    LEFT JOIN offices fo ON h.from_office_id = fo.office_id
    LEFT JOIN offices too ON h.to_office_id = too.office_id
    WHERE h.event_type LIKE CONCAT('%', p_search, '%')
       OR a.property_number LIKE CONCAT('%', p_search, '%')
       OR a.`description` LIKE CONCAT('%', p_search, '%')
       OR u.full_name LIKE CONCAT('%', p_search, '%')
       OR h.notes LIKE CONCAT('%', p_search, '%')
    ORDER BY h.event_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_asset_history_get_by_asset $$
CREATE PROCEDURE sp_asset_history_get_by_asset(IN p_asset_id INT)
BEGIN
    SELECT h.history_id AS id, h.event_type AS eventType, h.event_date AS eventDate, h.notes,
           a.asset_id AS asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           u.user_id AS pb_id, u.username AS pb_username, u.full_name AS pb_fullName,
           fo.office_id AS fo_id, fo.office_name AS fo_officeName,
           too.office_id AS too_id, too.office_name AS too_officeName
    FROM asset_history h
    LEFT JOIN assets a ON h.asset_id = a.asset_id
    LEFT JOIN users u ON h.performed_by = u.user_id
    LEFT JOIN offices fo ON h.from_office_id = fo.office_id
    LEFT JOIN offices too ON h.to_office_id = too.office_id
    WHERE h.asset_id = p_asset_id
    ORDER BY h.event_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_asset_history_create $$
CREATE PROCEDURE sp_asset_history_create(
    IN p_asset_id INT, IN p_event_type VARCHAR(30),
    IN p_from_office_id INT, IN p_to_office_id INT,
    IN p_performed_by INT, IN p_notes TEXT,
    OUT p_id INT
)
BEGIN
    INSERT INTO asset_history(asset_id, event_type, from_office_id, to_office_id, performed_by, event_date, notes)
    VALUES(p_asset_id, p_event_type, NULLIF(p_from_office_id, 0), NULLIF(p_to_office_id, 0),
           p_performed_by, NOW(), NULLIF(p_notes, ''));
    SET p_id = LAST_INSERT_ID();
END $$

-- =============================================================
-- MAINTENANCE LEDGER
-- =============================================================

DROP PROCEDURE IF EXISTS sp_maintenance_get_all $$
CREATE PROCEDURE sp_maintenance_get_all()
BEGIN
    SELECT m.maintenance_id AS id, m.maintenance_type AS maintenanceType,
           m.findings, m.actions_taken AS actionsTaken,
           m.maintenance_date AS maintenanceDate, m.cost, m.`status`, m.created_at AS createdAt,
           a.asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           r.user_id AS rb_id, r.username AS rb_username, r.full_name AS rb_fullName,
           m.assigned_to AS assignedTo
    FROM maintenance_ledger m
    LEFT JOIN assets a ON m.asset_id = a.asset_id
    LEFT JOIN users r ON m.recorded_by = r.user_id
    WHERE m.is_deleted = FALSE
    ORDER BY m.maintenance_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_maintenance_search $$
CREATE PROCEDURE sp_maintenance_search(IN p_search VARCHAR(255))
BEGIN
    SET p_search = TRIM(p_search);
    SELECT m.maintenance_id AS id, m.maintenance_type AS maintenanceType,
           m.findings, m.actions_taken AS actionsTaken,
           m.maintenance_date AS maintenanceDate, m.cost, m.`status`, m.created_at AS createdAt,
           a.asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           r.user_id AS rb_id, r.username AS rb_username, r.full_name AS rb_fullName,
           m.assigned_to AS assignedTo
    FROM maintenance_ledger m
    LEFT JOIN assets a ON m.asset_id = a.asset_id
    LEFT JOIN users r ON m.recorded_by = r.user_id
    WHERE m.is_deleted = FALSE
      AND (
        m.maintenance_type LIKE CONCAT('%', p_search, '%')
        OR m.findings LIKE CONCAT('%', p_search, '%')
        OR m.`status` LIKE CONCAT('%', p_search, '%')
        OR a.property_number LIKE CONCAT('%', p_search, '%')
        OR a.`description` LIKE CONCAT('%', p_search, '%')
        OR r.full_name LIKE CONCAT('%', p_search, '%')
      )
    ORDER BY m.maintenance_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_maintenance_get_by_id $$
CREATE PROCEDURE sp_maintenance_get_by_id(IN p_id INT)
BEGIN
    SELECT m.maintenance_id AS id, m.maintenance_type AS maintenanceType,
           m.findings, m.actions_taken AS actionsTaken,
           m.maintenance_date AS maintenanceDate, m.cost, m.`status`, m.created_at AS createdAt,
           a.asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           r.user_id AS rb_id, r.username AS rb_username, r.full_name AS rb_fullName,
           m.assigned_to AS assignedTo
    FROM maintenance_ledger m
    LEFT JOIN assets a ON m.asset_id = a.asset_id
    LEFT JOIN users r ON m.recorded_by = r.user_id
    WHERE m.maintenance_id = p_id AND m.is_deleted = FALSE;
END $$

DROP PROCEDURE IF EXISTS sp_maintenance_get_by_asset $$
CREATE PROCEDURE sp_maintenance_get_by_asset(IN p_asset_id INT)
BEGIN
    SELECT m.maintenance_id AS id, m.maintenance_type AS maintenanceType,
           m.findings, m.actions_taken AS actionsTaken,
           m.maintenance_date AS maintenanceDate, m.cost, m.`status`, m.created_at AS createdAt,
           a.asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           r.user_id AS rb_id, r.username AS rb_username, r.full_name AS rb_fullName,
           m.assigned_to AS assignedTo
    FROM maintenance_ledger m
    LEFT JOIN assets a ON m.asset_id = a.asset_id
    LEFT JOIN users r ON m.recorded_by = r.user_id
    WHERE m.asset_id = p_asset_id AND m.is_deleted = FALSE
    ORDER BY m.maintenance_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_maintenance_create $$
CREATE PROCEDURE sp_maintenance_create(
    IN p_asset_id INT, IN p_maintenance_type VARCHAR(20),
    IN p_findings TEXT, IN p_actions_taken TEXT,
    IN p_assigned_to VARCHAR(150), IN p_maintenance_date DATE,
    IN p_cost DECIMAL(10,2), IN p_status VARCHAR(20), IN p_recorded_by INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO maintenance_ledger(
        asset_id, maintenance_type, findings, actions_taken, assigned_to,
        maintenance_date, cost, `status`, recorded_by, is_deleted, created_at
    ) VALUES(
        p_asset_id, p_maintenance_type, p_findings, p_actions_taken, NULLIF(p_assigned_to, ''),
        p_maintenance_date, p_cost, p_status, NULLIF(p_recorded_by, 0), FALSE, NOW()
    );
    SET p_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_maintenance_update $$
CREATE PROCEDURE sp_maintenance_update(
    IN p_id INT, IN p_maintenance_type VARCHAR(20),
    IN p_findings TEXT, IN p_actions_taken TEXT,
    IN p_assigned_to VARCHAR(150), IN p_maintenance_date DATE,
    IN p_cost DECIMAL(10,2), IN p_status VARCHAR(20)
)
BEGIN
    UPDATE maintenance_ledger SET
        maintenance_type = p_maintenance_type, findings = p_findings,
        actions_taken = p_actions_taken, assigned_to = NULLIF(p_assigned_to, ''),
        maintenance_date = p_maintenance_date, cost = p_cost, `status` = p_status
    WHERE maintenance_id = p_id AND is_deleted = FALSE;
END $$

DROP PROCEDURE IF EXISTS sp_maintenance_soft_delete $$
CREATE PROCEDURE sp_maintenance_soft_delete(
    IN p_id INT, IN p_deleted_by INT, IN p_deleted_by_username VARCHAR(50), IN p_reason TEXT
)
BEGIN
    INSERT INTO deleted_maintenance(
        maintenance_id, asset_id, property_number, asset_description,
        maintenance_type, findings, actions_taken,
        assigned_to_user_id, assigned_to_name,
        maintenance_date, cost, `status`,
        recorded_by_user_id, recorded_by_name,
        original_created_at,
        deleted_by_user_id, deleted_by_username, delete_reason, deleted_at
    )
    SELECT m.maintenance_id, m.asset_id, a.property_number, a.`description`,
           m.maintenance_type, m.findings, m.actions_taken,
           NULL, m.assigned_to,
           m.maintenance_date, m.cost, m.`status`,
           m.recorded_by, r.full_name,
           m.created_at,
           p_deleted_by, p_deleted_by_username, p_reason, NOW()
    FROM maintenance_ledger m
    LEFT JOIN assets a ON m.asset_id = a.asset_id
    LEFT JOIN users r ON m.recorded_by = r.user_id
    WHERE m.maintenance_id = p_id;

    UPDATE maintenance_ledger
    SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = p_deleted_by, delete_reason = p_reason
    WHERE maintenance_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_maintenance_delete_by_asset $$
CREATE PROCEDURE sp_maintenance_delete_by_asset(IN p_asset_id INT)
BEGIN
    UPDATE maintenance_ledger
    SET is_deleted = TRUE, deleted_at = NOW()
    WHERE asset_id = p_asset_id AND is_deleted = FALSE;
END $$

-- =============================================================
-- DISPOSAL LEDGER
-- =============================================================

DROP PROCEDURE IF EXISTS sp_disposal_get_all $$
CREATE PROCEDURE sp_disposal_get_all()
BEGIN
    SELECT d.disposal_id AS id, d.reason, d.inspection_findings AS inspectionFindings,
           d.recommended_method AS recommendedMethod, d.disposal_status AS disposalStatus,
           d.inspection_date AS inspectionDate, d.created_at AS createdAt,
           a.asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           r.user_id AS rb_id, r.username AS rb_username, r.full_name AS rb_fullName,
           d.approved_by AS approvedBy
    FROM disposal_ledger d
    LEFT JOIN assets a ON d.asset_id = a.asset_id
    LEFT JOIN users r ON d.recorded_by = r.user_id
    WHERE d.is_deleted = FALSE
    ORDER BY d.inspection_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_disposal_search $$
CREATE PROCEDURE sp_disposal_search(IN p_search VARCHAR(255))
BEGIN
    SET p_search = TRIM(p_search);
    SELECT d.disposal_id AS id, d.reason, d.inspection_findings AS inspectionFindings,
           d.recommended_method AS recommendedMethod, d.disposal_status AS disposalStatus,
           d.inspection_date AS inspectionDate, d.created_at AS createdAt,
           a.asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           r.user_id AS rb_id, r.username AS rb_username, r.full_name AS rb_fullName,
           d.approved_by AS approvedBy
    FROM disposal_ledger d
    LEFT JOIN assets a ON d.asset_id = a.asset_id
    LEFT JOIN users r ON d.recorded_by = r.user_id
    WHERE d.is_deleted = FALSE
      AND (
        d.recommended_method LIKE CONCAT('%', p_search, '%')
        OR d.disposal_status LIKE CONCAT('%', p_search, '%')
        OR d.reason LIKE CONCAT('%', p_search, '%')
        OR a.property_number LIKE CONCAT('%', p_search, '%')
        OR a.`description` LIKE CONCAT('%', p_search, '%')
        OR r.full_name LIKE CONCAT('%', p_search, '%')
      )
    ORDER BY d.inspection_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_disposal_get_by_id $$
CREATE PROCEDURE sp_disposal_get_by_id(IN p_id INT)
BEGIN
    SELECT d.disposal_id AS id, d.reason, d.inspection_findings AS inspectionFindings,
           d.recommended_method AS recommendedMethod, d.disposal_status AS disposalStatus,
           d.inspection_date AS inspectionDate, d.created_at AS createdAt,
           a.asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           r.user_id AS rb_id, r.username AS rb_username, r.full_name AS rb_fullName,
           d.approved_by AS approvedBy
    FROM disposal_ledger d
    LEFT JOIN assets a ON d.asset_id = a.asset_id
    LEFT JOIN users r ON d.recorded_by = r.user_id
    WHERE d.disposal_id = p_id AND d.is_deleted = FALSE;
END $$

DROP PROCEDURE IF EXISTS sp_disposal_get_by_asset $$
CREATE PROCEDURE sp_disposal_get_by_asset(IN p_asset_id INT)
BEGIN
    SELECT d.disposal_id AS id, d.reason, d.inspection_findings AS inspectionFindings,
           d.recommended_method AS recommendedMethod, d.disposal_status AS disposalStatus,
           d.inspection_date AS inspectionDate, d.created_at AS createdAt,
           a.asset_id, a.property_number AS asset_propertyNumber, a.`description` AS asset_description,
           r.user_id AS rb_id, r.username AS rb_username, r.full_name AS rb_fullName,
           d.approved_by AS approvedBy
    FROM disposal_ledger d
    LEFT JOIN assets a ON d.asset_id = a.asset_id
    LEFT JOIN users r ON d.recorded_by = r.user_id
    WHERE d.asset_id = p_asset_id AND d.is_deleted = FALSE
    ORDER BY d.inspection_date DESC;
END $$

DROP PROCEDURE IF EXISTS sp_disposal_create $$
CREATE PROCEDURE sp_disposal_create(
    IN p_asset_id INT, IN p_reason TEXT, IN p_inspection_findings TEXT,
    IN p_recommended_method VARCHAR(20), IN p_disposal_status VARCHAR(20),
    IN p_inspection_date DATE, IN p_approved_by VARCHAR(150), IN p_recorded_by INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO disposal_ledger(
        asset_id, reason, inspection_findings, recommended_method,
        disposal_status, inspection_date, approved_by, recorded_by,
        is_deleted, created_at
    ) VALUES(
        p_asset_id, p_reason, p_inspection_findings, p_recommended_method,
        p_disposal_status, p_inspection_date, NULLIF(p_approved_by, ''), NULLIF(p_recorded_by, 0),
        FALSE, NOW()
    );
    SET p_id = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_disposal_update $$
CREATE PROCEDURE sp_disposal_update(
    IN p_id INT, IN p_reason TEXT, IN p_inspection_findings TEXT,
    IN p_recommended_method VARCHAR(20), IN p_disposal_status VARCHAR(20),
    IN p_inspection_date DATE, IN p_approved_by VARCHAR(150)
)
BEGIN
    UPDATE disposal_ledger SET
        reason = p_reason, inspection_findings = p_inspection_findings,
        recommended_method = p_recommended_method, disposal_status = p_disposal_status,
        inspection_date = p_inspection_date, approved_by = NULLIF(p_approved_by, '')
    WHERE disposal_id = p_id AND is_deleted = FALSE;
END $$

DROP PROCEDURE IF EXISTS sp_disposal_soft_delete $$
CREATE PROCEDURE sp_disposal_soft_delete(
    IN p_id INT, IN p_deleted_by INT, IN p_deleted_by_username VARCHAR(50), IN p_reason TEXT
)
BEGIN
    INSERT INTO deleted_disposal(
        disposal_id, asset_id, property_number, asset_description,
        reason, inspection_findings, recommended_method,
        disposal_status, inspection_date,
        approved_by_user_id, approved_by_name,
        recorded_by_user_id, recorded_by_name,
        original_created_at,
        deleted_by_user_id, deleted_by_username, delete_reason, deleted_at
    )
    SELECT d.disposal_id, d.asset_id, a.property_number, a.`description`,
           d.reason, d.inspection_findings, d.recommended_method,
           d.disposal_status, d.inspection_date,
           NULL, d.approved_by,
           d.recorded_by, r.full_name,
           d.created_at,
           p_deleted_by, p_deleted_by_username, p_reason, NOW()
    FROM disposal_ledger d
    LEFT JOIN assets a ON d.asset_id = a.asset_id
    LEFT JOIN users r ON d.recorded_by = r.user_id
    WHERE d.disposal_id = p_id;

    UPDATE disposal_ledger
    SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = p_deleted_by, delete_reason = p_reason
    WHERE disposal_id = p_id;
END $$

DROP PROCEDURE IF EXISTS sp_disposal_delete_by_asset $$
CREATE PROCEDURE sp_disposal_delete_by_asset(IN p_asset_id INT)
BEGIN
    UPDATE disposal_ledger
    SET is_deleted = TRUE, deleted_at = NOW()
    WHERE asset_id = p_asset_id AND is_deleted = FALSE;
END $$

-- =============================================================
-- AUDIT LOGS
-- =============================================================

DROP PROCEDURE IF EXISTS sp_audit_logs_get_all $$
CREATE PROCEDURE sp_audit_logs_get_all()
BEGIN
    SELECT l.log_id AS id, l.action, l.module, l.target_id AS targetId,
           l.target_type AS targetType, l.details, l.ip_address AS ipAddress,
           l.logged_at AS loggedAt,
           u.user_id AS u_id, u.username AS u_username, u.full_name AS u_fullName
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.user_id
    ORDER BY l.logged_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_audit_logs_search $$
CREATE PROCEDURE sp_audit_logs_search(IN p_search VARCHAR(255))
BEGIN
    SET p_search = TRIM(p_search);
    SELECT l.log_id AS id, l.action, l.module, l.target_id AS targetId,
           l.target_type AS targetType, l.details, l.ip_address AS ipAddress,
           l.logged_at AS loggedAt,
           u.user_id AS u_id, u.username AS u_username, u.full_name AS u_fullName
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.user_id
    WHERE l.action LIKE CONCAT('%', p_search, '%')
       OR l.module LIKE CONCAT('%', p_search, '%')
       OR l.details LIKE CONCAT('%', p_search, '%')
       OR u.username LIKE CONCAT('%', p_search, '%')
       OR u.full_name LIKE CONCAT('%', p_search, '%')
    ORDER BY l.logged_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_audit_logs_create $$
CREATE PROCEDURE sp_audit_logs_create(
    IN p_user_id INT, IN p_action VARCHAR(100), IN p_module VARCHAR(50),
    IN p_target_id INT, IN p_target_type VARCHAR(50),
    IN p_details TEXT, IN p_ip_address VARCHAR(45),
    OUT p_id INT
)
BEGIN
    INSERT INTO audit_logs(user_id, action, module, target_id, target_type, details, ip_address, logged_at)
    VALUES(p_user_id, p_action, p_module, NULLIF(p_target_id, 0), NULLIF(p_target_type, ''),
           NULLIF(p_details, ''), NULLIF(p_ip_address, ''), NOW());
    SET p_id = LAST_INSERT_ID();
END $$

DELIMITER ;

-- Maintenance and Disposable Fix
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_maintenance_delete_by_asset $$
CREATE PROCEDURE sp_maintenance_delete_by_asset(IN p_asset_id INT)
BEGIN
    UPDATE maintenance_ledger
    SET is_deleted = TRUE, deleted_at = NOW()
    WHERE asset_id = p_asset_id AND is_deleted = FALSE;
END $$

DROP PROCEDURE IF EXISTS sp_disposal_delete_by_asset $$
CREATE PROCEDURE sp_disposal_delete_by_asset(IN p_asset_id INT)
BEGIN
    UPDATE disposal_ledger
    SET is_deleted = TRUE, deleted_at = NOW()
    WHERE asset_id = p_asset_id AND is_deleted = FALSE;
END $$
DELIMITER ;

-- =============================================================
-- END OF STORED PROCEDURES
-- Total: 54 stored procedures covering all CRUD + search + auth
-- =============================================================
