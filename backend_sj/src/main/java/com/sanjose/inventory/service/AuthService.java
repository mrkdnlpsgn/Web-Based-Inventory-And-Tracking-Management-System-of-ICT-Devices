package com.sanjose.inventory.service;

import com.sanjose.inventory.config.JwtUtil;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int    MAX_FAILED_ATTEMPTS = 3;
    private static final int    LOCKOUT_MINUTES     = 15;

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil         jwtUtil;

    @Transactional
    public Map<String, Object> login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        // Account lockout check
        if (user.getAccountLockedUntil() != null
                && LocalDateTime.now().isBefore(user.getAccountLockedUntil())) {
            log.warn("Login attempted on locked account: {}", email);
            throw new LockedException("Account is temporarily locked. Try again after "
                    + LOCKOUT_MINUTES + " minutes.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                log.warn("Account locked after {} failed attempts: {}", attempts, email);
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid credentials");
        }

        // Successful login — reset lockout counters
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(email);

        Map<String, Object> userInfo = Map.of(
                "id",    user.getId(),
                "name",  user.getName(),
                "email", user.getEmail(),
                "role",  user.getRole());

        return Map.of("token", token, "user", userInfo);
    }
}
