package com.sanjose.inventory;

import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("Administrator", "admin@sjmh.gov.ph", "admin123", "admin");
        seedUser("ICT Officer",   "ict@sjmh.gov.ph",   "ict2024",  "staff");
    }

    private void seedUser(String name, String email, String password, String role) {
        userRepository.findByEmail(email).ifPresentOrElse(
            existing -> {
                existing.setPassword(passwordEncoder.encode(password));
                userRepository.save(existing);
                log.info("Reset password for seed user: {}", email);
            },
            () -> {
                userRepository.save(User.builder()
                        .name(name)
                        .email(email)
                        .password(passwordEncoder.encode(password))
                        .role(role)
                        .build());
                log.info("Seeded user: {}", email);
            }
        );
    }
}
