package com.sanjose.inventory.service;

import com.sanjose.inventory.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${auth.max-failed-attempts:3}")
    private int maxFailedAttempts;

    @Value("${auth.lockout-minutes:15}")
    private int lockoutMinutes;

    @Value("${auth.forgot-password-cooldown-minutes:15}")
    private int forgotPasswordCooldownMinutes;

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private record LoginUserData(
        Long id, String username, String password, String fullName, String role,
        Boolean isActive, Integer failedLoginAttempts, LocalDateTime accountLockedUntil
    ) {}

    private record ForgotPasswordUserData(
        Long id, String username, Boolean isActive, LocalDateTime lastPasswordResetAt
    ) {}

    @Transactional
    public Map<String, Object> login(String identifier, String password) {
        if (identifier == null || identifier.isBlank())
            throw new BadCredentialsException("Invalid credentials");

        List<LoginUserData> rows = jdbcTemplate.query(
            "CALL sp_auth_get_user_for_login(?)",
            (rs, rn) -> {
                Timestamp lockTs = rs.getTimestamp("accountLockedUntil");
                return new LoginUserData(
                    rs.getLong("id"),
                    rs.getString("username"),
                    rs.getString("password"),
                    rs.getString("fullName"),
                    rs.getString("role"),
                    rs.getObject("isActive", Boolean.class),
                    rs.getObject("failedLoginAttempts", Integer.class),
                    lockTs != null ? lockTs.toLocalDateTime() : null
                );
            },
            identifier);

        if (rows.isEmpty()) throw new BadCredentialsException("Invalid credentials");
        LoginUserData user = rows.get(0);

        if (!Boolean.TRUE.equals(user.isActive()))
            throw new LockedException("Account is deactivated");

        if (user.accountLockedUntil() != null && LocalDateTime.now().isBefore(user.accountLockedUntil()))
            throw new LockedException("Account is temporarily locked. Try again after " + lockoutMinutes + " minutes.");

        if (!passwordEncoder.matches(password, user.password())) {
            jdbcTemplate.update("CALL sp_auth_login_failure(?, ?, ?)",
                user.id(), maxFailedAttempts, lockoutMinutes);
            throw new BadCredentialsException("Invalid credentials");
        }

        jdbcTemplate.update("CALL sp_auth_login_success(?)", user.id());

        String token = jwtUtil.generateToken(user.username());

        return Map.of(
            "token", token,
            "user", Map.of(
                "id",       user.id(),
                "username", user.username(),
                "fullName", user.fullName(),
                "role",     user.role()
            )
        );
    }

    @Transactional
    public void forgotPassword(String username, String newPassword) {
        List<ForgotPasswordUserData> rows = jdbcTemplate.query(
            "CALL sp_auth_get_user_for_forgot_password(?)",
            (rs, rn) -> {
                Timestamp lastResetTs = rs.getTimestamp("lastPasswordResetAt");
                return new ForgotPasswordUserData(
                    rs.getLong("id"),
                    rs.getString("username"),
                    rs.getObject("isActive", Boolean.class),
                    lastResetTs != null ? lastResetTs.toLocalDateTime() : null
                );
            },
            username);

        // Unknown username: no-op rather than reveal whether the account exists.
        if (rows.isEmpty()) return;
        ForgotPasswordUserData user = rows.get(0);
        if (!Boolean.TRUE.equals(user.isActive())) return;

        if (user.lastPasswordResetAt() != null) {
            LocalDateTime nextAllowed = user.lastPasswordResetAt().plusMinutes(forgotPasswordCooldownMinutes);
            if (LocalDateTime.now().isBefore(nextAllowed)) {
                long minutesLeft = java.time.Duration.between(LocalDateTime.now(), nextAllowed).toMinutes() + 1;
                throw new IllegalStateException(
                    "A password was already reset recently. Please try again in " + minutesLeft + " minute(s).");
            }
        }

        jdbcTemplate.update("CALL sp_auth_forgot_password_reset(?, ?)",
            user.id(), passwordEncoder.encode(newPassword));
    }
}
