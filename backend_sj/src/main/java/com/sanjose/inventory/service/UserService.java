package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.UserRequest;
import com.sanjose.inventory.dto.UserResponse;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Set<String> VALID_ROLES = Set.of("admin", "staff");

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse findById(Long id) {
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id)));
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        validateRole(request.role());

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role().toLowerCase())
                .build();

        User saved = userRepository.save(user);

        auditLogService.log("CREATE", "USER",
                "Created account for " + request.name() + " with role " + request.role());

        return toResponse(saved);
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        validateRole(request.role());

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role().toLowerCase());

        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        User saved = userRepository.save(user);

        auditLogService.log("UPDATE", "USER", "Updated account for " + request.name());

        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id, String currentUserEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new IllegalStateException("You cannot delete your own account");
        }

        userRepository.deleteById(id);

        auditLogService.log("DELETE", "USER", "Deleted account: " + user.getName());
    }

    private void validateRole(String role) {
        if (role == null || !VALID_ROLES.contains(role.toLowerCase())) {
            throw new IllegalArgumentException("Invalid role. Must be 'admin' or 'staff'.");
        }
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
