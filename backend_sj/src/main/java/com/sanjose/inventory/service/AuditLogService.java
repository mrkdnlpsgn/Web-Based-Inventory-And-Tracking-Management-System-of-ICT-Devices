package com.sanjose.inventory.service;

import com.sanjose.inventory.config.SpHelper;
import com.sanjose.inventory.entity.AuditLog;
import com.sanjose.inventory.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<AuditLog> LOG_MAPPER = (rs, rn) -> {
        AuditLog entry = new AuditLog();
        entry.setId(rs.getLong("id"));
        entry.setAction(rs.getString("action"));
        entry.setModule(rs.getString("module"));
        entry.setTargetId(rs.getObject("targetId", Long.class));
        entry.setTargetType(rs.getString("targetType"));
        entry.setDetails(rs.getString("details"));
        entry.setIpAddress(rs.getString("ipAddress"));
        Timestamp ts = rs.getTimestamp("loggedAt");
        entry.setLoggedAt(ts != null ? ts.toLocalDateTime() : null);
        Long uid = rs.getObject("u_id", Long.class);
        if (uid != null) {
            User u = new User();
            u.setId(uid);
            u.setUsername(rs.getString("u_username"));
            u.setFullName(rs.getString("u_fullName"));
            entry.setUser(u);
        }
        return entry;
    };

    public List<AuditLog> findAll(String search) {
        if (search != null && !search.isBlank()) {
            return jdbcTemplate.query("CALL sp_audit_logs_search(?)", LOG_MAPPER, search.trim());
        }
        return jdbcTemplate.query("CALL sp_audit_logs_get_all()", LOG_MAPPER);
    }

    public void log(String action, String module, Long targetId, String targetType, String details) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            List<Long> ids = jdbcTemplate.query(
                "CALL sp_users_get_by_username(?)", (rs, rn) -> rs.getLong("id"), username);
            if (ids.isEmpty()) return;
            Long userId = ids.get(0);
            SpHelper.callWithOutLong(jdbcTemplate,
                "CALL sp_audit_logs_create(?, ?, ?, ?, ?, ?, ?, ?)",
                userId, action, module,
                targetId != null ? targetId.intValue() : null,
                targetType, details, null);
        } catch (Exception e) {
            log.warn("Audit log failed: {}", e.getMessage());
        }
    }
}
