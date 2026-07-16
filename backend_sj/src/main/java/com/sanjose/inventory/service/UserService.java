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

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private static final Set<String> VALID_ROLES = Set.of("ADMIN", "STAFF");

    // ambiguous-looking characters (0/O, 1/l/I) excluded so a printed/typed
    // temporary password isn't misread
    private static final String GEN_UPPER   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String GEN_LOWER   = "abcdefghijkmnopqrstuvwxyz";
    private static final String GEN_DIGITS  = "23456789";
    private static final String GEN_SPECIAL = "@$!%*?&_#^";
    private static final int    GEN_LENGTH  = 12;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    private static String resolveRole(String role, String fallback) {
        if (role == null || role.isBlank()) return fallback;
        String normalized = role.toUpperCase();
        if (!VALID_ROLES.contains(normalized)) {
            throw new IllegalArgumentException("Invalid role: " + role + " (must be ADMIN or STAFF)");
        }
        return normalized;
    }

    // guarantees at least one char from each required class, matching @StrongPassword's rules
    private static String generatePassword() {
        List<Character> chars = new ArrayList<>();
        chars.add(GEN_UPPER.charAt(RANDOM.nextInt(GEN_UPPER.length())));
        chars.add(GEN_LOWER.charAt(RANDOM.nextInt(GEN_LOWER.length())));
        chars.add(GEN_DIGITS.charAt(RANDOM.nextInt(GEN_DIGITS.length())));
        chars.add(GEN_SPECIAL.charAt(RANDOM.nextInt(GEN_SPECIAL.length())));
        String all = GEN_UPPER + GEN_LOWER + GEN_DIGITS + GEN_SPECIAL;
        for (int i = chars.size(); i < GEN_LENGTH; i++) {
            chars.add(all.charAt(RANDOM.nextInt(all.length())));
        }
        Collections.shuffle(chars, RANDOM);
        StringBuilder sb = new StringBuilder(chars.size());
        chars.forEach(sb::append);
        return sb.toString();
    }

    private static final RowMapper<UserResponse> USER_MAPPER = (rs, rn) ->
        UserResponse.builder()
            .id(rs.getLong("id"))
            .username(rs.getString("username"))
            .email(rs.getString("email"))
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
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            Boolean emailExists = SpHelper.callWithOutBoolean(jdbcTemplate,
                "CALL sp_users_email_exists(?, ?, ?)", req.getEmail(), 0);
            if (Boolean.TRUE.equals(emailExists)) {
                throw new IllegalArgumentException("Email already in use: " + req.getEmail());
            }
        }
        boolean generate = Boolean.TRUE.equals(req.getGeneratePassword());
        String plainPassword;
        if (generate) {
            if (req.getEmail() == null || req.getEmail().isBlank()) {
                throw new IllegalArgumentException("Email is required to auto-generate and send a password.");
            }
            if (!emailService.isEnabled()) {
                throw new IllegalArgumentException(
                    "Email notifications aren't configured — set a password manually instead.");
            }
            plainPassword = generatePassword();
        } else {
            if (req.getPassword() == null || req.getPassword().isBlank()) {
                throw new IllegalArgumentException("Password is required.");
            }
            plainPassword = req.getPassword();
        }
        String hash = passwordEncoder.encode(plainPassword);
        Long newId = SpHelper.callWithOutLong(jdbcTemplate,
            "CALL sp_users_create(?, ?, ?, ?, ?, ?, ?, ?)",
            req.getUsername(), req.getEmail(), hash, req.getFullName(),
            resolveRole(req.getRole(), "STAFF"),
            req.getOfficeId() != null ? req.getOfficeId().intValue() : 0,
            req.getIsActive() != null ? req.getIsActive() : true);
        UserResponse saved = findById(newId);
        auditLogService.log("USER_CREATED", "Users", newId, "user", "Created: " + saved.getUsername());
        if (generate) {
            String html = "<p>A San Jose GSO Inventory Management System account has been created for you.</p>"
                + "<p><b>Username:</b> " + saved.getUsername() + "</p>"
                + "<p><b>Temporary Password:</b> "
                + "<span style=\"font-family:monospace;font-size:16px;\">" + plainPassword + "</span></p>"
                + "<p>Please log in and change this password as soon as possible.</p>";
            emailService.send(saved.getEmail(), "Your San Jose GSO Inventory account has been created", html);
        }
        return saved;
    }

    public UserResponse update(Long id, UserRequest req) {
        UserResponse existing = findById(id);
        String newEmail = req.getEmail() != null ? req.getEmail() : existing.getEmail();
        if (newEmail != null && !newEmail.isBlank()) {
            Boolean emailExists = SpHelper.callWithOutBoolean(jdbcTemplate,
                "CALL sp_users_email_exists(?, ?, ?)", newEmail, id.intValue());
            if (Boolean.TRUE.equals(emailExists)) {
                throw new IllegalArgumentException("Email already in use: " + newEmail);
            }
        }
        String hash = (req.getPassword() != null && !req.getPassword().isBlank())
            ? passwordEncoder.encode(req.getPassword()) : null;
        jdbcTemplate.update("CALL sp_users_update(?, ?, ?, ?, ?, ?, ?)",
            id,
            newEmail,
            req.getFullName() != null ? req.getFullName() : existing.getFullName(),
            resolveRole(req.getRole(), existing.getRole()),
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
        // admin-set password is a temp password too — force the user to pick their own
        jdbcTemplate.update("UPDATE users SET must_change_password = TRUE WHERE user_id = ?", id);
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
        jdbcTemplate.update("UPDATE users SET must_change_password = FALSE WHERE user_id = ?", userId);
        auditLogService.log("USER_PASSWORD_CHANGED", "Users", userId, "user",
            "Self-service password change: " + username);
    }
}
