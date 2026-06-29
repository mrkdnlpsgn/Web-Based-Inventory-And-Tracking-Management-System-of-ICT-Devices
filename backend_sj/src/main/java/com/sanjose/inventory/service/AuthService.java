package com.sanjose.inventory.service;

import com.sanjose.inventory.config.JwtUtil;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${auth.max-failed-attempts:3}")
    private int maxFailedAttempts;

    @Value("${auth.lockout-minutes:15}")
    private int lockoutMinutes;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public Map<String, Object> login(String identifier, String password) {
        if (identifier == null || identifier.isBlank())
            throw new BadCredentialsException("Invalid credentials");

        User user = userRepository.findByUsernameIgnoreCase(identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!Boolean.TRUE.equals(user.getIsActive()))
            throw new LockedException("Account is deactivated");

        if (user.getAccountLockedUntil() != null
                && LocalDateTime.now().isBefore(user.getAccountLockedUntil())) {
            throw new LockedException("Account is temporarily locked. Try again after " + lockoutMinutes + " minutes.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= maxFailedAttempts) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(lockoutMinutes));
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid credentials");
        }

        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());

        Map<String, Object> userInfo = Map.of(
                "id",       user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "role",     user.getRole());

        return Map.of("token", token, "user", userInfo);
    }
}
