package com.sanjose.inventory.service;

import com.sanjose.inventory.config.SpHelper;
import com.sanjose.inventory.dto.UserRequest;
import com.sanjose.inventory.dto.UserResponse;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    private static final RowMapper<UserResponse> USER_MAPPER = (rs, rn) ->
        UserResponse.builder()
            .id(rs.getLong("id"))
            .username(rs.getString("username"))
            .fullName(rs.getString("fullName"))
            .role(rs.getString("role"))
            .isActive(rs.getObject("isActive", Boolean.class))
            .officeId(rs.getObject("office_id", Long.class))
            .officeName(rs.getString("office_officeName"))
            .build();

    public List<UserResponse> findAll(String search) {
        if (search != null && !search.isBlank()) {
            return jdbcTemplate.query("CALL sp_users_search(?)", USER_MAPPER, search.trim());
        }
        return jdbcTemplate.query("CALL sp_users_get_all()", USER_MAPPER);
    }

    public UserResponse findById(Long id) {
        List<UserResponse> list = jdbcTemplate.query("CALL sp_users_get_by_id(?)", USER_MAPPER, id);
        if (list.isEmpty()) throw new ResourceNotFoundException("User not found: " + id);
        return list.get(0);
    }

    public UserResponse create(UserRequest req) {
        Boolean exists = SpHelper.callWithOutBoolean(jdbcTemplate,
            "CALL sp_users_username_exists(?, ?)", req.getUsername());
        if (Boolean.TRUE.equals(exists)) {
            throw new IllegalArgumentException("Username already exists: " + req.getUsername());
        }
        String hash = passwordEncoder.encode(
            req.getPassword() != null && !req.getPassword().isBlank() ? req.getPassword() : "changeme123");
        Long newId = SpHelper.callWithOutLong(jdbcTemplate,
            "CALL sp_users_create(?, ?, ?, ?, ?, ?, ?)",
            req.getUsername(), hash, req.getFullName(),
            req.getRole() != null ? req.getRole().toUpperCase() : "STAFF",
            req.getOfficeId() != null ? req.getOfficeId().intValue() : 0,
            req.getIsActive() != null ? req.getIsActive() : true);
        UserResponse saved = findById(newId);
        auditLogService.log("USER_CREATED", "Users", newId, "user", "Created: " + saved.getUsername());
        return saved;
    }

    public UserResponse update(Long id, UserRequest req) {
        UserResponse existing = findById(id);
        String hash = (req.getPassword() != null && !req.getPassword().isBlank())
            ? passwordEncoder.encode(req.getPassword()) : null;
        jdbcTemplate.update("CALL sp_users_update(?, ?, ?, ?, ?, ?)",
            id,
            req.getFullName() != null ? req.getFullName() : existing.getFullName(),
            req.getRole() != null ? req.getRole().toUpperCase() : existing.getRole(),
            req.getOfficeId() != null ? req.getOfficeId().intValue() : 0,
            req.getIsActive() != null ? req.getIsActive() : existing.getIsActive(),
            hash);
        UserResponse saved = findById(id);
        auditLogService.log("USER_UPDATED", "Users", id, "user", "Updated: " + saved.getUsername());
        return saved;
    }

    public void delete(Long id) {
        UserResponse user = findById(id);
        jdbcTemplate.update("CALL sp_users_delete(?)", id);
        auditLogService.log("USER_DELETED", "Users", id, "user", "Deleted: " + user.getUsername());
    }

    public void resetPassword(Long id, String newPassword) {
        UserResponse user = findById(id);
        jdbcTemplate.update("CALL sp_users_change_password(?, ?)",
            id, passwordEncoder.encode(newPassword));
        jdbcTemplate.update("CALL sp_auth_login_success(?)", id);
        auditLogService.log("USER_PASSWORD_RESET", "Users", id, "user",
            "Password reset by administrator: " + user.getUsername());
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        List<Object[]> rows = jdbcTemplate.query(
            "CALL sp_users_get_by_username(?)",
            (rs, rn) -> new Object[]{ rs.getLong("id"), rs.getString("password") },
            username);
        if (rows.isEmpty()) throw new ResourceNotFoundException("User not found: " + username);
        Long userId = (Long) rows.get(0)[0];
        String storedHash = (String) rows.get(0)[1];
        if (!passwordEncoder.matches(currentPassword, storedHash)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        jdbcTemplate.update("CALL sp_users_change_password(?, ?)",
            userId, passwordEncoder.encode(newPassword));
    }
}
